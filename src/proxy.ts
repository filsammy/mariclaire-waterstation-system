import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Admin Route Protection
        if (path.startsWith("/admin")) {
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // 2. Customer Route Protection
        if (path.startsWith("/customer")) {
            if (token?.role !== "CUSTOMER") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // 3. Delivery Route Protection
        if (path.startsWith("/delivery")) {
            if (token?.role !== "DELIVERY") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/customer/:path*", "/delivery/:path*"],
};
