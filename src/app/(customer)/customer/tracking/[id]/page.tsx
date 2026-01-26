import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            delivery: { include: { rider: { include: { user: true } } } }
        }
    });

    // Verify ownership
    // We need to fetch the customer ID for this user to check ownership securely
    const customer = await prisma.customer.findUnique({ where: { userId: session?.user?.id } });

    if (!order || order.customerId !== customer?.id) {
        notFound();
    }

    // Visual Stepper
    const steps = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
    const isCancelled = order.status === "CANCELLED";

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/customer/history" className="text-blue-600 text-sm font-medium">← Back to History</Link>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-900">{order.status.replace(/_/g, " ")}</h1>
                <p className="text-gray-500">Order #{order.orderNumber}</p>
            </div>

            {/* Stepper */}
            {!isCancelled && (
                <div className="relative flex items-center justify-between mb-8 px-2">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
                    <div className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-blue-600 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        return (
                            <div key={step} className="flex flex-col items-center gap-2 bg-gray-50 p-1 rounded-full">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                    {index + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delivery Info */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3 border-b pb-2">Delivery Info</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Address</span>
                        <span className="text-right font-medium max-w-[60%]">{order.deliveryAddress}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span>{order.deliveryType}</span>
                    </div>
                    {order.delivery?.rider && (
                        <div className="flex justify-between items-center pt-2 mt-2 border-t">
                            <span className="text-gray-500">Rider</span>
                            <div className="text-right">
                                <p className="font-bold text-blue-700">{order.delivery.rider.user.name}</p>
                                <p className="text-xs text-gray-500">{order.delivery.rider.vehicleType} • {order.delivery.rider.plateNumber}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Order Items */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3 border-b pb-2">Items</h3>
                <ul className="space-y-2 text-sm">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.product.name}</span>
                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between border-t mt-3 pt-3 font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-700">{formatCurrency(order.totalAmount)}</span>
                </div>
            </Card>

            {/* Actions */}
            {order.status === 'PENDING' && (
                <div className="pt-4">
                    <Button variant="danger" className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50">
                        Cancel Order
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-2">
                        Orders can only be cancelled while pending.
                    </p>
                </div>
            )}
        </div>
    );
}
