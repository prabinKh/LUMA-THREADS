import os
import sys
import django
from decimal import Decimal

sys.path.append(r"C:\Users\Del\Documents\DSA\pattern\pistoladenim_site\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lumathreads.settings")
django.setup()

from accounts.models import User
from orders.models import Order, OrderItem, CartRequest
from products.models import Product

# 1. Create realistic sample customers if they don't exist
CUSTOMERS = [
    {
        "email": "aarav.shrestha@gmail.com",
        "username": "aarav_s",
        "first_name": "Aarav",
        "last_name": "Shrestha",
        "phone": "+977 9841234567",
        "address": "Lazimpat, Ward 2",
        "city": "Kathmandu",
        "postal_code": "44600",
        "country": "Nepal",
    },
    {
        "email": "priya.adhikari@yahoo.com",
        "username": "priya_a",
        "first_name": "Priya",
        "last_name": "Adhikari",
        "phone": "+977 9801987654",
        "address": "Jhamsikhel Road",
        "city": "Lalitpur",
        "postal_code": "44700",
        "country": "Nepal",
    },
    {
        "email": "sophia.martinez@outlook.com",
        "username": "sophia_m",
        "first_name": "Sophia",
        "last_name": "Martinez",
        "phone": "+1 213 555 0192",
        "address": "742 Evergreen Terrace",
        "city": "Los Angeles",
        "postal_code": "90015",
        "country": "US",
    },
    {
        "email": "elena.rostova@gmail.com",
        "username": "elena_r",
        "first_name": "Elena",
        "last_name": "Rostova",
        "phone": "+1 310 555 4892",
        "address": "450 Ocean Ave",
        "city": "Santa Monica",
        "postal_code": "90401",
        "country": "US",
    }
]

for c in CUSTOMERS:
    user, created = User.objects.get_or_create(
        email=c["email"],
        defaults={
            "username": c["username"],
            "first_name": c["first_name"],
            "last_name": c["last_name"],
            "phone": c["phone"],
            "address": c["address"],
            "city": c["city"],
            "postal_code": c["postal_code"],
            "country": c["country"],
        }
    )
    if created:
        user.set_password("Customer123!")
        user.save()
        print(f"Created Customer: {user.get_full_name()} ({user.email})")

# 2. Seed realistic Cart Requests
SAMPLE_CARTS = [
    {
        "session_id": "sess_8829a1b",
        "customer_email": "priya.adhikari@yahoo.com",
        "customer_name": "Priya Adhikari",
        "product_name": "Sloane Slouchy Denim Trench",
        "product_handle": "sloane-slouchy-denim-trench",
        "color": "Vintage Indigo",
        "size": "M",
        "price": Decimal("268.00"),
        "quantity": 1,
        "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80",
        "status": "active"
    },
    {
        "session_id": "sess_9912c3f",
        "customer_email": "aarav.shrestha@gmail.com",
        "customer_name": "Aarav Shrestha",
        "product_name": "Rowan Relaxed Carpenter Pant",
        "product_handle": "rowan-relaxed-carpenter-pant",
        "color": "Utility Taupe",
        "size": "29",
        "price": Decimal("198.00"),
        "quantity": 2,
        "image_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=300&q=80",
        "status": "checkout"
    },
    {
        "session_id": "sess_4412d8a",
        "customer_email": "sophia.martinez@outlook.com",
        "customer_name": "Sophia Martinez",
        "product_name": "Celeste Bias Cut Silk Slip Dress",
        "product_handle": "celeste-bias-cut-silk-slip-dress",
        "color": "Champagne Luster",
        "size": "S",
        "price": Decimal("218.00"),
        "quantity": 1,
        "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
        "status": "abandoned"
    },
    {
        "session_id": "sess_1102e5b",
        "customer_email": "elena.rostova@gmail.com",
        "customer_name": "Elena Rostova",
        "product_name": "Aria Ribbed Cashmere Polo",
        "product_handle": "aria-ribbed-cashmere-polo",
        "color": "Oatmeal Heather",
        "size": "M",
        "price": Decimal("228.00"),
        "quantity": 1,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80",
        "status": "converted"
    },
    {
        "session_id": "sess_7731f9c",
        "customer_email": "guest.buyer99@gmail.com",
        "customer_name": "Guest Shopper",
        "product_name": "Devon Structured Boxy Denim Jacket",
        "product_handle": "devon-structured-boxy-denim-jacket",
        "color": "Raw Ecru",
        "size": "L",
        "price": Decimal("188.00"),
        "quantity": 1,
        "image_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80",
        "status": "active"
    }
]

for cr in SAMPLE_CARTS:
    cart_obj, created = CartRequest.objects.get_or_create(
        session_id=cr["session_id"],
        product_handle=cr["product_handle"],
        defaults=cr
    )
    if created:
        print(f"Created CartRequest: {cart_obj.product_name} ({cart_obj.status})")

print("Seeding completed successfully!")

