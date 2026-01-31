import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { AcceptAndAssign } from "@/components/admin/AcceptAndAssign";
import React from 'react';

// Create actions file separately? For now, we will just display details.
// MVP: Actions will be added later or via client component forms.

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params object
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: {
                include: {
                    user: true
                }
            },
            items: {
                include: {
                    product: true
                }
            },
            delivery: {
                include: {
                    rider: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            // @ts-ignore - Prisma client needs regeneration
            history: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!order) {
        notFound();
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "CONFIRMED": return "text-blue-600 bg-blue-50 border-blue-200";
            case "DELIVERED": return "text-green-600 bg-green-50 border-green-200";
            case "CANCELLED": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900">
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
                    </div>
                    <p className="ml-14 text-sm text-gray-500">
                        Ordered: {formatDateTime(order.createdAt)}
                    </p>
                </div>

                <div className={`px-4 py-2 rounded-full border font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Customer Details */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Customer Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <div className="flex items-center gap-2">
                                <p className="text-base">{order.customer.user.name}</p>
                                {order.customer.customerType === "OUTLET_RESELLER" && (
                                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                                        Reseller
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Contact</p>
                            <p className="text-base">{order.customer.user.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base truncate">{order.customer.user.email}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Details */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Delivery Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-base">{order.deliveryAddress}</p>
                            <Badge variant="outline" className="mt-1">{order.deliveryBarangay}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-base">{order.deliveryType}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rider</p>
                            {order.delivery ? (
                                <p className="text-base text-blue-600">{order.delivery.rider.user.name}</p>
                            ) : (
                                <p className="text-base text-yellow-600 italic">Not assigned yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Payment Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Method</p>
                            <p className="text-base">{order.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'secondary'}>
                                {order.paymentStatus}
                            </Badge>
                        </div>
                        <div className="pt-2 border-t mt-2">
                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(order.totalAmount)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Show order creation */}
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                            <div className="flex-1">
                                <p className="font-medium">Order Placed</p>
                                <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Show detailed history from OrderHistory */}
                        {/* @ts-ignore - Prisma client needs regeneration */}
                        {order.history?.map((event: any) => (
                            <div key={event.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${event.isEscalation ? 'bg-orange-600' :
                                    event.failureReason ? 'bg-red-600' :
                                        event.status === 'DELIVERED' ? 'bg-green-600' :
                                            event.status === 'CANCELLED' ? 'bg-red-600' :
                                                event.status === 'ASSIGNED' ? 'bg-purple-600' :
                                                    'bg-blue-600'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="font-medium">{event.description}</p>
                                    <p className="text-sm text-gray-500">{formatDateTime(event.createdAt)}</p>
                                    {event.failureReason && (
                                        <p className="text-xs text-red-600 mt-1">Reason: {event.failureReason}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Show delivery completion if exists */}
                        {order.delivery?.deliveredAt && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                                <div className="flex-1">
                                    <p className="font-medium">Delivered</p>
                                    <p className="text-sm text-gray-500">{formatDateTime(order.delivery.deliveredAt)}</p>
                                    <p className="text-xs text-gray-400">By: {order.delivery.rider.user.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">{item.product.unit}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(item.price)}</td>
                                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 bg-white p-4 rounded-lg border shadow-sm sticky bottom-4">
                {(order.status === 'PENDING' || order.status === 'ESCALATED_TO_ADMIN') && (
                    <AcceptAndAssign orderId={order.id} currentStatus={order.status} deliveryType={order.deliveryType} />
                )}
            </div>
        </div>
    );
}
