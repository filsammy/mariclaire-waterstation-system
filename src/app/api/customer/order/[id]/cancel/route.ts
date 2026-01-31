import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const cancelOrderSchema = z.object({
    reason: z.string().optional()
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { reason } = cancelOrderSchema.parse(body);

        // Get customer profile
        const customer = await prisma.customer.findUnique({
            where: { userId: session.user.id }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        // Get order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order || order.customerId !== customer.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Validate order can be cancelled
        const cancellableStatuses = ["PENDING", "DELIVERY_FAILED", "ESCALATED_TO_ADMIN"];
        if (!cancellableStatuses.includes(order.status)) {
            return NextResponse.json({
                error: "Order cannot be cancelled at this stage."
            }, { status: 400 });
        }

        // Update order status to CANCELLED
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id },
                data: {
                    status: "CANCELLED"
                }
            });

            // Create order history entry
            // @ts-ignore - Prisma client needs regeneration
            await tx.orderHistory.create({
                data: {
                    orderId: id,
                    status: "CANCELLED",
                    description: reason
                        ? `Customer cancelled order. Reason: ${reason}`
                        : "Customer cancelled order",
                    createdBy: session.user.id
                }
            });

            return updated;
        });

        return NextResponse.json({
            order: updatedOrder,
            message: "Order cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Order Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
