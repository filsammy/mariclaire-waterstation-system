# Authentication & Roles

Complete guide to implementing role-based authentication in the Water Refilling Station System.

---

## Overview

This system uses **NextAuth.js** for authentication with a role-based access control (RBAC) model. The application supports three distinct user roles, each with their own protected routes and capabilities.

**Key Principles:**

- Authentication: Verify user identity (logged in or not)
- Authorization: Verify user permissions (role-based access)
- Server-side validation on every protected route
- No client-side security reliance

---

## User Roles

### 1. Admin

**Access Level:** Full System Access

**Capabilities:**

- Manage all orders across the system
- Control inventory and stock levels
- Manage customer accounts
- Assign delivery tasks to riders
- Generate sales and analytics reports
- Configure system settings

**Routes:** `/admin/*`

---

### 2. Customer

**Access Level:** Customer Portal Only

**Capabilities:**

- Place new water orders
- View personal order history
- Track active deliveries in real-time
- Update profile information
- Submit feedback and reports
- Manage payment methods

**Routes:** `/customer/*`

---

### 3. Delivery Rider

**Access Level:** Delivery Dashboard Only

**Capabilities:**

- View assigned delivery tasks
- Update delivery status (picked up, in transit, delivered)
- Access delivery history
- View route information
- Mark deliveries as complete

**Routes:** `/delivery/*`

---

## Authentication Flow

### 1. User Login

```typescript
// User submits credentials
POST / api / auth / signin;

// NextAuth validates credentials
// Returns session with user data + role

session.user = {
  id: "uuid",
  email: "user@email.com",
  name: "John Doe",
  role: "ADMIN" | "CUSTOMER" | "DELIVERY",
};
```

### 2. Role-Based Redirect

After successful login, users are redirected based on their role:

| Role     | Redirect URL | Dashboard       |
| -------- | ------------ | --------------- |
| ADMIN    | `/admin`     | Admin Dashboard |
| CUSTOMER | `/customer`  | Customer Home   |
| DELIVERY | `/delivery`  | Delivery Tasks  |

---

## Authorization Strategy

### Layer 1: Middleware (Edge Protection)

**File:** `src/middleware.ts`

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Customer routes
    if (path.startsWith("/customer")) {
      if (token?.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Delivery routes
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
```

**Benefits:**

- Runs at the edge (fastest)
- Blocks unauthorized access before page loads
- No page flicker or redirect delay

---

### Layer 2: Layout Guards (Server-Side)

Each role group has its own layout that validates permissions server-side.

**Admin Layout:** `src/app/(admin)/admin/layout.tsx`

```typescript
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session) {
    redirect("/login");
  }

  // Check authorization
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        {/* Navigation */}
      </aside>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
```

**Customer Layout:** `src/app/(customer)/customer/layout.tsx`

```typescript
// Same structure, but check for role === "CUSTOMER"
if (session.user.role !== "CUSTOMER") {
  redirect("/unauthorized");
}
```

**Delivery Layout:** `src/app/(delivery)/delivery/layout.tsx`

```typescript
// Same structure, but check for role === "DELIVERY"
if (session.user.role !== "DELIVERY") {
  redirect("/unauthorized");
}
```

**Benefits:**

- Server-side rendering (no client exposure)
- Impossible to bypass with browser dev tools
- Automatic protection for all child pages
- Clean, reusable pattern

---

### Layer 3: API Route Protection

**Never trust the frontend.** All API routes must validate permissions.

**Example:** Admin-only endpoint

```typescript
// src/app/api/admin/inventory/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check authorization
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 },
    );
  }

  // Process request...
  return NextResponse.json({ success: true });
}
```

**Apply to ALL write operations:**

- ✅ Creating orders
- ✅ Updating inventory
- ✅ Assigning deliveries
- ✅ Deleting records

---

### Layer 4: UI-Level Conditionals (UX Polish)

Hide UI elements users shouldn't access. **This is NOT security**, just better UX.

```typescript
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav>
      {session?.user.role === "ADMIN" && (
        <>
          <Link href="/admin/reports">Reports</Link>
          <Link href="/admin/inventory">Inventory</Link>
        </>
      )}

      {session?.user.role === "CUSTOMER" && (
        <Link href="/customer/order">New Order</Link>
      )}
    </nav>
  );
}
```

---

## Session Configuration

**File:** `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
```

---

## Common Mistakes to Avoid

| ❌ Wrong                       | ✅ Correct                      |
| ------------------------------ | ------------------------------- |
| Only checking role in frontend | Always validate on server + API |
| Mixing admin & customer pages  | Separate route groups           |
| Using global state for auth    | Use NextAuth session            |
| One dashboard for all roles    | Role-specific dashboards        |
| Skipping API protection        | Protect ALL API routes          |
| Trusting client-side checks    | Always verify server-side       |

---

## Testing Authentication

### Test Cases

1. **Login as Admin** → Should redirect to `/admin`
2. **Login as Customer** → Should redirect to `/customer`
3. **Login as Delivery** → Should redirect to `/delivery`
4. **Access `/admin` as Customer** → Should be blocked/redirected
5. **Access API without auth** → Should return 401
6. **Access API with wrong role** → Should return 403

---

## Security Best Practices

- ✅ Use HTTPS in production
- ✅ Set strong `NEXTAUTH_SECRET`
- ✅ Hash passwords with bcrypt (10+ rounds)
- ✅ Implement rate limiting on login
- ✅ Use secure session cookies
- ✅ Validate all inputs with Zod
- ✅ Log security events (failed logins, role changes)
- ✅ Implement CSRF protection (NextAuth handles this)

---

## Related Documentation

- [Folder Structure](./folder-structure.md)
- [API Design](./api-design.md)
- [Deployment](./deployment.md)

---

[← Back to README](../README.md)
