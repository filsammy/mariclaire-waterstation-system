'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface CancelOrderButtonProps {
    orderId: string;
    className?: string;
}

export function CancelOrderButton({ orderId, className }: CancelOrderButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch(`/api/customer/order/${orderId}/cancel`, {
                    method: "POST",
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to cancel order");
                }

                router.refresh();
            } catch (error) {
                console.error("Cancellation error:", error);
                alert("Failed to cancel order. Please try again.");
            }
        });
    };

    return (
        <Button
            variant="danger"
            className={className || "w-full bg-white border border-red-200 text-red-600 hover:bg-red-50"}
            onClick={handleCancel}
            disabled={isPending}
        >
            {isPending ? "Cancelling..." : "Cancel Order"}
        </Button>
    );
}
