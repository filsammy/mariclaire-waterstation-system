import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const rejectOrderSchema = z.object({
    reason: z.string().min(1, "Rejection reason is required")
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params; // This is the order ID
        const body = await req.json();
        const { reason } = rejectOrderSchema.parse(body);

        // Get order
        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Update order status to REJECTED
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id },
                data: {
                    status: "REJECTED"
                }
            });

            // Create order history entry
            // @ts-ignore - Prisma client needs regeneration
            await tx.orderHistory.create({
                data: {
                    orderId: id,
                    status: "REJECTED",
                    description: `Admin rejected order. Reason: ${reason}`,
                    createdBy: session.user.id
                }
            });

            return updated;
        });

        return NextResponse.json({
            order: updatedOrder,
            message: "Order rejected"
        });

    } catch (error) {
        console.error("Reject Order Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
