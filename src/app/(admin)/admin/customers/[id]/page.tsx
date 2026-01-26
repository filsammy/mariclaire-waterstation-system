import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            user: true,
            orders: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { items: true } }
                }
            }
        }
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/customers" className="text-gray-500 hover:text-gray-900">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">{customer.user.name}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Profile Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p>{customer.user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p>{customer.user.phone || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p>{customer.address}</p>
                            <Badge variant="outline" className="mt-1">{customer.barangay}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Member Since</p>
                            <p>{formatDate(customer.createdAt)}</p>
                        </div>
                        <div className="pt-4 border-t">
                            <Button className="w-full" variant="outline">Edit Profile</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customer.orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="py-3">
                                            <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                        <td className="py-3">
                                            <Badge variant="secondary">{order.status}</Badge>
                                        </td>
                                        <td className="py-3 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {customer.orders.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No orders yet.</p>
                        )}
                        <div className="pt-4 text-center">
                            <Link href={`/admin/orders?customerId=${customer.id}`} className="text-sm text-blue-600 hover:underline">
                                View All Orders
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
