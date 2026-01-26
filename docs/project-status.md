# Project Status & Alignment Guide

**Last Updated:** 2026-01-23
**Phase:** Planning Complete / Starting Foundation

## Project Overview
**MariClaire Water Refilling Station** is a full-stack web application for managing a local water business in Paranas, Samar.
- **Type:** Family-owned business
- **Operations:** Walk-in + Route-based Delivery
- **Portals:** Admin (Desktop/Mobile), Customer (Mobile-First), Delivery Rider (Mobile-First)

## MVP Scope (Phase 1)
We are building a solid Minimum Viable Product to launch quickly and gather feedback.

### Core Features
- **Products:** Only "Water Refill" (5 gal) and "Buy New Container" (no rentals yet).
- **Payment:** Cash on Delivery (COD) only.
- **Delivery:** Flexible (single orders) + Scheduled Bulk Deliveries (truck).
- **Service Area:** Fixed Barangays (Zone 1-6, Buray, Lipata, Pequit, Villas).

### Design Strategy: Mobile-First
**Critical:** Most users (Customers & Riders) will access via smartphone.
- **Touch Targets:** Min 44px for all interactive elements.
- **Navigation:** Bottom navigation bars for Customer/Delivery portals.
- **Layouts:** Single-column layouts for mobile, expanding to multi-column on desktop.
- **Forms:** Large inputs, native select dropdowns, clear validation.

## Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma ORM v7
- **Auth:** NextAuth.js (Role-Based: ADMIN, CUSTOMER, DELIVERY)
- **State:** TanStack Query (Server) + Zustand (Client)

## Current Implementation Plan
1. **Foundation:** DB Schema, Auth, Base UI Components
2. **Admin:** Order/Inventory Management
3. **Customer:** Ordering & Tracking
4. **Delivery:** Task Management

## Developer Notes
- **Docs:** See `/docs` for folder structure and auth guides.
- **Tasks:** Check `task.md` for active checklist.
- **Artifacts:** Design decisions recorded in `implementation_plan.md`.
