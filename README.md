# VoltFlow Enterprise — Multi-Branch Electrical Grid Inventory System

VoltFlow Enterprise is a production-grade SaaS Multi-Branch Inventory and Stock Transfer Management System purpose-built for electrical engineering and power grid infrastructure operations (CCCE). It provides unified multi-location tracking, automated challan generation, role-based access control (RBAC), Recharts executive analytics, and hardened Firestore audit ledgering across 11 national power grid substations in Bangladesh.

---

## ⚡ Technology Stack

- **Frontend Core:** React 19, Vite, JavaScript (ESM)
- **Styling & Icons:** Tailwind CSS, Lucide React
- **Analytics & Visualizations:** Recharts (Dynamic Area, Bar, Donut, and Stock In/Out Charts)
- **Authentication:** Firebase Authentication (Email/Password, Persistent Sessions, Disabled Account Guard)
- **Database:** Google Cloud Firestore (Collections: `products`, `categories`, `branches`, `users`, `transfers`, `movements`)
- **Hosting & Deployment:** Vercel (Frontend SPA with `vercel.json` rewrites) & Firebase Hosting
- **Testing Suites:** Automated Node.js integration & security test suites

---

## 🏢 11 Bangladesh Grid Substations Network

The system is hardwired to manage real power grid substations across Bangladesh:
1. **Gazaria 230 KV Substation** (`loc_gazaria_230` - Central Main Hub)
2. **Kobirpur 230 KV Substation** (`loc_kobirpur_230`)
3. **Kaliakoir 230 KV Substation** (`loc_kaliakoir_230`)
4. **Dhamrai 230 KV Substation** (`loc_dhamrai_230`)
5. **Tangail 230 KV Substation** (`loc_tangail_230`)
6. **Aricha 132 KV Substation** (`loc_aricha_132`)
7. **Mirpur 132 KV Substation** (`loc_mirpur_132`)
8. **Tongi 132 KV Substation** (`loc_tongi_132`)
9. **Basundhara 132 KV Substation** (`loc_basundhara_132`)
10. **Mirpur 33 KV Substation** (`loc_mirpur_33`)
11. **Purbachol 33 KV Substation** (`loc_purbachol_33`)

---

## 🔒 Security Architecture & Role-Based Access Control (RBAC)

### 1. Main Admin (Full Executive Access)
- **Catalog Management:** Create, edit, and archive electrical products and categories with unique SKU and active product safeguards.
- **Substation Control:** Register new substations, edit station data, and toggle active status (Central Main Hub protected from deactivation).
- **User Provisioning:** Create and provision Branch Engineers, assign and reassign substations, and enable/disable accounts.
- **National Dispatch:** Authorized to create transfers between any pair of grid substations.
- **Inventory Adjustments:** Authorized to perform physical inventory reconciliations with mandatory audit reason logging.

### 2. Branch Engineer (Single-Substation Constrained Access)
- **Substation Lock:** An engineer is assigned to **exactly one active substation** at all times.
- **Read Permissions:** Can view products, categories, global inventory across all 11 substations, and reports.
- **Dispatch Restriction:** Can **only** initiate stock transfers where the origin is their assigned substation (`fromLocationId == userProfile.branchId`). Client-side and server-side tampering attempts are blocked with 403 Forbidden.
- **Receipt Restriction:** Can only mark delivery receipt on shipments consigned specifically to their substation.
- **No Administrative Controls:** Blocked from modifying user profiles, creating products, editing branch records, or altering security settings.

---

## 📦 Installation & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/nasiruddindev/ccce.git
cd ccce
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Duplicate `.env.example` as `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Firebase project keys from Firebase Console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ccce-ec559.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ccce-ec559
VITE_FIREBASE_STORAGE_BUCKET=ccce-ec559.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=447856789186
VITE_FIREBASE_APP_ID=1:447856789186:web:b114464410aa2b32d35d5b
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Automated Testing & Security Verification

Execute the test suites to verify system integrity:

```bash
# Test Phase 2: Authentication & RBAC Access
node test/authTest.js

# Test Phase 3: Product, Category, Branch & User CRUD Safeguards
node test/phase3Test.js

# Test Phase 5: Dashboard Analytics, Recharts & 8 Report Types
node test/phase5Test.js

# Test Phase 6: Security Hardening, Idempotency & Atomic Transfers
node test/phase6SecurityTest.js
```

---

## 🚀 Production Deployment Instructions

### Option A: Vercel Frontend Deployment (Recommended)

1. **Connect GitHub Repository:**
   - Log into [Vercel Dashboard](https://vercel.com).
   - Click **Add New Project** and select your GitHub repository: `nasiruddindev/ccce`.
2. **Framework & Build Settings:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables:**
   - In Vercel Project Settings > **Environment Variables**, add the 6 `VITE_FIREBASE_*` variables from your `.env` file.
4. **Deploy:**
   - Click **Deploy**. Vercel will build the project and output your live production URL (e.g., `https://ccce.vercel.app`).
   - The included [`vercel.json`](file:///C:/Users/Admin/.gemini/antigravity/scratch/voltflow-inventory/vercel.json) ensures nested client-side route refreshes (`/products`, `/stock-transfer`, etc.) work seamlessly without 404 errors.

---

### Option B: Firebase Hosting & Security Rules Deployment

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. **Deploy Security Rules & Indexes:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
3. **Deploy Frontend to Firebase Hosting:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 👑 First-Time Admin Provisioning (Bootstrap)

Because **public self-registration is strictly disabled**, initialize the very first administrator account using either:

### Method 1: Web UI Bootstrap (One-Click)
1. Navigate to `/login`.
2. Enter your desired master email and password.
3. Click **"First-time project setup? Provision Initial Main Admin"**.
4. The system safely creates the `Main Admin` profile and authenticates immediately.

### Method 2: Trusted Backend Script (Firebase Admin SDK)
1. Download `serviceAccountKey.json` from Firebase Console (**Project Settings > Service accounts > Generate new private key**).
2. Place `serviceAccountKey.json` inside the `scripts/` directory.
3. Run the bootstrap runner:
   ```bash
   node scripts/bootstrapAdmin.js
   ```

---

## 📑 8 Operational Reports & CSV Export Center

Access `/reports` to filter and export 8 operational datasets with date range, substation, category, and movement filters:
1. **Overall Stock Report:** Total volume, unit price, asset valuation, and stock statuses.
2. **Branch-wise Inventory Report:** Physical holding volume and SKU distribution by substation.
3. **Product-wise Stock Report:** Multi-branch breakdown for each individual SKU.
4. **Low Stock Report:** Items below safety threshold with deficit calculations.
5. **Out-of-Stock Report:** Items with zero inventory balance.
6. **Stock Transfer Report:** Challans, carrier vehicles, drivers, origin, destination, and status.
7. **Stock Movement Report:** Immutable ledger of receipts, dispatches, site usages, and adjustments.
8. **Stock Adjustment Report:** Physical counts, surplus reconciliations, and damage write-offs with audit logs.

Click **"Export Active Report (CSV)"** to instantly generate clean, Excel-compatible CSV documents.

---

## 🛡️ Security Audit & Troubleshooting

| Symptom / Error | Cause | Resolution |
| :--- | :--- | :--- |
| `Security Exception: Unauthorized source substation` | A Branch Engineer attempted to dispatch from a station other than their assigned branch. | Non-admins can only dispatch from their assigned substation. |
| `Action Denied: Cannot archive category... contains active products` | Category contains active products in the catalog. | Reassign or archive the products before archiving the category. |
| `Action Denied: Central Grid Hub cannot be deactivated` | Main Hub (`loc_gazaria_230`) is protected. | The central grid depot must remain permanently active. |
| `Insufficient Stock Error` | Requested dispatch quantity exceeds on-hand stock at source. | Review physical available quantity before dispatch. |
| `Duplicate SKU Error` | An item with the same SKU already exists. | SKUs must be unique across the entire catalog. |

---

## 📄 License & Attribution
Designed and engineered for **VoltFlow Enterprise Power Grid Operations** (CCCE).
Confidential and Proprietary.
