"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RiderStatusChecker() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Only check status for DELIVERY role users
                if (session?.user?.role !== "DELIVERY") {
                    return;
                }

                // We use a dedicated endpoint or reuse profile fetch to check status
                // For simplicity, let's use a lightweight check
                const res = await fetch("/api/auth/status");
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "SUSPENDED") {
                        // Force logout
                        await signOut({ redirect: false });
                        router.push("/login?error=Suspended");
                    }
                }
            } catch (error) {
                console.error("Status check failed", error);
            }
        };

        // Check immediately
        if (session) {
            checkStatus();
        }

        // Set up interval for periodic checks (every minute)
        const interval = setInterval(() => {
            if (session) {
                checkStatus();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [session, router]);

    return null; // This component renders nothing
}
