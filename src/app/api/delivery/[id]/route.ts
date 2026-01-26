import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateDeliverySchema = z.object({
    status: z.enum(["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"]),
    notes: z.string().optional()
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params needs to be awaited if accessing async, but this is a handler. Next.js App router API handlers: params argument is just object, not promise in Next 15/16 usually, but let's be safe. Wait, context is 2nd arg.
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
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { status, notes } = result.data;

        // Verify ownership
        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: { rider: true }
        });

        if (!delivery || delivery.rider.userId !== session.user.id) {
            return NextResponse.json({ error: "Delivery not found or not assigned to you" }, { status: 404 });
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
            if (status === 'PICKED_UP') orderStatus = 'OUT_FOR_DELIVERY'; // "Picked up" usually means rider has it now
            if (status === 'IN_TRANSIT') orderStatus = 'OUT_FOR_DELIVERY';
            if (status === 'DELIVERED') orderStatus = 'DELIVERED';
            // if FAILED -> keep pending or special status? Schema says CANCELLED but failed delivery != cancelled order potentially. 
            // For MVP, if failed, maybe ADMIN needs to reschedule. Let's leave order status alone or set to problem state (not in enum yet).

            if (orderStatus) {
                // @ts-ignore - enum mapping checked above
                await tx.order.update({
                    where: { id: delivery.orderId },
                    data: { status: orderStatus as any }
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
