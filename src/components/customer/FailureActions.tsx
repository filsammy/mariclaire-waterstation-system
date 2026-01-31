"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface FailureActionsProps {
    orderId: string;
    status: string;
    failureReasons: string[];
    deliveryAttempts: number;
}

export function FailureActions({ orderId, status, failureReasons, deliveryAttempts }: FailureActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRetry = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/customer/order/${orderId}/retry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to retry delivery");
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/customer/order/${orderId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Customer cancelled after delivery failure" })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to cancel order");
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "DELIVERY_FAILED") {
        return (
            <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Delivery Attempt Failed</h3>
                    <p className="text-sm text-yellow-800 mb-2">
                        Reason: {failureReasons[failureReasons.length - 1] || "No reason provided"}
                    </p>
                    <p className="text-sm text-yellow-700">
                        Attempt {deliveryAttempts} of 2. You can retry the delivery or cancel your order.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {isLoading ? "Processing..." : "Retry Delivery"}
                    </Button>
                    <Button
                        onClick={handleCancel}
                        disabled={isLoading}
                        variant="danger"
                        className="flex-1"
                    >
                        Cancel Order
                    </Button>
                </div>
            </div>
        );
    }

    if (status === "ESCALATED_TO_ADMIN") {
        return (
            <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">🔔 Issue Escalated to Support</h3>
                    <p className="text-sm text-orange-800 mb-3">
                        We're working to resolve this delivery issue. Our team will contact you shortly.
                    </p>
                    {failureReasons.length > 0 && (
                        <div className="text-sm text-orange-700">
                            <p className="font-medium mb-1">Previous attempts:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {failureReasons.map((reason, index) => (
                                    <li key={index}>Attempt {index + 1}: {reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    variant="danger"
                    className="w-full"
                >
                    {isLoading ? "Processing..." : "Cancel Order"}
                </Button>
            </div>
        );
    }

    if (status === "REJECTED") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">❌ Order Rejected</h3>
                <p className="text-sm text-red-800">
                    This order has been rejected by our team. Please contact support for more information.
                </p>
            </div>
        );
    }

    return null;
}
