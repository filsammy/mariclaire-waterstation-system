"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DeliveryDashboard() {
    const { data, error, isLoading } = useSWR('/api/delivery/tasks', fetcher, {
        refreshInterval: 10000, // Poll every 10 seconds
        revalidateOnFocus: true,
    });

    const tasks = data?.deliveries || [];

    if (error) {
        return (
            <div className="text-center text-red-600 p-8 border rounded-md">
                Failed to load tasks. Please try again.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center text-gray-500 p-8">
                Loading tasks...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Today's Tasks</h1>
                    <p className="text-gray-500 text-sm">{tasks.length} active deliveries</p>
                </div>
            </header>

            <div className="space-y-4">
                {tasks.map((task: any) => (
                    <Link href={`/delivery/tasks/${task.id}`} key={task.id} className="block">
                        <Card className="hover:border-blue-300 transition-colors">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {task.order.customer.user.name}
                                            {task.order.customer.customerType === "OUTLET_RESELLER" && (
                                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 text-xs">
                                                    Reseller
                                                </Badge>
                                            )}
                                        </div>
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