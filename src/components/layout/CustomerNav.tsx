"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CustomerNav() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/customer", label: "Home", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )
        },
        {
            href: "/customer/order", label: "Order", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )
        },
        {
            href: "/customer/history", label: "History", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            )
        },
        {
            href: "/customer/profile", label: "Profile", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe pt-2 md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-t-0 md:pb-0">
            <div className="hidden px-6 py-4 md:block">
                <span className="text-xl font-bold text-blue-700">MariClaire Water</span>
            </div>

            <div className="flex justify-around md:flex-col md:space-y-1 md:px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors md:flex-row md:justify-start md:gap-3 md:rounded-lg md:text-sm md:py-3",
                                isActive
                                    ? "text-blue-600 md:bg-blue-50"
                                    : "text-gray-500 hover:text-gray-900 md:hover:bg-gray-100"
                            )}
                        >
                            <div className={cn("mb-1 md:mb-0", isActive ? "text-blue-600" : "text-gray-400")}>
                                {item.icon}
                            </div>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
