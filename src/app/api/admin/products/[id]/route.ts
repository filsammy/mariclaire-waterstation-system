import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateProductSchema = z.object({
    name: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const data = updateProductSchema.parse(body);

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        return NextResponse.json({ product, message: "Product updated successfully" });
    } catch (error) {
        console.error("Update Product Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get("permanent") === "true";

        let product;
        let message;

        if (permanent) {
            // Hard delete
            product = await prisma.product.delete({
                where: { id },
            });
            message = "Product deleted permanently";
        } else {
            // Soft delete - set isActive to false
            product = await prisma.product.update({
                where: { id },
                data: { isActive: false },
            });
            message = "Product deactivated successfully";
        }

        return NextResponse.json({ product, message });
    } catch (error) {
        console.error("Delete Product Error:", error);
        return NextResponse.json({ error: "Failed to deactivate product" }, { status: 500 });
    }
}
