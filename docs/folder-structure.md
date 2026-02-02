# Folder Structure

Complete guide to the project's folder organization and architecture.

---

## Overview

This project follows Next.js 16 App Router conventions with a role-based route group structure. The architecture is designed for scalability, maintainability, and clear separation of concerns.

**Design Principles:**

- Route groups for role-based access
- Colocated components with routes
- Shared utilities in centralized locations
- Type-safe throughout with TypeScript

---

## Complete Directory Tree

```
water-refilling-system/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local
├── .gitignore
│
├── docs/
│   ├── architecture.md
│   ├── auth-and-roles.md
│   ├── folder-structure.md
│   ├── api-design.md
│   └── deployment.md
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed data script
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── (public)/              # Public routes (no auth)
    │   │   ├── page.tsx           # Landing page
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   └── about/
    │   │       └── page.tsx
    │   │
    │   ├── (admin)/               # Admin routes
    │   │   └── admin/
    │   │       ├── layout.tsx     # Admin guard & sidebar
    │   │       ├── page.tsx       # Dashboard
    │   │       ├── orders/
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/
    │   │       │       └── page.tsx
    │   │       ├── inventory/
    │   │       │   ├── page.tsx
    │   │       │   └── new/
    │   │       │       └── page.tsx
    │   │       ├── customers/
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/
    │   │       │       └── page.tsx
    │   │       ├── delivery/
    │   │       │   └── page.tsx
    │   │       ├── reports/
    │   │       │   ├── page.tsx
    │   │       │   ├── sales/
    │   │       │   └── inventory/
    │   │       └── settings/
    │   │           └── page.tsx
    │   │
    │   ├── (customer)/            # Customer routes
    │   │   └── customer/
    │   │       ├── layout.tsx     # Customer guard & nav
    │   │       ├── page.tsx       # Home/Dashboard
    │   │       ├── order/
    │   │       │   ├── page.tsx   # New order
    │   │       │   └── [id]/
    │   │       │       └── page.tsx
    │   │       ├── history/
    │   │       │   └── page.tsx
    │   │       ├── tracking/
    │   │       │   └── [id]/
    │   │       │       └── page.tsx
    │   │       ├── profile/
    │   │       │   └── page.tsx
    │   │       └── feedback/
    │   │           └── page.tsx
    │   │
    │   ├── (delivery)/            # Delivery routes
    │   │   └── delivery/
    │   │       ├── layout.tsx     # Delivery guard & nav
    │   │       ├── page.tsx       # Task list
    │   │       ├── tasks/
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/
    │   │       │       └── page.tsx
    │   │       ├── history/
    │   │       │   └── page.tsx
    │   │       └── profile/
    │   │           └── page.tsx
    │   │
    │   ├── api/                   # API routes
    │   │   ├── auth/
    │   │   │   └── [...nextauth]/
    │   │   │       └── route.ts
    │   │   ├── orders/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/
    │   │   │       └── route.ts
    │   │   ├── inventory/
    │   │   │   └── route.ts
    │   │   ├── customers/
    │   │   │   └── route.ts
    │   │   ├── delivery/
    │   │   │   └── route.ts
    │   │   ├── payments/
    │   │   │   └── route.ts
    │   │   └── reports/
    │   │       └── route.ts
    │   │
    │   ├── unauthorized/
    │   │   └── page.tsx
    │   ├── layout.tsx             # Root layout
    │   ├── globals.css
    │   └── middleware.ts           # Auth middleware
    │
    ├── components/
    │   ├── ui/                    # shadcn/ui components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── table.tsx
    │   │   └── ...
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Navigation.tsx
    │   ├── forms/
    │   │   ├── OrderForm.tsx
    │   │   ├── ProductForm.tsx
    │   │   └── CustomerForm.tsx
    │   ├── charts/
    │   │   ├── SalesChart.tsx
    │   │   ├── InventoryChart.tsx
    │   │   └── OrderTrendsChart.tsx
    │   └── shared/
    │       ├── LoadingSpinner.tsx
    │       ├── EmptyState.tsx
    │       └── ErrorMessage.tsx
    │
    ├── lib/
    │   ├── auth.ts                # NextAuth configuration
    │   ├── prisma.ts              # Prisma client instance
    │   ├── utils.ts               # Utility functions
    │   ├── validations.ts         # Zod schemas
    │   └── constants.ts           # App constants
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useOrders.ts
    │   ├── useInventory.ts
    │   └── useCart.ts
    │
    ├── store/
    │   ├── cartStore.ts           # Zustand store
    │   └── uiStore.ts
    │
    └── types/
        ├── index.ts
        ├── auth.ts
        ├── order.ts
        ├── inventory.ts
        └── delivery.ts
```

---

## Route Groups Explained

### What are Route Groups?

Route groups use parentheses `(name)` to organize routes **without affecting the URL structure**.

```
(public)/
  login/page.tsx      → URL: /login

(admin)/
  admin/page.tsx      → URL: /admin

(customer)/
  customer/page.tsx   → URL: /customer
```

The `(public)`, `(admin)`, `(customer)` folders don't appear in URLs.

### Why Use Route Groups?

1. **Logical Organization** - Group related routes together
2. **Layout Isolation** - Each group can have its own layout
3. **Easy Access Control** - Guards in layout protect all child routes
4. **Clean URLs** - No extra path segments

---

## Key Directories

### `/src/app/(public)` - Public Routes

**Purpose:** Pages accessible without authentication

**Contains:**

- Landing page
- Login/Register pages
- About page
- Terms & Privacy

**No Layout Guard** - Anyone can access

---

### `/src/app/(admin)` - Admin Dashboard

**Purpose:** Administrative interface

**Protected By:** `admin/layout.tsx` (role check)

**Routes:**

```
/admin              → Dashboard overview
/admin/orders       → Order management
/admin/inventory    → Stock management
/admin/customers    → Customer database
/admin/delivery     → Delivery assignments
/admin/reports      → Analytics & reports
/admin/settings     → System configuration
```

---

### `/src/app/(customer)` - Customer Portal

**Purpose:** Customer self-service portal

**Protected By:** `customer/layout.tsx` (role check)

**Routes:**

```
/customer           → Customer home
/customer/order     → Place new order
/customer/history   → Order history
/customer/tracking  → Live delivery tracking
/customer/profile   → Profile management
/customer/feedback  → Submit feedback
```

---

### `/src/app/(delivery)` - Delivery Dashboard

**Purpose:** Delivery rider task management

**Protected By:** `delivery/layout.tsx` (role check)

**Routes:**

```
/delivery           → Today's tasks
/delivery/tasks     → All assigned deliveries
/delivery/history   → Completed deliveries
/delivery/profile   → Rider profile
```

---

### `/src/app/api` - API Routes

**Purpose:** Backend API endpoints

**Structure:**

```
/api/admin         → Admin-specific operations
/api/auth          → NextAuth endpoints (login/signup)
/api/customer      → Customer-specific operations
/api/delivery      → Delivery-specific operations
/api/inventory     → Inventory management
/api/orders        → Order processing
```

**Security:** All routes validate authentication and authorization

---

### `/src/components` - React Components

**Organization by Purpose:**

```
ui/         → Base UI components (buttons, inputs, cards)
layout/     → Layout components (header, sidebar, footer)
forms/      → Form components
charts/     → Data visualization components
shared/     → Shared utility components
```

---

### `/src/lib` - Utilities & Configuration

**Key Files:**

| File             | Purpose                           |
| ---------------- | --------------------------------- |
| `auth.ts`        | NextAuth configuration            |
| `prisma.ts`      | Database client singleton         |
| `utils.ts`       | Helper functions (cn, formatters) |
| `validations.ts` | Zod validation schemas            |
| `constants.ts`   | App-wide constants                |

---

### `/src/hooks` - Custom React Hooks

**Examples:**

- `useAuth.ts` - Authentication helpers
- `useOrders.ts` - Order data fetching
- `useInventory.ts` - Inventory operations
- `useCart.ts` - Shopping cart logic

---

### `/src/store` - Client State (Zustand)

**Purpose:** Global client-side state

**Stores:**

- `cartStore.ts` - Shopping cart state
- `uiStore.ts` - UI state (modals, sidebars)

**Note:** Server data should use TanStack Query, not Zustand

---

### `/src/types` - TypeScript Definitions

**Purpose:** Centralized type definitions

**Files:**

- `auth.ts` - Authentication types
- `order.ts` - Order-related types
- `inventory.ts` - Product & stock types
- `delivery.ts` - Delivery types

---

## Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── Providers (Session, Query, Theme)
└── Global Styles

└─> Public Routes (no layout guard)
    └── Login/Register pages

└─> Admin Layout (app/(admin)/admin/layout.tsx)
    ├── Auth Guard (session.role === "ADMIN")
    ├── Admin Sidebar
    └── Admin Pages

└─> Customer Layout (app/(customer)/customer/layout.tsx)
    ├── Auth Guard (session.role === "CUSTOMER")
    ├── Customer Navigation
    └── Customer Pages

└─> Delivery Layout (app/(delivery)/delivery/layout.tsx)
    ├── Auth Guard (session.role === "DELIVERY")
    ├── Delivery Navigation
    └── Delivery Pages
```

---

## File Naming Conventions

| File Type  | Convention     | Example                 |
| ---------- | -------------- | ----------------------- |
| Pages      | `page.tsx`     | `admin/orders/page.tsx` |
| Layouts    | `layout.tsx`   | `admin/layout.tsx`      |
| API Routes | `route.ts`     | `api/orders/route.ts`   |
| Components | PascalCase     | `OrderForm.tsx`         |
| Utilities  | camelCase      | `formatDate.ts`         |
| Types      | PascalCase     | `OrderTypes.ts`         |
| Hooks      | `use` prefix   | `useOrders.ts`          |
| Stores     | `Store` suffix | `cartStore.ts`          |

---

## Best Practices

### ✅ DO

- Keep components close to where they're used
- Use route groups for role separation
- Implement guards in layout files
- Validate on both client and server
- Use absolute imports (`@/components/...`)
- Separate API logic from UI components

### ❌ DON'T

- Mix admin and customer pages
- Put business logic in components
- Skip server-side validation
- Use relative imports for deep paths
- Store sensitive data in client state
- Repeat authorization logic

---

## Adding New Features

### Example: Adding a "Promotions" feature for customers

1. **Create Route:**

   ```
   src/app/(customer)/customer/promotions/page.tsx
   ```

2. **Create API Endpoint:**

   ```
   src/app/api/promotions/route.ts
   ```

3. **Add Components:**

   ```
   src/components/promotions/
   ├── PromotionCard.tsx
   └── PromotionList.tsx
   ```

4. **Add Types:**

   ```typescript
   // src/types/promotion.ts
   export interface Promotion {
     id: string;
     title: string;
     discount: number;
     validUntil: Date;
   }
   ```

5. **Update Database:**
   ```prisma
   // prisma/schema.prisma
   model Promotion {
     id          String   @id @default(cuid())
     title       String
     discount    Float
     validUntil  DateTime
   }
   ```

---

## Environment Files

```
.env.local              # Local development (not committed)
.env.example            # Template for required variables
.env.production         # Production variables (Vercel)
```

---

## Related Documentation

- [Authentication & Roles](./auth-and-roles.md)
- [API Design](./api-design.md)
- [Architecture](./architecture.md)

---

[← Back to README](../README.md)
