import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const assignSchema = z.object({
    riderId: z.string().min(1, "Rider ID is required")
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: orderId } = await params;
        const body = await req.json();
        const { riderId } = assignSchema.parse(body);

        // Verify rider exists and is ACTIVE
        const rider = await prisma.deliveryRider.findUnique({
            where: { id: riderId },
            include: { user: true }
        });

        if (!rider) {
            return NextResponse.json({ error: "Rider not found" }, { status: 404 });
        }

        if (rider.user.status !== "ACTIVE") {
            return NextResponse.json({ error: "Cannot assign inactive rider. Please select an active rider." }, { status: 400 });
        }

        // Verify order exists and is CONFIRMED
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { delivery: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "CONFIRMED" && order.status !== "ESCALATED_TO_ADMIN") {
            return NextResponse.json({ error: "Order must be CONFIRMED or ESCALATED to assign rider" }, { status: 400 });
        }

        // If CONFIRMED, ensure no delivery exists
        if (order.status === "CONFIRMED" && order.delivery) {
            return NextResponse.json({ error: "Order already has a rider assigned" }, { status: 400 });
        }

        let delivery;

        if (order.status === "ESCALATED_TO_ADMIN" && order.delivery) {
            // Update existing delivery
            delivery = await prisma.delivery.update({
                where: { id: order.delivery.id },
                data: {
                    riderId,
                    status: "ASSIGNED"
                }
            });

            // Add history entry
            await prisma.orderHistory.create({
                data: {
                    orderId,
                    status: "ASSIGNED",
                    description: "Rider reassigned by admin",
                    createdBy: session.user.id
                }
            });
        } else {
            // Create new delivery record
            delivery = await prisma.delivery.create({
                data: {
                    orderId,
                    riderId,
                    deliveryType: order.deliveryType,
                    status: "ASSIGNED"
                }
            });
        }

        // Update order status to ASSIGNED and reset attempts if escalated
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "ASSIGNED",
                deliveryAttempts: 0,
                escalatedToAdmin: false
            }
        });

        return NextResponse.json({ delivery });
    } catch (error) {
        console.error("Error assigning rider:", error);
        return NextResponse.json({ error: "Failed to assign rider" }, { status: 500 });
    }
}
