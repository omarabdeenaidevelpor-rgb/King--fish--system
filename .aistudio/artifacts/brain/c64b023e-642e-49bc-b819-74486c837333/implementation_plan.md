# Implementation Plan - NileTrace Enterprise

NileTrace is a trilingual, multi-tenant digital operating system designed for industrial fish factory operations (King Fish). It provides end-to-end traceability, quality control (HACCP), and cold chain management from vessel/farm to the final customer.

## User Review & Critical Decisions

> [!IMPORTANT]
> The system will be built with a "Privacy by Design" and "Isolation by Default" architecture to support future SaaS multi-tenant scaling.

- **Confirmed Decision 1**: Trilingual support for **Arabic (RTL)**, **English (LTR)**, and **Italian (LTR)**.
- **Confirmed Decision 2**: Multi-tenant structure: `Organization -> Branch -> Resources`.
- **Confirmed Decision 3**: Tech stack: **Cloud SQL (PostgreSQL)** + **Drizzle ORM** + **tRPC** for end-to-end type safety.
- **Open Question**: Will the Port Said and Italy branches share the same product catalog (SKUs) or manage them independently?
    - *Default Recommendation*: Shared global catalog at the Organization level with branch-specific inventory overrides.

## 1. Overview & Core Concept

### What It Does
NileTrace digitizes the physical flow of fish products. It captures raw material origin (vessels/farms), manages production lots, enforces HACCP quality gates, monitors cold chain temperatures, and generates export-ready evidence packs for customers.

### Target Audience
- **Factory Operators**: Mobile/Tablet users for real-time data entry on the floor.
- **Quality Managers**: Professionals enforcing HACCP and compliance.
- **Enterprise Admins**: Managing branches (Egypt/Italy), users, and global configurations.
- **Customers**: Portals for viewing shipments and traceability documents.

## 2. User Experience & Visual Design

### Key User Flows
1. **The Reception Gate**: Operator selects a supplier/vessel, records weight/temp/photos, and generates a unique Lot ID.
2. **Production Lifecycle**: A Lot is moved through processing (Cleaning -> Filleting -> Freezing). Output mass must balance input mass.
3. **Quality Release**: Quality manager reviews CCP points and lab results before "releasing" a Lot for shipment.
4. **Export Evidence**: Commercial users bundle released Lots into a Shipment, generating a trilingual traceability report.

### Visual Identity (SaaS Dashboard Domain)
- **Aesthetic**: Utilitarian, high-density, "Control Room" aesthetic.
- **Theme**: Light/Dark posture. Neutral slate (`#0F172A`) for structural elements, crisp white canvas for data.
- **Typography**: 
    - Display: `Plus Jakarta Sans` for headers and nav.
    - Data: `JetBrains Mono` or `tabular-nums` for weights, temperatures, and IDs.
- **Layout**: 
    - Persistent sidebar for main navigation.
    - Top bar with trilingual switcher (Ar/En/It) and branch selector.
    - High-density data grids with compact row heights ($40\text{px}$).

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: tRPC for Backend communication**
    - *Why*: Provides immediate TypeScript safety between the database schema and the UI, reducing runtime errors in complex traceability logic.
- **Decision 2: i18next for Trilingual Support**
    - *Why*: Standard industry library that handles RTL/LTR switching and allows for future language expansions.
- **Decision 3: Event-based Audit Trail**
    - *Why*: Instead of just "last updated", every state change (e.g., Quality Release) is recorded as an immutable event for regulatory compliance.

## 4. Technical Architecture & Data Strategy

```unicode
┌─────────────────────────────────────────────────────────────────────────┐
│                          NileTrace Frontend (React)                     │
│  ┌───────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  │
│  │  Auth Context │  │   i18n (Ar / En / It)   │  │   tRPC Client     │  │
│  └───────────────┘  └─────────────────────────┘  └───────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ (Type-Safe RPC)
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         NileTrace Backend (Node.js)                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ tRPC Routers:                                                     │  │
│  │ [Org] [Branch] [Supplier] [Lot] [Quality] [Inventory] [Shipment]  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │ (Drizzle ORM)                      │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │            Cloud SQL (PostgreSQL) - Multi-tenant Schema           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Organizations**: Root tenant (e.g., King Fish).
- **Branches**: Geographic sites (Port Said Factory, Italy Office).
- **Lots**: The central unit of traceability. Links to Supplier, Vessel, and Quality Results.
- **InventoryMovements**: Tracks Lot quantities across Cold Stores and Racks.
- **HaccpEntries**: Specific CCP (Critical Control Point) records.

### Implementation Phases
1. **Phase 1: Multi-tenant Base**: Provision Cloud SQL + Firebase Auth. Set up Drizzle schema with `organizationId` and `branchId` filters.
2. **Phase 2: Trilingual Foundation**: Configure `i18next` with Arabic (RTL), English, and Italian. Build the Layout shell.
3. **Phase 3: The Traceability Slice**: Implement "Receiving -> Lot Generation -> Basic Quality".
4. **Phase 4: Operations & Cold Chain**: Processing workflows, Inventory movements, and Temperature logging.
5. **Phase 5: Export & Customer Portal**: Shipment management and the Evidence Pack generation.
6. **Phase 6: Audit & Lockdown**: Finalize Audit trails, RBAC enforcement, and production hardening.
