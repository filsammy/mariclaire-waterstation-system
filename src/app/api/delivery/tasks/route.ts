import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get rider ID from session
        const rider = await prisma.deliveryRider.findUnique({
            where: { userId: session.user.id },
            include: { user: { select: { status: true } } }
        });

        if (!rider) {
            return NextResponse.json({ error: "Rider not found" }, { status: 404 });
        }

        // Check if rider is ACTIVE
        if (rider.user.status !== "ACTIVE") {
            // Return empty list if rider is not active
            return NextResponse.json({ deliveries: [] });
        }

        // Fetch active deliveries for this rider
        const deliveries = await prisma.delivery.findMany({
            where: {
                riderId: rider.id,
                status: {
                    in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"]
                }
            },
            include: {
                order: {
                    include: {
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        phone: true
                                    }
                                }
                            }
                        },
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ deliveries });
    } catch (error) {
        console.error("Error fetching rider tasks:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}
