# Luma Threads - Django REST Framework Backend

This is the official Django REST Framework backend for the **Luma Threads** luxury e-commerce web application.

---

## 🚀 Quick Start

### 1. Requirements
Ensure you have Python 3.10+ installed.

Dependencies can be installed via:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Database Migrations
```bash
python manage.py migrate
```

### 3. Seed Catalog Data & Default Admin
To automatically populate the database with all 46 products, categories, collections, and sample tracking order, run:
```bash
python manage.py seed_catalog
```

> **Default Superuser / Admin Credentials:**
> - **Email:** `admin@lumathreads.com`
> - **Username:** `admin`
> - **Password:** `adminpassword123`

### 4. Start the Django Server
```bash
python manage.py runserver 8000
```
The API will be available at [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/) and Django Admin at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).

---

## 📂 Project Architecture

```
backend/
├── lumathreads/             # Project settings & root routing
│   ├── settings.py         # DRF, JWT, CORS, Database config
│   ├── urls.py             # Root URL routing & API documentation
│   ├── wsgi.py
│   └── asgi.py
├── accounts/               # Custom User & Authentication App
│   ├── models.py           # Custom User with email login & addresses
│   ├── serializers.py      # User, Register, Login serializers
│   ├── views.py            # JWT Register, Login, Profile views
│   ├── urls.py             # /api/account/ endpoints
│   └── admin.py            # User management in Django Admin
├── products/               # Catalog, Collections & Products App
│   ├── models.py           # Category, Collection, Product models
│   ├── serializers.py      # DRF Product & Category serializers
│   ├── views.py            # Filtering by fit/rise/wash, search, sorting
│   ├── urls.py             # /api/store/ endpoints
│   ├── admin.py            # Product management with filter & search
│   └── management/
│       └── commands/
│           └── seed_catalog.py  # Seeding from catalog.json
├── orders/                 # Checkout, Orders & Tracking App
│   ├── models.py           # Order, OrderItem with tracking & address
│   ├── serializers.py      # Order & Order creation serializers
│   ├── views.py            # Order placement & Tracking lookup
│   ├── urls.py             # /api/orders/ endpoints
│   └── admin.py            # Order management with item inlines
├── db.sqlite3              # SQLite database (pre-seeded)
├── requirements.txt
└── manage.py
```

---

## 📡 API Endpoints

### 1. Catalog & Products
- `GET /api/store/products/` - List products with filter support:
  - `?category=<handle>` - Filter by category
  - `?collection=<handle>` - Filter by collection (`all-denim`, `best-sellers`, etc.)
  - `?fit=<fit>` - Filter by fit (`barrel`, `wide leg`, `straight`, etc.)
  - `?rise=<rise>` - Filter by rise (`high rise`, `mid rise`, etc.)
  - `?wash=<wash>` - Filter by wash
  - `?sort_by=price-ascending|price-descending|newest|title-ascending` - Sort products
  - `?search=<term>` - Full text search across title, description, color
- `GET /api/store/products/<handle>/` - Detailed product info by handle/slug
- `GET /api/store/categories/` - List all store categories
- `GET /api/store/collections/` - List all curated collections
- `GET /api/store/collections/<handle>/` - Collection details with associated products

### 2. Orders & Tracking
- `GET /api/orders/` - List orders (filtered by authenticated user or email)
- `POST /api/orders/` - Create a new order with items and shipping details
- `GET /api/orders/<order_number_or_tracking>/` - Retrieve order details and shipping status:
  - Test with demo order: `/api/orders/LT-DEMO101/` or tracking `/api/orders/TRK-9823471029/`

### 3. Accounts & Authentication
- `POST /api/account/register/` - Register user (returns user info + JWT tokens)
- `POST /api/account/login/` - Login with email & password (returns user info + JWT tokens)
- `GET /api/account/profile/` - Current authenticated user profile
- `POST /api/account/token/refresh/` - Refresh JWT access token

### 4. Admin Management
- `http://127.0.0.1:8000/admin/` - Fully-featured Django admin for managing Products, Categories, Collections, Orders, and Customers.

