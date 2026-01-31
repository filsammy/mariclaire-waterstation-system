import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
    const session = await getServerSession(authOptions);

    const orders = await prisma.order.findMany({
        where: {
            customer: { userId: session?.user?.id }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { items: true } }
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Orders</h1>

            <div className="space-y-4">
                {orders.map(order => (
                    <Link href={`/customer/tracking/${order.id}`} key={order.id} className="block">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-blue-900">{order.orderNumber}</div>
                                    <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
                                </div>
                                <Badge variant={
                                    order.status === 'DELIVERED' ? 'success' :
                                        order.status === 'CANCELLED' ? 'destructive' : 'secondary'
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                            <div className="px-4 pb-4 flex justify-between text-sm">
                                <span className="text-gray-600">{order._count.items} Items</span>
                                <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </Card>
                    </Link>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No orders found.
                        <div className="mt-4">
                            <Link href="/customer/order" className="text-blue-600 font-bold hover:underline">
                                Place your first order
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
