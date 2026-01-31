import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateDeliverySchema = z.object({
    status: z.enum(["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"]),
    notes: z.string().optional(),
    failureReason: z.string().optional()
}).refine(data => {
    // Require failureReason when status is FAILED
    if (data.status === "FAILED") {
        return !!data.failureReason;
    }
    return true;
}, {
    message: "Failure reason is required when marking delivery as failed"
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "DELIVERY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const result = updateDeliverySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({
                error: "Invalid request",
                details: result.error.issues
            }, { status: 400 });
        }

        const { status, notes, failureReason } = result.data;

        // Verify ownership
        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                rider: { include: { user: true } },
                order: true
            }
        });

        if (!delivery || delivery.rider.userId !== session.user.id) {
            return NextResponse.json({ error: "Delivery not found or not assigned to you" }, { status: 404 });
        }

        // Verify rider is ACTIVE
        if (delivery.rider.user.status !== "ACTIVE") {
            return NextResponse.json({ error: "Account inactive. You cannot perform this action." }, { status: 403 });
        }

        // Transaction to update Delivery AND Order status
        const updatedDelivery = await prisma.$transaction(async (tx) => {
            const d = await tx.delivery.update({
                where: { id },
                data: {
                    status,
                    notes,
                    pickedUpAt: status === 'PICKED_UP' ? new Date() : undefined,
                    deliveredAt: status === 'DELIVERED' ? new Date() : undefined
                }
            });

            // Map Delivery Status -> Order Status
            let orderStatus = undefined;
            let orderUpdate: any = {};

            if (status === 'PICKED_UP') {
                orderStatus = 'OUT_FOR_DELIVERY';
            } else if (status === 'IN_TRANSIT') {
                orderStatus = 'OUT_FOR_DELIVERY';
            } else if (status === 'DELIVERED') {
                orderStatus = 'DELIVERED';
            } else if (status === 'FAILED') {
                // Increment delivery attempts
                const newAttempts = delivery.order.deliveryAttempts + 1;

                // Add failure reason to array
                const updatedReasons = [...delivery.order.failureReasons, failureReason || "No reason provided"];

                orderUpdate = {
                    deliveryAttempts: newAttempts,
                    failureReasons: updatedReasons
                };

                if (newAttempts === 1) {
                    // First failure - allow customer to retry
                    orderStatus = 'DELIVERY_FAILED';
                } else if (newAttempts >= 2) {
                    // Second failure - escalate to admin
                    orderStatus = 'ESCALATED_TO_ADMIN';
                    orderUpdate.escalatedToAdmin = true;
                    orderUpdate.escalatedAt = new Date();
                }
            }

            if (orderStatus) {
                orderUpdate.status = orderStatus;
                await tx.order.update({
                    where: { id: delivery.orderId },
                    data: orderUpdate
                });

                // Create order history entry
                await tx.orderHistory.create({
                    data: {
                        orderId: delivery.orderId,
                        status: orderStatus,
                        description: status === 'FAILED'
                            ? `Delivery attempt ${orderUpdate.deliveryAttempts} failed`
                            : `Delivery status updated to ${status}`,
                        failureReason: status === 'FAILED' ? failureReason : null,
                        isEscalation: orderStatus === 'ESCALATED_TO_ADMIN',
                        createdBy: session.user.id
                    }
                });
            }

            return d;
        });

        return NextResponse.json({ delivery: updatedDelivery });

    } catch (error) {
        console.error("Update Delivery Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
