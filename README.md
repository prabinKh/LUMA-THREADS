# LUMA-THREADS

A high-performance modern e-commerce platform and industry-level store management suite built with **Next.js 15 (React 19, Tailwind CSS)** and **Django 5.2 (REST Framework, SQLite)**.

---

## 🌟 Highlights & Features

### 🛍️ Customer Storefront (`/web`)
- **Dynamic Colorways & Swatches:** Real-time visual color swatch selection where each individual dress/product colorway displays its own specific images, variant prices, and available size sets.
- **Deep-Linked URL Structure:** Dynamic color-slug routing (e.g. `/products/wes-high-rise-barrel-moonbeam?color=Raw+Ecru`).
- **Interactive Cart & Drawer:** Instant slide-out bag with size-selection indicators, quantity modifiers, and subtotal calculation.
- **Multi-Channel Checkout:** Support for **eSewa Mobile Wallet**, **Direct Bank Transfer**, and **Cash on Delivery (COD)**.

### 🏢 Store Admin Management Suite (`/backend/dashboard/`)
- **Single-Page Hash Routing:** `#overview`, `#products`, `#categories`, `#orders`, `#cart-requests`, `#customers` with deep-linking and zero-reload tab switching.
- **Inventory & Catalog Management:**
  - Dynamic hex color picker & swatches.
  - Per-color pricing and size-run configuration.
  - Primary cover image and secondary gallery uploads.
  - Full CRUD operations (Add, Edit, Delete).
- **Categories & Hierarchy:**
  - Hierarchical parent category & subcategory tree.
  - Mandatory category selection prior to subcategory creation.
- **Orders & Live Fulfillment Tracking:**
  - Real-time carrier assignment (**FedEx**, **DHL Express**, **Nepal Post**, **Aramex**).
  - Tracking number generation (`TRK-...`) and milestone progression.
  - Itemized printable tax invoices.
- **Cart Requests & Abandoned Bag Monitoring:**
  - Asynchronous background synchronization capturing customer cart additions in real time.
  - Lifecycle state tracking (`active`, `checkout`, `converted`, `abandoned`).
- **Customer Directory:**
  - User spend analytics, order history, and manual customer registration.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 2. Django Backend Setup

```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed initial catalog and sample dashboard data
python manage.py seed_catalog
python seed_admin_data.py

# Start Django backend server (Port 8000)
python manage.py runserver 8000
```

- **Dashboard:** [http://127.0.0.1:8000/dashboard/](http://127.0.0.1:8000/dashboard/)
- **Django Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
  - **Username:** `admin@lumathreads.com`
  - **Password:** `adminpassword123`

---

### 3. Next.js Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
```

- **Storefront:** [http://localhost:3000](http://localhost:3000)

---

## 📁 Repository Structure

```
├── backend/
│   ├── accounts/             # User authentication and customer profiles
│   ├── lumathreads/          # Core Django project settings & root URLs
│   ├── orders/               # Orders, tracking, and CartRequest models
│   ├── products/             # Catalog models, APIs, and dashboard views
│   ├── static/css/           # Admin dashboard stylesheet (dashboard.css)
│   ├── templates/            # Admin dashboard templates (dashboard.html)
│   └── manage.py
├── web/
│   ├── app/                  # Next.js App Router (pages, layout, checkout)
│   ├── components/           # UI components (Header, ProductCard, CartDrawer)
│   ├── lib/                  # Catalog data, types, and API connectors
│   └── package.json
└── README.md
```

---

## 📄 License
MIT License.
