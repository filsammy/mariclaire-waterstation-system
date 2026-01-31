import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

        // Get customer profile
        const customer = await prisma.customer.findUnique({
            where: { userId: session.user.id }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        // Get order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id },
            include: { delivery: true }
        });

        if (!order || order.customerId !== customer.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Validate order can be retried
        if (order.status !== "DELIVERY_FAILED") {
            return NextResponse.json({
                error: "Order cannot be retried. Only failed deliveries can be retried."
            }, { status: 400 });
        }

        // @ts-ignore - Prisma client needs regeneration
        if (order.deliveryAttempts >= 2) {
            return NextResponse.json({
                error: "Maximum retry attempts reached. Please contact support."
            }, { status: 400 });
        }

        // Update order status back to OUT_FOR_DELIVERY and reset delivery status
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Update order status
            const updated = await tx.order.update({
                where: { id },
                data: {
                    status: "OUT_FOR_DELIVERY"
                }
            });

            // Update delivery status back to IN_TRANSIT so it shows in rider tasks
            if (order.delivery) {
                await tx.delivery.update({
                    where: { id: order.delivery.id },
                    data: {
                        status: "IN_TRANSIT"
                    }
                });
            }

            // Create order history entry
            // @ts-ignore - Prisma client needs regeneration
            await tx.orderHistory.create({
                data: {
                    orderId: id,
                    status: "OUT_FOR_DELIVERY",
                    description: "Customer requested delivery retry",
                    createdBy: session.user.id
                }
            });

            return updated;
        });

        return NextResponse.json({
            order: updatedOrder,
            message: "Delivery retry requested. The rider has been notified."
        });

    } catch (error) {
        console.error("Retry Order Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
