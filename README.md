# 🧵 LUMA THREADS | Premium Apparel Storefront & Atelier Admin ERP

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Django 5.2](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.15-A30000?style=for-the-badge&logo=django)](https://www.django-rest-framework.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Luma Threads** is an industry-grade, full-stack luxury apparel e-commerce ecosystem and atelier store management suite. Designed with utilitarian aesthetic sensibilities, it combines a modern Shopify-caliber customer storefront with a full enterprise admin portal featuring live POS billing, second-by-second user activity & card interaction tracking, dynamic CMS page builders, and multi-angle analytics reporting.

---

## 📑 Table of Contents

- [Visual Showcase & Page Gallery](#-visual-showcase--page-gallery)
  - [Customer Storefront Experience](#1-customer-storefront-experience)
  - [Admin Enterprise Management Suite & POS](#2-admin-enterprise-management-suite--pos)
- [Key Features & Capabilities](#-key-features--capabilities)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [REST API Endpoints](#-rest-api-endpoints)
- [License](#-license)

---

## 📸 Visual Showcase & Page Gallery

### 1. Customer Storefront Experience

| Page View | Preview & Description |
| :--- | :--- |
| **01. Storefront Homepage** | Dynamic hero campaign banner, new arrival carousel, seasonal drops, curated categories, and artisan showcase.<br><br>![Storefront Home](docs/screenshots/01_storefront_home.png) |
| **02. Dynamic Mega Menu & Navigation** | Real-time multi-column mega menu dynamically generated from backend database categories and collections.<br><br>![Storefront Megamenu](docs/screenshots/02_storefront_megamenu.png) |
| **03. Catalog & Collection Grid** | Clean 4-column product grid with instant color swatch switching, quick sizing selector, and card hover effects.<br><br>![Collection Grid](docs/screenshots/03_storefront_collection.png) |
| **04. Product Detail Page (PDP)** | Multi-angle zoom gallery, isolated colorway narratives, dependent size inventory, and seamless cart addition.<br><br>![Product Detail](docs/screenshots/04_storefront_product_detail.png) |
| **05. Shopping Bag & Slide Cart** | Slide-out drawer with real-time subtotal, free shipping progress bar, promo code engine, and express checkout.<br><br>![Cart View](docs/screenshots/05_storefront_cart.png) |
| **06. Multi-Channel Checkout** | Seamless checkout supporting Credit Card, eSewa, Direct Bank Wire, and Cash on Delivery with instant validation.<br><br>![Checkout](docs/screenshots/06_storefront_checkout.png) |
| **07. Live Order Tracking** | Customer parcel tracking portal with milestone progression, courier status, and automated updates.<br><br>![Order Tracking](docs/screenshots/07_storefront_order_track.png) |
| **08. Storefront Dynamic Footer** | Configurable newsletter signup, support hours, social links, multi-column site links, and payment badges.<br><br>![Storefront Footer](docs/screenshots/08_storefront_footer.png) |

---

### 2. Admin Enterprise Management Suite & POS

| Admin Module | Preview & Description |
| :--- | :--- |
| **09. Executive Overview Dashboard** | Real-time revenue analytics, order status funnel, category sales velocity, and low-stock alerts.<br><br>![Admin Dashboard](docs/screenshots/09_admin_dashboard.png) |
| **10. Product Catalog Management** | Complete catalog overview with live search, stock status badges, category filters, and quick actions.<br><br>![Products List](docs/screenshots/10_admin_products_list.png) |
| **11. Advanced Atelier Product Studio** | Custom brand creation, merchandising badges, silhouette tags, colorway multi-image gallery & separate notes.<br><br>![Add Product Studio](docs/screenshots/11_admin_product_add.png) |
| **12. Categories & Subcategories** | Apparel taxonomy manager with drag-and-drop ordering, category icons, and subcategory assignment.<br><br>![Categories](docs/screenshots/12_admin_categories.png) |
| **13. Orders Lifecycle & Fulfillment** | Live order stream with status counters, tracking number management, customer records, and print invoices.<br><br>![Orders](docs/screenshots/13_admin_orders.png) |
| **14. POS Terminal & Retail Billing** | Point-of-Sale with product barcode lookup, customer billing selection, discount codes, and thermal receipt print.<br><br>![POS Terminal](docs/screenshots/14_admin_pos.png) |
| **15. Business Analytics & Reports** | 10 multi-angle business reports: sales by city, country, product, category, brand, stock, and top customers.<br><br>![Reports](docs/screenshots/15_admin_reports.png) |
| **16. Homepage Hero Campaign CMS** | Live banner editor with campaign presets, desktop/mobile upload, CTA destinations, and real-time storefront sync.<br><br>![Hero CMS](docs/screenshots/16_admin_hero_settings.png) |
| **17. Dynamic Footer CMS Builder** | Complete control over newsletter text, customer support hours, social media URLs, and 3 navigation columns.<br><br>![Footer CMS](docs/screenshots/17_admin_footer_settings.png) |
| **18. User Activity & Card Seconds Tracker** | Second-by-second analytics: active seconds per page, card hover duration (⏱), swatch clicks, and user journeys.<br><br>![User Activity](docs/screenshots/18_admin_user_activity.png) |
| **19. Customer Directory & CRM Profile** | Shopper profile directory, purchase volume history, total spend calculation, and direct customer outreach.<br><br>![Customers CRM](docs/screenshots/19_admin_customers.png) |

---

## ⚡ Key Features & Capabilities

### 🛍️ Client Storefront
- **Dynamic Denim Swatch Picker**: Instant client-side colorway swapping on product cards and PDP without page reload.
- **Colorway-Dependent Pricing & Sizing**: Each individual colorway supports independent pricing, original compare-at prices, and isolated size matrices.
- **Dynamic Megamenu**: Live categories, subcategories, and curated drops reflected directly in the header navigation.
- **Cart & Slide Drawer**: Global state management with item counts, auto-applied promos, and persistent cart requests.
- **Multi-Method Checkout**: Multi-step checkout supporting eSewa, Bank Transfer, Card, and Cash on Delivery.
- **Customer Portal**: Sign in/sign out, profile management, and live order milestone tracking.

### 💼 Admin ERP & Management Suite
- **Atelier Product Creator**:
  - **Brand CRUD**: Create and delete atelier brands with instant backend synchronization.
  - **Merchandising Badges**: Dynamic uppercase badge creation with one-click chip deletion.
  - **Gender / Silhouette Options**: Create and remove custom fit silhouettes (e.g. *Oversized Fit*, *Relaxed Silhouette*).
  - **Colorway Multi-Picture Suite**: Bulk multi-file upload, comma/newline URL paste, swatch selector, and visual gallery.
  - **Independent Colorway Descriptions**: Each colorway has its own isolated multi-note description editor.
- **Point-of-Sale (POS) Retail Billing**: Fast cash register interface with customer selection, automated tax/subtotal calculation, and printable invoice generation.
- **Second-by-Second Activity Tracking**: Tracks every single user (logged-in or guest), exact seconds spent on each page route, and exact seconds spent hovering/interacting with each product card.
- **Dynamic Hero & Footer CMS**: Customize storefront campaign headlines, mobile/desktop imagery, support hours, and navigation links with instant live reflection.
- **Comprehensive Reports Engine**: 10 distinct analytical reports covering sales by geographic region, top products, inventory depletion, and customer loyalty.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client["🌐 Next.js 15 Storefront & Admin SPA"] -->|REST API / JSON| Django["⚙️ Django 5.2 REST Framework"]
    Client -->|Local Caching & Events| Storage["💾 LocalStorage & CustomEvents"]
    Django -->|ORM Queries| DB[("🗄️ SQLite / PostgreSQL Database")]
    Django -->|File Storage| Media["📁 Media Assets & JSON Data"]
    
    subgraph Frontend Architecture
        NextApp["Next.js App Router (app/)"]
        AdminSPA["Admin SPA (web/admin/)"]
        Components["Modular UI Components"]
        API_Services["Axios Client API Services"]
    end
    
    subgraph Backend Architecture
        DashboardViews["Dashboard & Analytics APIs"]
        StoreViews["Store Catalog & Orders APIs"]
        AuthViews["JWT & Session Auth"]
        Models["Relational Models & Migrations"]
    end
```

### Core Technologies:
- **Frontend**: Next.js 15.5, React 19, TypeScript, Tailwind CSS, Recharts, GSAP, Lucide Icons, Sonner Toasts.
- **Backend**: Python 3.12, Django 5.2, Django REST Framework (DRF), Django CORS Headers.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **Testing & Verification**: Playwright Chromium automation test suite.

---

## 📁 Project Directory Structure

```text
LUMA-THREADS/
├── backend/                       # Django REST Backend
│   ├── accounts/                  # User authentication & customer profiles
│   ├── data/                      # Persistent JSON storage (Hero, Footer, Activity)
│   ├── lumathreads/               # Project settings & root URL routing
│   ├── orders/                    # Orders, cart requests & payment logic
│   ├── products/                  # Catalog, categories, dashboard views & reports
│   └── manage.py                  # Django management CLI
├── web/                           # Next.js 15 Frontend
│   ├── admin/                     # Admin ERP Portal & Management SPA
│   │   ├── AddProduct.tsx         # Atelier Product Creator Studio
│   │   ├── FooterSettings.tsx     # Dynamic Storefront Footer CMS
│   │   ├── HeroSettings.tsx       # Homepage Hero Campaign CMS
│   │   ├── POS.tsx                # Point-of-Sale Terminal & Invoicing
│   │   ├── UserActivity.tsx       # Second-by-Second Activity Analytics
│   │   └── reports/               # 10 Dedicated Business Analytical Reports
│   ├── api/                       # Typed Axios API Client Services
│   ├── app/                       # Next.js App Router Pages & API Routes
│   ├── components/                # Reusable UI & Storefront Components
│   └── lib/                       # Catalog utilities, types, and helpers
├── docs/                          # Project Documentation
│   └── screenshots/               # High-resolution screenshots of all 19 pages
└── README.md                      # Primary Project Documentation
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **Python**: v3.10+ (v3.12 recommended)
- **Git**

---

### 2. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd LUMA-THREADS/backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install django djangorestframework django-cors-headers pillow
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   *The backend REST API will be accessible at `http://127.0.0.1:8000/api/`.*

---

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd LUMA-THREADS/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env.local` if needed):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   NEXT_PUBLIC_DJANGO_API_URL=http://127.0.0.1:8000/api
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The storefront will be live at `http://localhost:3000/` and the admin portal at `http://localhost:3000/admin`.*

---

## 🔌 REST API Endpoints

| Endpoint Route | Method | Description |
| :--- | :---: | :--- |
| `/api/store/products/` | `GET` | List all active catalog products |
| `/api/store/categories/` | `GET` | Retrieve category tree with subcategories |
| `/api/store/collections/` | `GET` | Retrieve curated drop collections |
| `/api/admin/hero-settings/` | `GET`, `POST` | Retrieve and update homepage hero campaign settings |
| `/api/admin/footer-settings/` | `GET`, `POST` | Retrieve and update storefront footer settings |
| `/api/admin/activity/` | `GET`, `POST` | Ingest and query second-by-second user and card tracking logs |
| `/api/admin/brands/` | `GET`, `POST` | List and create atelier brands |
| `/api/admin/brands/<slug>/` | `DELETE` | Delete atelier brand |
| `/api/admin/orders/` | `GET`, `POST` | List orders and create POS billing transactions |
| `/api/admin/reports/` | `GET` | Fetch multi-angle analytics (sales by city, country, etc.) |

---

