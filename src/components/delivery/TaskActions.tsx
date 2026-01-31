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

    const updateStatus = async (newStatus: DeliveryStatus, failureReason?: string) => {
        const confirmMessage = newStatus === 'DELIVERED'
            ? 'Confirm delivery completion?'
            : newStatus === 'FAILED'
                ? 'Mark this delivery as failed?'
                : newStatus === 'IN_TRANSIT'
                    ? 'Start delivery now?'
                    : `Update status to ${newStatus}?`;

        if (!confirm(confirmMessage)) return;

        setLoading(true);
        try {
            const body: any = { status: newStatus };
            if (newStatus === 'FAILED' && failureReason) {
                body.failureReason = failureReason;
            }

            const res = await fetch(`/api/delivery/${deliveryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update");
            }

            router.refresh();
            // If delivered, redirect back to list
            if (newStatus === 'DELIVERED') {
                router.push('/delivery');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error updating status");
        } finally {
            setLoading(false);
        }
    };

    const handleFailedAttempt = () => {
        const reason = prompt("Please select or enter failure reason:\n\n1. Customer not home\n2. Wrong/incomplete address\n3. Customer refused delivery\n4. Access issues (gate locked, etc.)\n5. Other\n\nEnter number (1-5) or type custom reason:");

        if (!reason) return;

        let failureReason = "";
        switch (reason.trim()) {
            case "1": failureReason = "Customer not home"; break;
            case "2": failureReason = "Wrong/incomplete address"; break;
            case "3": failureReason = "Customer refused delivery"; break;
            case "4": failureReason = "Access issues (gate locked, etc.)"; break;
            case "5":
                failureReason = prompt("Please describe the issue:") || "Other";
                break;
            default: failureReason = reason;
        }

        if (failureReason) {
            updateStatus('FAILED', failureReason);
        }
    };

    const cancelOrder = async () => {
        if (!confirm('Cancel this order permanently? This cannot be undone.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/delivery/${deliveryId}/cancel`, {
                method: "POST"
            });

            if (!res.ok) throw new Error("Failed to cancel");

            router.push('/delivery');
        } catch (err) {
            alert("Error cancelling order");
        } finally {
            setLoading(false);
        }
    };

    // ASSIGNED -> Start Delivery (goes to IN_TRANSIT)
    if (currentStatus === 'ASSIGNED') {
        return (
            <Button className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus('IN_TRANSIT')} isLoading={loading}>
                🛵 Start Delivery
            </Button>
        );
    }

    // IN_TRANSIT -> Mark Delivered or Failed
    if (currentStatus === 'IN_TRANSIT') {
        return (
            <div className="space-y-3">
                <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700" onClick={() => updateStatus('DELIVERED')} isLoading={loading}>
                    ✅ Mark Delivered
                </Button>
                <Button variant="danger" className="w-full" onClick={handleFailedAttempt} isLoading={loading}>
                    ❌ Failed Attempt
                </Button>
            </div>
        );
    }

    // FAILED -> Retry or Cancel
    if (currentStatus === 'FAILED') {
        return (
            <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800 text-center">
                    ⚠️ Delivery failed. Choose an action below.
                </div>
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus('IN_TRANSIT')} isLoading={loading}>
                    🔄 Retry Delivery
                </Button>
                <Button variant="danger" className="w-full" onClick={cancelOrder} isLoading={loading}>
                    ❌ Cancel Order
                </Button>
            </div>
        );
    }

    return <div className="text-center font-bold text-green-600">✅ Completed</div>;
}
