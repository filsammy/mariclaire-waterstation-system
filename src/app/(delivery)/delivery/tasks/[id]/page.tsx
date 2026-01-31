import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { TaskActions } from "@/components/delivery/TaskActions";
import Link from "next/link";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const task = await prisma.delivery.findUnique({
        where: { id },
        include: {
            order: {
                include: {
                    customer: {
                        include: { user: true }
                    },
                    items: {
                        include: { product: true }
                    },
                    // @ts-ignore - Prisma client needs regeneration
                    history: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            }
        }
    });

    if (!task) notFound();

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <Link href="/delivery" className="text-gray-500">← Back</Link>
                <h1 className="text-xl font-bold">Task Details</h1>
            </div>

            {/* Customer Card */}
            <Card className="border-l-4 border-l-blue-600">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Customer</label>
                        <div className="text-lg font-bold">{task.order.customer.user.name} {task.order.customer.customerType === "OUTLET_RESELLER" && (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                                Reseller
                            </Badge>
                        )}</div>
                        <div className="text-blue-600 font-medium">{task.order.customer.user.phone}</div>
                        <a href={`tel:${task.order.customer.user.phone}`} className="inline-block mt-2 text-xs bg-gray-100 px-3 py-1 rounded border">
                            📞 Call Customer
                        </a>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Deliver To</label>
                        <div className="text-base">{task.order.deliveryAddress}</div>
                        <Badge variant="outline" className="mt-1">{task.order.deliveryBarangay}</Badge>

                        {task.order.deliveryNotes && (
                            <div className="mt-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-800">
                                📝 Note: {task.order.deliveryNotes}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <ul className="space-y-2 text-sm border-b pb-2 mb-2">
                        {task.order.items.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product.name}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total to Collect:</span>
                        <span className="text-blue-700">{formatCurrency(task.order.totalAmount)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 uppercase text-right">Payment: {task.order.paymentMethod}</div>
                </CardContent>
            </Card>

            {/* Task Timeline */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 border-b pb-2">Delivery Timeline</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium">Order Placed</p>
                                <p className="text-xs text-gray-500">{formatDateTime(task.order.createdAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium">Assigned to You</p>
                                <p className="text-xs text-gray-500">{formatDateTime(task.assignedAt)}</p>
                            </div>
                        </div>

                        {/* Show detailed history from OrderHistory */}
                        {/* @ts-ignore - Prisma client needs regeneration */}
                        {task.order.history?.map((event: any) => (
                            <div key={event.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${event.isEscalation ? 'bg-orange-600' :
                                    event.failureReason ? 'bg-red-600' :
                                        event.status === 'DELIVERED' ? 'bg-green-600' :
                                            'bg-blue-600'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="font-medium">{event.description}</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(event.createdAt)}</p>
                                    {event.failureReason && (
                                        <p className="text-xs text-red-600 mt-1">Reason: {event.failureReason}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {task.deliveredAt && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="font-medium">Delivered</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(task.deliveredAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Button (Sticky Bottom) */}
            {task.status !== 'DELIVERED' && task.status !== 'FAILED' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2 md:sticky md:bottom-4 md:rounded-lg">
                    <TaskActions deliveryId={task.id} currentStatus={task.status} />
                </div>
            )}
        </div>
    );
}
