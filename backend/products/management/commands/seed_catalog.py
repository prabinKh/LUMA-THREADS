import json
import re
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Collection, Product, ProductColor, ProductVariant
from orders.models import Order, OrderItem

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds categories, collections, and products from catalog.json and creates default admin user"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting catalog seed..."))

        # 1. Create Superuser
        admin_email = "admin@lumathreads.com"
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                username="admin",
                email=admin_email,
                password="adminpassword123",
                first_name="Store",
                last_name="Administrator",
            )
            self.stdout.write(self.style.SUCCESS(f"Superuser created: {admin_email} (Password: adminpassword123)"))
        else:
            self.stdout.write(self.style.NOTICE(f"Superuser already exists: {admin_email}"))

        # 2. Locate catalog.json
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        catalog_path = base_dir.parent / "web" / "lib" / "catalog.json"
        if not catalog_path.exists():
            catalog_path = base_dir / ".." / "web" / "lib" / "catalog.json"

        if not catalog_path.exists():
            self.stdout.write(self.style.ERROR(f"catalog.json not found at {catalog_path}"))
            return

        with open(catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 3. Seed Categories
        categories_data = data.get("categories", [])
        category_map = {}
        for idx, cat_data in enumerate(categories_data):
            title = cat_data.get("title", "")
            handle = cat_data.get("handle") or re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
            img = cat_data.get("image", "")
            cat, created = Category.objects.update_or_create(
                handle=handle,
                defaults={
                    "title": title,
                    "image": img,
                    "order": idx,
                },
            )
            category_map[handle] = cat
            if created:
                self.stdout.write(f"Created category: {title}")

        # Also create default "denim" category if missing
        if "denim" not in category_map:
            cat, _ = Category.objects.get_or_create(
                handle="denim",
                defaults={"title": "Denim", "order": len(category_map)}
            )
            category_map["denim"] = cat

        # 4. Seed Collections
        raw_collections = data.get("collections", {})
        collection_map = {}
        collection_prods_map = {}

        if isinstance(raw_collections, dict):
            for handle, col_info in raw_collections.items():
                title = col_info.get("title", handle.replace("-", " ").title())
                desc = col_info.get("description", "")
                col, created = Collection.objects.update_or_create(
                    handle=handle,
                    defaults={
                        "title": title,
                        "description": desc,
                    },
                )
                collection_map[handle] = col
                collection_prods_map[handle] = col_info.get("products", [])
                if created:
                    self.stdout.write(f"Created collection: {title}")
        elif isinstance(raw_collections, list):
            for col_data in raw_collections:
                title = col_data.get("title", "")
                handle = col_data.get("handle") or re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
                desc = col_data.get("description", "")
                col, created = Collection.objects.update_or_create(
                    handle=handle,
                    defaults={
                        "title": title,
                        "description": desc,
                    },
                )
                collection_map[handle] = col
                collection_prods_map[handle] = col_data.get("products", [])
                if created:
                    self.stdout.write(f"Created collection: {title}")

        # 5. Seed Products
        raw_products = data.get("products", {})
        if isinstance(raw_products, dict):
            products_items = []
            for k, v in raw_products.items():
                if isinstance(v, dict):
                    item = dict(v)
                    item.setdefault("handle", k)
                    products_items.append(item)
        else:
            products_items = raw_products

        created_count = 0
        updated_count = 0

        for p_data in products_items:
            handle = p_data.get("handle")
            if not handle:
                continue

            raw_price = p_data.get("price", 0)
            if isinstance(raw_price, str):
                cleaned = re.sub(r"[^\d.]", "", raw_price)
                price_dec = Decimal(cleaned) if cleaned else Decimal("0.00")
            else:
                price_dec = Decimal(str(raw_price))

            # Auto infer denim characteristics
            title_lower = p_data.get("title", "").lower()
            fit = ""
            for possible_fit in ["barrel", "wide leg", "straight", "flare", "bootcut", "skinny", "relaxed", "cargo"]:
                if possible_fit in title_lower:
                    fit = possible_fit.title()
                    break

            rise = ""
            for possible_rise in ["high rise", "mid rise", "low rise", "ultra high rise"]:
                if possible_rise in title_lower:
                    rise = possible_rise.title()
                    break

            wash = ""
            for possible_wash in ["light wash", "medium wash", "dark wash", "black", "white", "ecru", "indigo", "vintage"]:
                if possible_wash in title_lower or possible_wash in p_data.get("colorway", "").lower():
                    wash = possible_wash.title()
                    break

            prod, created = Product.objects.update_or_create(
                handle=handle,
                defaults={
                    "title": p_data.get("title", ""),
                    "colorway": p_data.get("colorway", ""),
                    "color": p_data.get("color", ""),
                    "price": price_dec,
                    "price_formatted": p_data.get("priceFormatted", f"${float(price_dec):.2f}"),
                    "image": p_data.get("image", ""),
                    "hover_image": p_data.get("hoverImage", ""),
                    "images": p_data.get("images", []),
                    "badge": p_data.get("badge", ""),
                    "description": p_data.get("description", ""),
                    "size_and_fit": p_data.get("sizeAndFit", ""),
                    "care": p_data.get("care", ""),
                    "sizes": p_data.get("sizes", []),
                    "details": p_data.get("details", []),
                    "swatches": p_data.get("swatches", []),
                    "fit": fit,
                    "rise": rise,
                    "wash": wash,
                    "category": category_map.get("denim"),
                    "is_featured": True if created_count < 8 else False,
                    "is_active": True,
                },
            )

            # Associate with collections if referenced
            for col_handle, col_prods in collection_prods_map.items():
                if handle in col_prods and col_handle in collection_map:
                    prod.collections.add(collection_map[col_handle])

            # Seed Color Variants from swatches
            for swatch in prod.swatches or []:
                s_name = swatch.get("name") or swatch.get("color")
                if s_name:
                    ProductColor.objects.update_or_create(
                        product=prod,
                        color_name=s_name,
                        defaults={
                            "color_hex": swatch.get("color") if str(swatch.get("color", "")).startswith("#") else "#2d3748",
                            "color_handle": swatch.get("handle", ""),
                            "primary_image": swatch.get("image", prod.image),
                            "hover_image": swatch.get("hoverImage", prod.hover_image),
                            "images": swatch.get("images", prod.images),
                        }
                    )

            # Seed Size & Pricing Variants
            for sz in prod.sizes or ["24", "25", "26", "27", "28", "29", "30", "31", "32"]:
                sku = f"{prod.handle}-{sz}".upper()
                ProductVariant.objects.update_or_create(
                    product=prod,
                    size=sz,
                    defaults={
                        "sku": sku,
                        "color_name": prod.colorway or prod.color or "Standard",
                        "price": prod.price,
                        "stock_quantity": 25,
                        "is_available": True,
                    }
                )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Products seeded: {created_count} created, {updated_count} updated."))

        # 6. Create Demo Order for Tracking
        if not Order.objects.filter(order_number="LT-DEMO101").exists():
            demo_order = Order.objects.create(
                order_number="LT-DEMO101",
                customer_name="Demo Shopper",
                customer_email="shopper@lumathreads.com",
                customer_phone="(555) 019-2834",
                shipping_address={
                    "address": "742 Evergreen Terrace",
                    "apartment": "Suite 4B",
                    "city": "Springfield",
                    "state": "OR",
                    "postal_code": "97477",
                    "country": "US",
                },
                subtotal=Decimal("376.00"),
                shipping_fee=Decimal("0.00"),
                total_amount=Decimal("376.00"),
                status="shipped",
                carrier="FedEx Express",
                tracking_number="TRK-9823471029",
                estimated_delivery="Thursday, 2-Day Delivery",
                payment_method="Apple Pay",
                payment_status="paid",
            )
            first_product = Product.objects.first()
            if first_product:
                OrderItem.objects.create(
                    order=demo_order,
                    product_name=first_product.title,
                    product_handle=first_product.handle,
                    color=first_product.colorway or first_product.color or "Vintage Blue",
                    size="27",
                    price=first_product.price,
                    quantity=2,
                    image_url=first_product.image,
                )
            self.stdout.write(self.style.SUCCESS("Created demo order: LT-DEMO101 (Tracking: TRK-9823471029)"))

        self.stdout.write(self.style.SUCCESS("Catalog seed completed successfully!"))
