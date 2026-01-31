import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: deliveryId } = await params;

        // Get the delivery and order
        const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId },
            include: {
                order: true,
                rider: {
                    include: { user: true }
                }
            }
        });

        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Verify rider is ACTIVE
        if (delivery.rider.user.status !== "ACTIVE") {
            return NextResponse.json({ error: "Account inactive. You cannot perform this action." }, { status: 403 });
        }

        // Update order status to CANCELLED
        await prisma.order.update({
            where: { id: delivery.orderId },
            data: { status: "CANCELLED" }
        });

        // Update delivery status to FAILED (permanent)
        await prisma.delivery.update({
            where: { id: deliveryId },
            data: { status: "FAILED" }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
    }
}
