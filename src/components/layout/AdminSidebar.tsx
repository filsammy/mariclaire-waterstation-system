"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
    { href: "/admin/inventory", label: "Inventory", icon: "💧" },
    { href: "/admin/customers", label: "Customers", icon: "👥" },
    { href: "/admin/reports", label: "Reports", icon: "📈" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 flex-col border-r bg-white md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-blue-700">MariClaire Admin</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-4">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    <span className="text-lg">🚪</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

// Mobile Nav Component (Simple version for MVP)
export function AdminMobileNav() {
    return (
        <div className="flex bg-white border-b p-4 md:hidden justify-between items-center">
            <span className="font-bold text-blue-700">MariClaire Admin</span>
            {/* In real app, hamburger menu would go here opening a sheet/drawer */}
        </div>
    );
}
