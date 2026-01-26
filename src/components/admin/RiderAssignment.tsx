"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface RiderAssignmentProps {
    orderId: string;
}

interface Rider {
    id: string;
    user: {
        name: string;
        phone: string | null;
    };
    vehicleType: string | null;
}

export function RiderAssignment({ orderId }: RiderAssignmentProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [selectedRiderId, setSelectedRiderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingRiders, setFetchingRiders] = useState(false);

    const fetchRiders = async () => {
        setFetchingRiders(true);
        try {
            const res = await fetch("/api/admin/riders");
            if (!res.ok) throw new Error("Failed to fetch riders");
            const data = await res.json();
            setRiders(data.riders || []);
        } catch (err) {
            alert("Error loading riders");
        } finally {
            setFetchingRiders(false);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        fetchRiders();
    };

    const handleAssign = async () => {
        if (!selectedRiderId) {
            alert("Please select a rider");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ riderId: selectedRiderId })
            });

            if (!res.ok) throw new Error("Failed to assign rider");

            setShowModal(false);
            router.refresh();
        } catch (err) {
            alert("Error assigning rider");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleOpenModal}>Assign Delivery Rider</Button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Assign Delivery Rider</h2>

                        {fetchingRiders ? (
                            <div className="text-center py-8 text-gray-500">Loading riders...</div>
                        ) : riders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No riders available</div>
                        ) : (
                            <div className="space-y-4">
                                <Select
                                    label="Select Rider"
                                    value={selectedRiderId}
                                    onChange={(e) => setSelectedRiderId(e.target.value)}
                                    options={[
                                        { label: "-- Choose a rider --", value: "" },
                                        ...riders.map(rider => ({
                                            label: `${rider.user.name}${rider.vehicleType ? ` (${rider.vehicleType})` : ""}`,
                                            value: rider.id
                                        }))
                                    ]}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowModal(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleAssign}
                                        isLoading={loading}
                                        disabled={loading || !selectedRiderId}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
