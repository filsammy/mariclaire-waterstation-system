import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(["WATER", "CONTAINER"]),
    price: z.number().min(0),
    unit: z.string().min(1),
    initialStock: z.number().int().min(0),
    minStock: z.number().int().min(0),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const result = productSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, description, type, price, unit, initialStock, minStock } = result.data;

        // Transaction to create product + inventory
        const product = await prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    name,
                    description,
                    type,
                    price,
                    unit,
                    // Only set WaterType to MINERAL for now if type is WATER
                    waterType: type === "WATER" ? "MINERAL" : null,
                },
            });

            await tx.inventory.create({
                data: {
                    productId: newProduct.id,
                    currentStock: initialStock,
                    minStock,
                },
            });

            return newProduct;
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error("Create Product Error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            include: {
                inventory: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
