import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeliveryDashboard() {
    const session = await getServerSession(authOptions);

    // Fetch rider profile to get ID
    const rider = await prisma.deliveryRider.findUnique({
        where: { userId: session?.user?.id }
    });

    if (!rider) return <div>Rider profile not found. Contact Admin.</div>;

    // Fetch assigned tasks (Active only)
    const tasks = await prisma.delivery.findMany({
        where: {
            riderId: rider.id,
            status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] }
        },
        include: {
            order: {
                include: {
                    customer: {
                        include: { user: { select: { name: true, phone: true } } }
                    }
                }
            }
        },
        orderBy: { assignedAt: 'asc' }
    });

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Today's Tasks</h1>
                    <p className="text-gray-500 text-sm">{tasks.length} active deliveries</p>
                </div>
            </header>

            <div className="space-y-4">
                {tasks.map(task => (
                    <Link href={`/delivery/tasks/${task.id}`} key={task.id} className="block">
                        <Card className="hover:border-blue-300 transition-colors">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg">{task.order.customer.user.name}</div>
                                        <div className="text-sm text-gray-500">{task.order.deliveryBarangay}</div>
                                    </div>
                                    <Badge className={
                                        task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                                            task.status === 'PICKED_UP' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-purple-100 text-purple-800'
                                    }>
                                        {task.status.replace(/_/g, " ")}
                                    </Badge>
                                </div>

                                <div className="text-sm bg-gray-50 p-2 rounded">
                                    <span className="text-gray-500 mr-2">📍</span>
                                    {task.order.deliveryAddress}
                                </div>

                                <div className="flex justify-between items-center text-sm pt-2 border-t">
                                    <span className="text-gray-500">Order #{task.order.orderNumber}</span>
                                    <span className="text-blue-600 font-medium">View Details &gt;</span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">😴</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500">No pending deliveries assigned to you.</p>
                    </div>
                )}
            </div>
        </div>
    );
}