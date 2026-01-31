"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    Droplets,
    Users,
    BarChart3,
    LogOut,
    Bike,
    Menu,
    X
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/products", label: "Products", icon: Droplets },
    { href: "/admin/inventory", label: "Inventory", icon: Droplets },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/riders", label: "Riders", icon: Bike },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
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
                    const Icon = item.icon;
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
                            <Icon className="h-5 w-5" />
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
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

// Mobile Nav Component with Hamburger Menu
export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <div className="flex bg-white border-b p-4 md:hidden justify-between items-center">
                <span className="font-bold text-blue-700">MariClaire Admin</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-xl">
                        <div className="flex h-16 items-center border-b px-6 justify-between">
                            <span className="text-xl font-bold text-blue-700">Menu</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1 p-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
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
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
