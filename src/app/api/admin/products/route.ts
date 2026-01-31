import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createProductSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    price: z.number().positive("Price must be positive"),
    type: z.enum(["WATER", "CONTAINER"]),
    description: z.string().optional(),
    initialStock: z.number().int().nonnegative("Stock must be non-negative").optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { name, price, type, description, initialStock } = createProductSchema.parse(body);

        // Create product and inventory in transaction
        const product = await prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    name,
                    price,
                    type,
                    unit: type === "WATER" ? "gallon" : "piece", // Default unit based on type
                    description,
                    isActive: true,
                },
            });

            // Create inventory record if initialStock provided
            if (initialStock !== undefined) {
                await tx.inventory.create({
                    data: {
                        productId: newProduct.id,
                        currentStock: initialStock,
                    },
                });
            }

            return newProduct;
        });

        return NextResponse.json({ product, message: "Product created successfully" });
    } catch (error) {
        console.error("Create Product Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
