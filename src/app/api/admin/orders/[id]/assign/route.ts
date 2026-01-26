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

        // Verify order exists and is CONFIRMED
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { delivery: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "CONFIRMED") {
            return NextResponse.json({ error: "Order must be CONFIRMED to assign rider" }, { status: 400 });
        }

        if (order.delivery) {
            return NextResponse.json({ error: "Order already has a rider assigned" }, { status: 400 });
        }

        // Create delivery record and update order status
        const delivery = await prisma.delivery.create({
            data: {
                orderId,
                riderId,
                deliveryType: order.deliveryType,
                status: "ASSIGNED"
            }
        });

        // Update order status to PREPARING
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "PREPARING" }
        });

        return NextResponse.json({ delivery });
    } catch (error) {
        console.error("Error assigning rider:", error);
        return NextResponse.json({ error: "Failed to assign rider" }, { status: 500 });
    }
}
