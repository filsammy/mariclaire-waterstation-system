"use client";

import { useState } from "react";
import { Delivery, DeliveryStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface TaskActionsProps {
    deliveryId: string;
    currentStatus: DeliveryStatus;
}

export function TaskActions({ deliveryId, currentStatus }: TaskActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const updateStatus = async (newStatus: DeliveryStatus) => {
        if (!confirm(`Mark as ${newStatus}?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/delivery/${deliveryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update");

            router.refresh();
            // If delivered, maybe redirect back to list?
            if (newStatus === 'DELIVERED') {
                router.push('/delivery');
            }
        } catch (err) {
            alert("Error updating status");
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === 'ASSIGNED') {
        return (
            <Button className="w-full h-14 text-lg" onClick={() => updateStatus('PICKED_UP')} isLoading={loading}>
                ⬆️ Pick Up Order
            </Button>
        );
    }

    if (currentStatus === 'PICKED_UP') {
        return (
            <Button className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus('IN_TRANSIT')} isLoading={loading}>
                🛵 Start Delivery
            </Button>
        );
    }

    if (currentStatus === 'IN_TRANSIT') {
        return (
            <div className="space-y-3">
                <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700" onClick={() => updateStatus('DELIVERED')} isLoading={loading}>
                    ✅ Mark Delivered
                </Button>
                <Button variant="danger" className="w-full" onClick={() => updateStatus('FAILED')} isLoading={loading}>
                    ❌ Failed Attempt
                </Button>
            </div>
        );
    }

    return <div className="text-center font-bold text-green-600">Completed</div>;
}
