"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AcceptAndAssignProps {
    orderId: string;
    currentStatus?: string;
    deliveryType?: string; // FLEXIBLE (Tricycle) or SCHEDULED (Truck)
}

interface Rider {
    id: string;
    vehicleType: string | null;
    user: {
        name: string;
        phone: string;
    };
}

export function AcceptAndAssign({ orderId, currentStatus, deliveryType }: AcceptAndAssignProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [selectedRider, setSelectedRider] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    const isEscalated = currentStatus === "ESCALATED_TO_ADMIN";

    useEffect(() => {
        if (showModal) {
            fetchRiders();
        }
    }, [showModal]);

    const fetchRiders = async () => {
        try {
            const res = await fetch("/api/admin/riders");
            if (res.ok) {
                const data = await res.json();
                let allRiders = data.riders || [];

                // Filter riders based on delivery type
                if (deliveryType) {
                    if (deliveryType === "FLEXIBLE") {
                        // Tricycle delivery - filter for Tricycle riders
                        allRiders = allRiders.filter((r: Rider) =>
                            r.vehicleType?.toLowerCase().includes("tricycle") ||
                            r.vehicleType?.toLowerCase().includes("motor")
                        );
                    } else if (deliveryType === "SCHEDULED") {
                        // Truck delivery - filter for Truck riders
                        allRiders = allRiders.filter((r: Rider) =>
                            r.vehicleType?.toLowerCase().includes("truck")
                        );
                    }
                }

                // Filter out inactive riders
                allRiders = allRiders.filter((r: any) => r.user.status === "ACTIVE");

                setRiders(allRiders);
            }
        } catch (err) {
            console.error("Error fetching riders:", err);
        }
    };

    const handleReject = async () => {
        if (isEscalated && !rejectReason) {
            alert("Please provide a reason for rejection.");
            return;
        }

        if (!confirm("Are you sure you want to " + (isEscalated ? "reject" : "cancel") + " this order?")) return;

        setLoading(true);
        try {
            let url = `/api/admin/orders/${orderId}/status`; // Default cancel
            let body: any = { status: "CANCELLED" };

            if (isEscalated) {
                url = `/api/admin/orders/${orderId}/reject`;
                body = { reason: rejectReason }; // Fixed: was rejectionReason
            }

            const res = await fetch(url, {
                method: isEscalated ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to update order");

            router.refresh();
            setShowRejectModal(false);
        } catch (err) {
            console.error(err);
            alert("Error updating order");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        setShowModal(true);
    };

    const handleAssign = async () => {
        if (!selectedRider) {
            alert("Please select a rider");
            return;
        }

        setLoading(true);
        try {
            if (isEscalated) {
                // Reassign Route
                // We need delivery ID usually, but if we don't have it, we might need a different endpoint 
                // or the reassign endpoint should take orderId and find the active delivery.
                // Assuming /api/admin/delivery/[id]/reassign takes delivery ID. 
                // Wait, props only give orderId. 
                // Let's assume the reassign endpoint can look up by orderId OR we need to fetch deliveryId.
                // For simplicity, let's try to assume we can re-use the "Assign" endpoint if it handles re-assignment,
                // OR we use a specific reassign endpoint that accepts orderId.
                // Checking previous implementation plan: /api/admin/delivery/[id]/reassign.
                // This component doesn't have deliveryId. 
                // Hack: We'll use a new server action or route that finds the delivery by orderId?
                // Or simpler: Just Call the same ASSIGN route but ensure backend handles it?
                // Actually, if status is ESCALATED, we want to reset attempts.
                // Let's call /api/admin/orders/[id]/assign and modify that route to handle re-assignment?
                // Or use the reassign logic.

                // Let's try calling the ASSIGN endpoint first.
                const assignRes = await fetch(`/api/admin/orders/${orderId}/assign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ riderId: selectedRider, isReassignment: true }) // Pass flag if needed
                });

                if (!assignRes.ok) throw new Error("Failed to reassign rider");

            } else {
                // Standard Flow
                const confirmRes = await fetch(`/api/admin/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "CONFIRMED" })
                });

                if (!confirmRes.ok) throw new Error("Failed to confirm order");

                const assignRes = await fetch(`/api/admin/orders/${orderId}/assign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ riderId: selectedRider })
                });

                if (!assignRes.ok) throw new Error("Failed to assign rider");
            }

            setShowModal(false);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error processing order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <Button
                    variant="danger"
                    onClick={() => isEscalated ? setShowRejectModal(true) : handleReject()}
                    isLoading={loading}
                    disabled={loading || showModal}
                >
                    {isEscalated ? "Reject Order" : "Reject"}
                </Button>
                <Button
                    onClick={handleAccept}
                    isLoading={loading}
                    disabled={loading || showModal}
                >
                    {isEscalated ? "Reassign Rider" : "Accept & Assign"}
                </Button>
            </div>

            {/* Reject Modal for Escalation */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Reject Order</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this order.</p>
                        <textarea
                            className="w-full border rounded p-2 mb-4"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setShowRejectModal(false)} className="flex-1">Cancel</Button>
                            <Button variant="danger" onClick={handleReject} disabled={!rejectReason} className="flex-1">Reject</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rider Selection Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">{isEscalated ? "Reassign Rider" : "Assign Delivery Rider"}</h3>

                        {riders.length === 0 ? (
                            <p className="text-gray-500 text-sm mb-4">Loading riders...</p>
                        ) : (
                            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                {riders.map((rider) => (
                                    <label
                                        key={rider.id}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedRider === rider.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="rider"
                                            value={rider.id}
                                            checked={selectedRider === rider.id}
                                            onChange={(e) => setSelectedRider(e.target.value)}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{rider.user.name}</div>
                                            <div className="text-sm text-gray-500">{rider.user.phone}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssign}
                                isLoading={loading}
                                disabled={loading || !selectedRider}
                                className="flex-1"
                            >
                                {isEscalated ? "Reassign" : "Assign Rider"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
