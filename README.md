# Water Refilling Station Business System

A full-stack web application for managing a water refilling station's operations, including order management, inventory tracking, delivery coordination, and sales reporting.

---

## Overview

This project is a real-world SME management system designed for water refilling stations. It provides role-based access control for administrators, customers, and delivery riders, with features spanning from order placement to delivery tracking and business analytics.

**Live Demo:** _Coming Soon_  
**Documentation:** [View Full Docs](./docs/)

---

## Features

- ✅ **Role-Based Access Control** - Separate dashboards for Admin, Customer, and Delivery Rider
- ✅ **Order Management** - Complete order lifecycle from placement to delivery
- ✅ **Inventory Tracking** - Automatic stock deduction and low-stock alerts
- ✅ **Delivery Coordination** - Real-time delivery task assignment and tracking
- ✅ **Sales Analytics** - Daily and monthly reports with visual charts
- ✅ **Customer Management** - Customer profiles and order history
- ✅ **Payment Processing** - Cash and GCash (simulated) payment options
- ✅ **Customer Feedback** - Report and feedback submission system
- ✅ **Mobile Responsive** - Optimized for desktop, tablet, and mobile devices

---

## User Roles

| Role               | Access Level       | Key Capabilities                                                       |
| ------------------ | ------------------ | ---------------------------------------------------------------------- |
| **Admin**          | Full System Access | Manage inventory, view all orders, assign deliveries, generate reports |
| **Customer**       | Customer Portal    | Place orders, track deliveries, view order history, submit feedback    |
| **Delivery Rider** | Delivery Dashboard | View assigned tasks, update delivery status, access delivery history   |

📖 **Detailed Guide:** [Authentication & Roles Documentation](./docs/auth-and-roles.md)

---

## Tech Stack

### Frontend

- **Next.js 14** (App Router) - React framework with server components
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **Zod** - Schema validation

### State Management

- **TanStack Query** - Server state and caching
- **Zustand** - Client-side UI state

### Authentication

- **NextAuth.js** - Secure authentication with role-based access

### Analytics & Reporting

- **Recharts** - Data visualization

### File Storage (Optional)

- **Cloudinary** / **Supabase Storage** - Customer report uploads

---

## Getting Started

### Prerequisites

```bash
Node.js 18+
PostgreSQL 14+
npm or yarn
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/water-refilling-system.git

# Navigate to project directory
cd water-refilling-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your database connection and NextAuth secret in .env.local

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/water_station"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Project Structure

```
water-refilling-system/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes
│   │   ├── (admin)/           # Admin routes
│   │   ├── (customer)/        # Customer routes
│   │   ├── (delivery)/        # Delivery routes
│   │   └── api/               # API endpoints
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and configurations
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── docs/                      # Documentation
└── public/                    # Static assets
```

📖 **Detailed Structure:** [Folder Structure Documentation](./docs/folder-structure.md)

---

## Documentation

- 📂 [Folder Structure](./docs/folder-structure.md)
- 🔐 [Authentication & Roles](./docs/auth-and-roles.md)
- 🏗️ [Architecture](./docs/architecture.md)
- 🔌 [API Design](./docs/api-design.md)
- 🚀 [Deployment](./docs/deployment.md)

---

## Screenshots

_Coming Soon_

---

## Deployment

### Recommended Stack

- **Frontend & Backend:** Vercel
- **Database:** Supabase / Neon / Railway

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

📖 **Full Deployment Guide:** [Deployment Documentation](./docs/deployment.md)

---

## Database Schema

### Core Entities

- **User** - System users (Admin, Staff, Delivery)
- **Customer** - Customer accounts
- **Product** - Water products and containers
- **Inventory** - Stock management
- **Order** - Customer orders
- **OrderItem** - Individual order line items
- **Delivery** - Delivery assignments and tracking
- **Payment** - Payment records

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Contact

**Developer:** Your Name  
**Email:** your.email@example.com  
**Portfolio:** [yourportfolio.com](https://yourportfolio.com)

---

**⭐ If you find this project useful, please consider giving it a star!**
