import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const reassignSchema = z.object({
    riderId: z.string()
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

        const { id } = await params; // This is the delivery ID
        const body = await req.json();
        const { riderId } = reassignSchema.parse(body);

        // Get delivery
        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                order: true,
                rider: { include: { user: true } }
            }
        });

        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Get new rider info
        const newRider = await prisma.deliveryRider.findUnique({
            where: { id: riderId },
            include: { user: true }
        });

        if (!newRider) {
            return NextResponse.json({ error: "Rider not found" }, { status: 404 });
        }

        // Update delivery and order
        const updatedDelivery = await prisma.$transaction(async (tx) => {
            // Update delivery with new rider
            const updated = await tx.delivery.update({
                where: { id },
                data: {
                    riderId: riderId,
                    status: "ASSIGNED",
                    assignedAt: new Date()
                },
                include: {
                    rider: { include: { user: true } }
                }
            });

            // Reset order failure tracking and set to ASSIGNED status
            await tx.order.update({
                where: { id: delivery.orderId },
                data: {
                    status: "ASSIGNED",
                    // @ts-ignore - Prisma client needs regeneration
                    deliveryAttempts: 0,
                    // @ts-ignore - Prisma client needs regeneration
                    escalatedToAdmin: false,
                    // @ts-ignore - Prisma client needs regeneration
                    escalatedAt: null
                }
            });

            // Create order history entry
            // @ts-ignore - Prisma client needs regeneration
            await tx.orderHistory.create({
                data: {
                    orderId: delivery.orderId,
                    status: "ASSIGNED",
                    description: `Admin reassigned delivery from ${delivery.rider.user.name} to ${newRider.user.name}`,
                    createdBy: session.user.id
                }
            });

            return updated;
        });

        return NextResponse.json({
            delivery: updatedDelivery,
            message: `Delivery reassigned to ${newRider.user.name}`
        });

    } catch (error) {
        console.error("Reassign Delivery Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
