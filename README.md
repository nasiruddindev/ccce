# VoltFlow CCC — Electrical Warehouse & Multi-Site Inventory Management

VoltFlow CCC is a modern inventory and stock transfer management application designed specifically for electrical engineering, contracting, and CCC (Construction / Cables / Contracting) companies.

## 🚀 Key Features

- **Multi-Location Tracking:** Real-time stock visibility across Central Main Warehouse (Tejgaon Hub) and project sites (Mirpur Metro Substation, Uttara Commercial Tower, Chittagong Port, Savar EPZ, etc.).
- **3-Step Stock Dispatch & Transfer Workflow:**
  1. **New Dispatch Challan Creation:** Origin to site assignment, multi-material item selection, vehicle & driver logistics details, with strict stock validation preventing negative balance.
  2. **In-Transit Status:** Materials en route are safely logged as in-transit with live alerts.
  3. **Site Receipt & Verification:** Site in-charge verifies cargo and confirms receipt with one click to add materials to destination site stock.
- **Site Material Consumption (কাজে খরচ করা):**
  - Deduct materials installed directly on site without transferring them.
  - Record work logs, installation notes, date, and supervisor details.
- **Official Delivery Challan & Gate Pass (Print-Ready):**
  - Generates A4 printable gate passes with company header, itemized quantities, specifications, driver details, and 4-tier signature blocks.
- **Firebase Firestore Integration Ready:**
  - In-app Firebase configuration modal to connect your Cloud Firestore database.
  - Built-in local reactive fallback mode so it runs seamlessly even before configuring cloud keys.
- **Role-Based Emulation:**
  - Switch between Central Warehouse Head and Site In-Charge to simulate the end-to-end dispatch and receipt workflow.

## 🎨 Theme & UI Design
- **Dominant Color:** Deep Industrial Charcoal (`#0F1217`, `#161B23`, `#1E2532`)
- **Accent & Highlights:** Safety Orange (`#FF6B00`, `#EA580C`, `#F97316`) for CTA buttons, interactive elements, and badges.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v4, Lucide Icons
- **Database:** Firebase Cloud Firestore (with local reactive fallback)

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```
