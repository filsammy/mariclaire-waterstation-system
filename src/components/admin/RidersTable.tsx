"use client";

import { useState } from "react";
import { DeliveryRider, User } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Combined type
type RiderWithUser = DeliveryRider & {
    user: {
        name: string;
        email: string;
        phone: string;
        status: string;
    };
    _count?: {
        deliveries: number;
    }
};

interface RidersTableProps {
    riders: RiderWithUser[];
}

export function RidersTable({ riders }: RidersTableProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggleStatus = async (riderId: string, userId: string, currentStatus: string) => {
        setLoading(riderId);
        try {
            const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            const res = await fetch(`/api/admin/riders/${riderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update rider status");
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (riderId: string, riderName: string) => {
        if (!confirm(`Are you sure you want to delete rider "${riderName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(riderId);
        try {
            const res = await fetch(`/api/admin/riders/${riderId}/delete`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Failed to delete rider");
            }

            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            console.error("Error deleting rider:", error);
            alert("Failed to delete rider");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Rider</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Deliveries</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {riders.map((rider) => (
                        <tr key={rider.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div>
                                    <p className="font-medium">{rider.user.name}</p>
                                    <p className="text-xs text-gray-500">Joined {formatDate(rider.createdAt)}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <p>{rider.user.email}</p>
                                <p className="text-gray-500">{rider.user.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <p className="font-medium">{rider.vehicleType}</p>
                                <p className="text-xs text-gray-500">{rider.plateNumber || "No Plate #"}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                                {rider._count?.deliveries || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <Badge variant={rider.user.status === "ACTIVE" ? "success" : "secondary"}>
                                    {rider.user.status}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant={rider.user.status === "ACTIVE" ? "outline" : "primary"}
                                        size="sm"
                                        onClick={() => handleToggleStatus(rider.id, rider.userId, rider.user.status)}
                                        disabled={loading === rider.id}
                                    >
                                        {loading === rider.id ? "..." : rider.user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Link href={`/admin/riders/${rider.id}/edit`}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(rider.id, rider.user.name)}
                                        disabled={loading === rider.id}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {riders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                No riders found. Add one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
