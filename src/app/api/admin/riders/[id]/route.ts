import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";
import { z } from "zod";

const updateRiderSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    vehicleType: z.string().optional(),
    plateNumber: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(), // User status
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params; // DeliveryRider ID
        const body = await req.json();
        const data = updateRiderSchema.parse(body);

        // Get Rider to find User ID
        const currentRider = await prisma.deliveryRider.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!currentRider) {
            return NextResponse.json({ error: "Rider not found" }, { status: 404 });
        }

        // Prepare updates
        const userUpdates: any = {};
        if (data.name) userUpdates.name = data.name;
        if (data.phone) userUpdates.phone = data.phone;
        if (data.status) userUpdates.status = data.status; // Update User status
        if (data.password) {
            console.log(`[UpdateRider] Updating password for rider ${id}`);
            userUpdates.passwordHash = await hash(data.password, 10);
        } else {
            console.log(`[UpdateRider] NOT updating password for rider ${id}`);
        }

        // Transaction
        const updatedRider = await prisma.$transaction(async (tx) => {
            // Update User
            if (Object.keys(userUpdates).length > 0) {
                await tx.user.update({
                    where: { id: currentRider.userId },
                    data: userUpdates
                });

                // If status changed to INACTIVE or SUSPENDED, escalate active orders
                if (userUpdates.status === "INACTIVE" || userUpdates.status === "SUSPENDED") {
                    // Find active deliveries for this rider
                    const activeDeliveries = await tx.delivery.findMany({
                        where: {
                            riderId: id,
                            status: {
                                in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"]
                            }
                        },
                        include: {
                            order: true
                        }
                    });

                    for (const delivery of activeDeliveries) {
                        // 1. Update Order status to ESCALATED_TO_ADMIN
                        await tx.order.update({
                            where: { id: delivery.orderId },
                            data: {
                                status: "ESCALATED_TO_ADMIN",
                                escalatedToAdmin: true,
                                escalatedAt: new Date()
                            }
                        });

                        // 2. Add history entry
                        await tx.orderHistory.create({
                            data: {
                                orderId: delivery.orderId,
                                status: "ESCALATED_TO_ADMIN",
                                description: `Order automatically escalated due to rider ${userUpdates.status.toLowerCase()}`,
                                isEscalation: true,
                                failureReason: "Rider account deactivated/suspended",
                                createdBy: session.user.id
                            }
                        });
                    }
                }
            }

            // Update Rider Profile
            const rider = await tx.deliveryRider.update({
                where: { id },
                data: {
                    vehicleType: data.vehicleType,
                    plateNumber: data.plateNumber
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            status: true
                        }
                    }
                }
            });

            return rider;
        });

        return NextResponse.json({ rider: updatedRider, message: "Rider updated successfully" });

    } catch (error: any) {
        console.error("Update Rider Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update rider" }, { status: 500 });
    }
}
