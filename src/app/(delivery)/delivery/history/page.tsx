import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeliveryHistoryPage() {
    const session = await getServerSession(authOptions);

    const rider = await prisma.deliveryRider.findUnique({
        where: { userId: session?.user?.id }
    });

    if (!rider) return <div>Error loading profile</div>;

    const history = await prisma.delivery.findMany({
        where: {
            riderId: rider.id,
            status: { in: ["DELIVERED", "FAILED"] }
        },
        include: {
            order: {
                include: { customer: { include: { user: true } } }
            }
        },
        orderBy: [
            { deliveredAt: 'desc' },
            { updatedAt: 'desc' }
        ],
        take: 50
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Delivery History</h1>

            <div className="space-y-4">
                {history.map(task => (
                    <Card key={task.id}>
                        <CardContent className="pt-4 pb-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold">{task.order.customer.user.name}</p>
                                <p className="text-xs text-gray-500">Order #{task.order.orderNumber}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(task.deliveredAt || task.updatedAt)}</p>
                                <p className="text-sm mt-1">{task.order.deliveryBarangay}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant={task.status === 'DELIVERED' ? 'success' : 'destructive'}>
                                    {task.status}
                                </Badge>
                                <p className="font-bold text-sm mt-1">{formatCurrency(task.order.totalAmount)}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {history.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No completed deliveries yet.</p>
                )}
            </div>
        </div>
    );
}
