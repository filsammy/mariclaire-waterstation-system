// Delivery configuration based on barangay location

export type DeliveryType = "FLEXIBLE" | "SCHEDULED";

// Tricycle delivery areas (nearby, flexible delivery)
export const TRICYCLE_BARANGAYS = [
    "Zone 1",
    "Zone 2",
    "Zone 3",
    "Zone 4",
    "Zone 5",
    "Zone 6",
    "Buray",
    "Lipata",
    "Villa Regina",
    "Pequit",
    "Motiong",
] as const;

// Truck delivery areas (distant, scheduled bulk delivery)
export const TRUCK_BARANGAYS = [
    "Tutubigan",
    "Bagsa",
    "Lawaan",
    "Casandig",
    "Minarog",
] as const;

// All valid barangays
export const ALL_BARANGAYS = [...TRICYCLE_BARANGAYS, ...TRUCK_BARANGAYS] as const;

export type Barangay = typeof ALL_BARANGAYS[number];

// Get delivery type for a given barangay
export function getDeliveryTypeForBarangay(barangay: string): DeliveryType {
    if (TRICYCLE_BARANGAYS.includes(barangay as any)) {
        return "FLEXIBLE";
    }
    if (TRUCK_BARANGAYS.includes(barangay as any)) {
        return "SCHEDULED";
    }
    // Default to flexible if barangay not found
    return "FLEXIBLE";
}

// Get human-readable delivery method name
export function getDeliveryMethodName(deliveryType: DeliveryType): string {
    return deliveryType === "FLEXIBLE" ? "Tricycle Delivery" : "Truck Delivery";
}

// Barangay options grouped by delivery type for dropdowns
export const BARANGAY_OPTIONS = [
    {
        label: "Tricycle Delivery Areas",
        options: TRICYCLE_BARANGAYS.map(b => ({ label: b, value: b }))
    },
    {
        label: "Truck Delivery Areas",
        options: TRUCK_BARANGAYS.map(b => ({ label: b, value: b }))
    }
];
