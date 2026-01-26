import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

async function DashboardStats() {
    // Parallel data fetching
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

        // 2. Today's Sales (Confirmed/Delivered orders created today)
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ["DELIVERED", "CONFIRMED", "OUT_FOR_DELIVERY"] },
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

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Today's Sales</CardTitle>
                    <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(todaySales._sum.totalAmount || 0)}</div>
                    <p className="text-xs text-gray-500">
                        For confirmed orders
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
                    <span className="text-2xl">⏳</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                    <p className="text-xs text-gray-500">
                        Awaiting action
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Active Deliveries</CardTitle>
                    <span className="text-2xl">🚚</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeDeliveries}</div>
                    <p className="text-xs text-gray-500">
                        Currently on route
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Low Stock Alerts</CardTitle>
                    <span className="text-2xl">⚠️</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
                    <p className="text-xs text-gray-500">
                        Products need restocking
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
                <DashboardStats />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Recent order table coming next...</p>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Stock visualization coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}