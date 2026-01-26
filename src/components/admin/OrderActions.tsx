"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface OrderActionsProps {
    orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const updateStatus = async (status: "CONFIRMED" | "CANCELLED") => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error("Failed to update status");

            router.refresh();
        } catch (err) {
            alert("Error updating order status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="danger"
                onClick={() => updateStatus("CANCELLED")}
                isLoading={loading}
                disabled={loading}
            >
                Reject Order
            </Button>
            <Button
                onClick={() => updateStatus("CONFIRMED")}
                isLoading={loading}
                disabled={loading}
            >
                Confirm Order
            </Button>
        </div>
    );
}
