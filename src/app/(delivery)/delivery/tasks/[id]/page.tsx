import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
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
                        <div className="text-lg font-bold">{task.order.customer.user.name}</div>
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

            {/* Action Button (Sticky Bottom) */}
            {task.status !== 'DELIVERED' && task.status !== 'FAILED' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2 md:sticky md:bottom-4 md:rounded-lg">
                    <TaskActions deliveryId={task.id} currentStatus={task.status} />
                </div>
            )}
        </div>
    );
}
