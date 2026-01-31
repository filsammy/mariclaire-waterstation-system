import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [
            pendingOrders,
            todaySales,
            lowStockItems,
            activeDeliveries
        ] = await Promise.all([
            // 1. Pending Orders count
            prisma.order.count({
                where: { status: "PENDING" }
            }),

            // 2. Today's Sales (Only DELIVERED orders created today)
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    status: "DELIVERED",
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),

            // 3. Low Stock Items count
            prisma.inventory.count({
                where: {
                    currentStock: { lte: prisma.inventory.fields.minStock }
                }
            }),

            // 4. Active Deliveries count
            prisma.delivery.count({
                where: {
                    status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] }
                }
            })
        ]);

        return NextResponse.json({
            pendingOrders,
            todaySales: todaySales._sum.totalAmount || 0,
            lowStockItems,
            activeDeliveries
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
