import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerDashboard() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    // Fetch active order
    const activeOrder = await prisma.order.findFirst({
        where: {
            customer: {
                // We assume we can find customer by userId. 
                // Need to fetch user's customer profile first or query by relation if possible.
                // Prisma Schema: Customer linked to User via userId.
                userId: session.user.id
            },
            status: {
                in: ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"]
            }
        },
        include: {
            _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Recent 3 completed
    const recentOrders = await prisma.order.findMany({
        where: {
            customer: { userId: session.user.id },
            status: { in: ["DELIVERED", "CANCELLED"] }
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">Hello, {session.user.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 text-sm">Thirsty? Order water now.</p>
                </div>
            </header>

            {/* CTA Section */}
            <section>
                <Link href="/customer/order">
                    <Button size="lg" className="w-full h-16 text-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-none">
                        <span className="mr-2">💧</span> Order Refill Now
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
                                    <span className="font-medium">{activeOrder._count.items} item(s)</span>
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
                    {recentOrders.map(order => (
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