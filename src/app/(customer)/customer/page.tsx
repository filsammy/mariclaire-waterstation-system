"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomerDashboard() {
    const { data: session } = useSession();
    const { data, error, isLoading } = useSWR('/api/customer/orders', fetcher, {
        refreshInterval: 15000, // Poll every 15 seconds
        revalidateOnFocus: true,
    });

    const orders = data?.orders || [];

    // Filter active and recent orders
    const activeOrder = orders.find((order: any) =>
        ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "ASSIGNED"].includes(order.status)
    );

    const recentOrders = orders
        .filter((order: any) => ["DELIVERED", "CANCELLED", "DELIVERY_FAILED", "ESCALATED_TO_ADMIN", "REJECTED"].includes(order.status))
        .slice(0, 3);

    if (error) {
        return (
            <div className="text-center text-red-600 p-8 border rounded-md">
                Failed to load orders. Please try again.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center text-gray-500 p-8">
                Loading your dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">Hello, {session?.user?.name?.split(' ')[0]}!</h1>
                    <p className="text-gray-500 text-sm">Fresh water, delivered when you need it.</p>
                </div>
            </header>

            {/* CTA Section */}
            <section>
                <Link href="/customer/order">
                    <Button size="lg" className="w-full h-16 text-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-none">
                        Order Refill Now
                    </Button>
                </Link>
            </section>

            {/* Active Order Card */}
            {activeOrder && (
                <section>
                    <h2 className="text-lg font-semibold mb-3">Active Order</h2>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg text-blue-900">{activeOrder.orderNumber}</p>
                                    <p className="text-sm text-blue-700">{formatDate(activeOrder.createdAt)}</p>
                                </div>
                                <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">{activeOrder.status}</Badge>
                            </div>

                            <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex justify-between">
                                    <span>Items</span>
                                    <span className="font-medium">{activeOrder.items?.length || 0} item(s)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total</span>
                                    <span className="font-bold">{formatCurrency(activeOrder.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <Link href={`/customer/tracking/${activeOrder.id}`}>
                                    <Button variant="outline" className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                                        Track Order
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Recent History */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                    <Link href="/customer/history" className="text-sm text-blue-600 font-medium">View All</Link>
                </div>

                <div className="space-y-3">
                    {recentOrders.map((order: any) => (
                        <Card key={order.id} className="overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                                    <p className="text-sm text-gray-500">{formatCurrency(order.totalAmount)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={order.status === 'DELIVERED' ? 'success' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                    <Link href={`/customer/tracking/${order.id}`} className="text-xs text-gray-400">
                                        Details &gt;
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {recentOrders.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-lg border border-dashed text-gray-500">
                            No past orders yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}