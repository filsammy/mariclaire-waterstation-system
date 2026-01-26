# MariClaire Water Station - User Guide

This guide provides everything you need to test and run the application locally.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Test Accounts (Credentials)

The database has been seeded with these users for testing purposes.

### 1. Admin Portal
**URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
*   **Email:** `admin@mariclaire.com`
*   **Password:** `admin123`
*   **Features:**
    *   **Dashboard:** View sales stats, pending orders, and low stock.
    *   **Inventory:** Manage water refill and container products.
    *   **Orders:** Confirm orders and assign delivery riders.
    *   **Customers:** View customer profiles and history.

### 2. Delivery Rider Portals
**URL:** [http://localhost:3000/delivery](http://localhost:3000/delivery)

**Rider 1 (Motorcycle)**
*   **Email:** `rider1@mariclaire.com`
*   **Password:** `rider123`

**Rider 2 (Truck)**
*   **Email:** `rider2@mariclaire.com`
*   **Password:** `rider123`

*   **Features:**
    *   **Task List:** View assigned deliveries.
    *   **Actions:** Mark as "Picked Up" or "Delivered".
    *   **Details:** View full customer address and notes.

### 3. Customer Portal (Mobile View)
**URL:** [http://localhost:3000/customer](http://localhost:3000/customer)
*   **Email:** `customer1@gmail.com`
*   **Password:** `user123`
*   **Features:**
    *   **Order Wizard:** Place orders (Refill or Buy Container).
    *   **Tracking:** Live status updates.
    *   **History:** View past orders.

---

## 📱 Mobile-First Design
This application is designed to be responsive.
*   **Desktop:** Admin Portal works best on large screens.
*   **Mobile:** Customer and Delivery Portals are optimized for smartphones. Use your browser's "Mobile View" (F12 > Toggle Device Toolbar) to simulate the experience.

## 🛠️ Troubleshooting

**Database Connection**
If you see connection errors, ensure your `.env` file has the correct `DATABASE_URL` for your Neon/Postgres instance.

**Resetting Data**
To wipe and reset the database with fresh seed data:
```bash
npx prisma migrate reset
```
*(Warning: This deletes all data)*
