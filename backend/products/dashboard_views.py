import os
import uuid
import datetime
import json
from decimal import Decimal
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count, Q, Max
from .models import Product, Category, SubCategory, Collection, ProductColor, ProductVariant
from orders.models import Order, OrderItem, CartRequest
from accounts.models import User


def get_dashboard_metrics():
    orders = Order.objects.all().prefetch_related("items").order_by("-created_at")
    products = Product.objects.all()
    categories = Category.objects.all().prefetch_related("subcategories")
    subcategories = SubCategory.objects.all()
    cart_requests = CartRequest.objects.all().order_by("-updated_at")
    users = User.objects.all().annotate(orders_count=Count("orders"))

    total_revenue = orders.filter(~Q(status="cancelled")).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
    total_orders_count = orders.count()
    total_products_count = products.count()
    total_users_count = users.count()
    active_carts_count = cart_requests.filter(status__in=["active", "checkout"]).count()

    status_counts = {
        "processing": orders.filter(status="processing").count(),
        "shipped": orders.filter(status="shipped").count(),
        "delivered": orders.filter(status="delivered").count(),
        "cancelled": orders.filter(status="cancelled").count(),
    }

    payment_counts = {
        "esewa": orders.filter(payment_method__icontains="esewa").count(),
        "bank": orders.filter(payment_method__icontains="bank").count(),
        "cod": orders.filter(Q(payment_method__icontains="cash") | Q(payment_method__icontains="cod")).count(),
        "card": orders.filter(payment_method__icontains="card").count(),
    }

    return {
        "total_revenue": total_revenue,
        "total_orders_count": total_orders_count,
        "total_products_count": total_products_count,
        "total_users_count": total_users_count,
        "active_carts_count": active_carts_count,
        "status_counts": status_counts,
        "payment_counts": payment_counts,
        "categories_count": categories.count(),
        "subcategories_count": subcategories.count(),
    }


def dashboard_overview_view(request):
    """Individual Page 1: Dashboard Overview & Real-Time Analytics."""
    metrics = get_dashboard_metrics()
    orders = Order.objects.all().prefetch_related("items").order_by("-created_at")
    context = {
        **metrics,
        "active_tab": "overview",
        "recent_orders": orders[:8],
    }
    return render(request, "dashboard/overview.html", context)


def dashboard_products_view(request):
    """Individual Page 2: Products & Catalog Inventory."""
    products = (
        Product.objects.all()
        .select_related("category", "subcategory")
        .prefetch_related("color_variants", "variants")
        .order_by("-created_at")
    )
    categories = Category.objects.all().order_by("order", "title")
    context = {
        "products": products,
        "categories": categories,
        "active_tab": "products",
    }
    return render(request, "dashboard/products.html", context)


def dashboard_product_add_view(request):
    """Individual Page 3: Add New Product Form."""
    categories = Category.objects.all().order_by("order", "title")
    subcategories = SubCategory.objects.all().select_related("category").order_by("order", "title")
    context = {
        "categories": categories,
        "subcategories": subcategories,
        "active_tab": "product_add",
    }
    return render(request, "dashboard/product_add.html", context)


def dashboard_product_edit_view(request, handle_or_id):
    """Individual Page 4: Edit Product Form."""
    product = None
    if str(handle_or_id).isdigit():
        product = Product.objects.filter(id=handle_or_id).first()
    if not product:
        product = Product.objects.filter(handle=handle_or_id).first()
    if not product:
        product = get_object_or_404(Product, handle=handle_or_id)

    categories = Category.objects.all().order_by("order", "title")
    subcategories = SubCategory.objects.all().select_related("category").order_by("order", "title")
    context = {
        "product": product,
        "categories": categories,
        "subcategories": subcategories,
        "active_tab": "products",
    }
    return render(request, "dashboard/product_edit.html", context)


def dashboard_categories_view(request):
    """Individual Page 5: Categories & Subcategories Hierarchy."""
    categories = Category.objects.all().prefetch_related("subcategories", "products").order_by("order", "title")
    subcategories = SubCategory.objects.all().select_related("category").prefetch_related("products").order_by("order", "title")
    max_cat_order = Category.objects.all().aggregate(Max("order"))["order__max"] or 0
    context = {
        "categories": categories,
        "subcategories": subcategories,
        "next_cat_order": max_cat_order + 1,
        "active_tab": "categories",
    }
    return render(request, "dashboard/categories.html", context)


def dashboard_orders_view(request):
    """Individual Page 6: Orders & Live Fulfillment Tracking."""
    orders = Order.objects.all().prefetch_related("items").order_by("-created_at")
    context = {
        "orders": orders,
        "active_tab": "orders",
    }
    return render(request, "dashboard/orders.html", context)


def dashboard_order_detail_view(request, order_id):
    """Individual Page 7: Order Detail & Itemized Tax Invoice."""
    order = get_object_or_404(Order.objects.prefetch_related("items"), id=order_id)
    context = {
        "order": order,
        "active_tab": "orders",
    }
    return render(request, "dashboard/order_detail.html", context)


def dashboard_cart_requests_view(request):
    """Individual Page 8: Customer Cart Requests & Real-time Bags."""
    cart_requests = CartRequest.objects.all().order_by("-updated_at")
    context = {
        "cart_requests": cart_requests,
        "active_tab": "cart_requests",
    }
    return render(request, "dashboard/cart_requests.html", context)


def dashboard_customers_view(request):
    """Individual Page 9: Customers & Registered Users Directory."""
    users = User.objects.all().annotate(orders_count=Count("orders")).order_by("-date_joined")
    context = {
        "users": users,
        "active_tab": "customers",
    }
    return render(request, "dashboard/customers.html", context)


def dashboard_view(request):
    """Alias pointing to the Overview individual page."""
    return dashboard_overview_view(request)


@csrf_exempt
def api_product_create(request):
    """Create a brand new product or list products for admin API."""
    if request.method == "GET":
        prods = Product.objects.all().select_related("category", "subcategory")
        results = []
        for p in prods:
            results.append({
                "id": str(p.id),
                "name": p.title,
                "title": p.title,
                "handle": p.handle,
                "slug": p.handle,
                "price": float(p.price),
                "category": p.category.title if p.category else "Uncategorized",
                "category_id": p.category_id,
                "subcategory_id": p.subcategory_id,
                "image": p.image,
                "hover_image": p.hover_image,
                "images": [p.image, p.hover_image] if p.hover_image else [p.image],
                "stock": 50,
                "is_active": p.is_active,
            })
        return JsonResponse(results, safe=False)

    if request.method != "POST":
        return JsonResponse({"error": "GET or POST required"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        data = request.POST.dict()

    title = data.get("title", "").strip() or data.get("name", "").strip()
    if not title:
        return JsonResponse({"error": "Product title is required"}, status=400)

    import time
    base_handle = data.get("handle", "").strip() or data.get("slug", "").strip() or title.lower().replace(" ", "-").replace("/", "-")
    handle = base_handle
    if Product.objects.filter(handle=handle).exists():
        handle = f"{base_handle}-{int(time.time())}"

    price = Decimal(str(data.get("price") or "168.00"))
    
    category_id = data.get("category_id") or data.get("category")
    if category_id and not str(category_id).isdigit():
        cat = Category.objects.filter(Q(handle=category_id) | Q(title__iexact=str(category_id))).first()
        category_id = cat.id if cat else None

    subcategory_id = data.get("subcategory_id") or data.get("subcategory")
    if subcategory_id and not str(subcategory_id).isdigit():
        sub = SubCategory.objects.filter(Q(handle=subcategory_id) | Q(title__iexact=str(subcategory_id))).first()
        subcategory_id = sub.id if sub else None
    
    # Validation: if subcategory is selected, ensure it belongs to category
    if subcategory_id and not category_id:
        sub = SubCategory.objects.filter(id=subcategory_id).first()
        if sub:
            category_id = sub.category_id

    images = data.get("images", [])
    primary_img = data.get("image") or (images[0] if isinstance(images, list) and images else "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80")
    hover_img = data.get("hover_image") or data.get("hoverImage") or (images[1] if isinstance(images, list) and len(images) > 1 else primary_img)

    gallery_imgs = images if isinstance(images, list) and images else []
    if primary_img and primary_img not in gallery_imgs:
        gallery_imgs.insert(0, primary_img)
    if hover_img and hover_img not in gallery_imgs and hover_img != primary_img:
        gallery_imgs.append(hover_img)

    sizes = data.get("sizes", ["XS", "S", "M", "L"])
    if isinstance(sizes, str):
        sizes = [s.strip() for s in sizes.split(",") if s.strip()]

    details_val = data.get("details", [])
    if isinstance(details_val, str):
        details_val = [d.strip() for d in details_val.split("\n") if d.strip()]
    elif not isinstance(details_val, list):
        details_val = []

    brand_val = data.get("brand_name") or data.get("brand") or ""
    if brand_val and isinstance(brand_val, str) and not any(str(d).lower().startswith("brand:") for d in details_val):
        details_val.insert(0, f"Brand: {brand_val}")

    prod = Product.objects.create(
        title=title,
        handle=handle,
        price=price,
        price_formatted=f"${float(price):.2f}",
        category_id=category_id,
        subcategory_id=subcategory_id,
        description=data.get("description", ""),
        badge=data.get("badge", "NEW ARRIVAL"),
        fit=data.get("fit", ""),
        rise=data.get("rise", ""),
        wash=data.get("wash", ""),
        sizes=sizes,
        colorway=data.get("colorway", "Default"),
        color=data.get("color", "default"),
        image=primary_img,
        hover_image=hover_img,
        images=gallery_imgs,
        size_and_fit=data.get("size_and_fit", "") or data.get("sizeAndFit", ""),
        care=data.get("care", ""),
        details=details_val,
        is_featured=bool(data.get("is_featured", False)),
        is_active=bool(data.get("is_active", True)),
    )

    collections_data = data.get("collections", [])
    if isinstance(collections_data, list) and collections_data:
        for c_item in collections_data:
            c_obj = None
            if str(c_item).isdigit():
                c_obj = Collection.objects.filter(id=c_item).first()
            if not c_obj:
                c_obj = Collection.objects.filter(Q(handle=str(c_item)) | Q(title__iexact=str(c_item))).first()
            if c_obj:
                prod.collections.add(c_obj)

    # Attach colors if provided
    color_variants_data = data.get("color_variants")
    swatches_list = []
    if isinstance(color_variants_data, list) and len(color_variants_data) > 0:
        # First colorway dictates the root product defaults
        first_cv = color_variants_data[0]
        first_price = Decimal(str(first_cv.get("price") or price))
        first_img = first_cv.get("primary_image") or primary_img
        first_hover = first_cv.get("hover_image") or hover_img
        first_sizes = first_cv.get("sizes") or sizes
        if isinstance(first_sizes, str):
            first_sizes = [s.strip() for s in first_sizes.split(",") if s.strip()]
        first_name = first_cv.get("color_name") or "Default"
        first_hex = first_cv.get("color_hex") or "#000000"
        first_desc = first_cv.get("description")

        prod.price = first_price
        prod.price_formatted = f"${float(first_price):.2f}"
        prod.image = first_img
        prod.hover_image = first_hover
        prod.sizes = first_sizes
        prod.colorway = first_name
        prod.color = first_hex
        if first_desc:
            prod.description = first_desc

        for cv in color_variants_data:
            c_name = cv.get("color_name") or "Default"
            c_hex = cv.get("color_hex") or "#000000"
            p_img = cv.get("primary_image") or prod.image
            h_img = cv.get("hover_image") or prod.hover_image
            c_price = Decimal(str(cv.get("price") or prod.price))
            c_sizes = cv.get("sizes") or prod.sizes
            c_desc = cv.get("description") or prod.description
            if isinstance(c_sizes, str):
                c_sizes = [s.strip() for s in c_sizes.split(",") if s.strip()]

            pcolor = ProductColor.objects.create(
                product=prod,
                color_name=c_name,
                color_hex=c_hex,
                color_handle=c_name.lower().replace(" ", "-"),
                primary_image=p_img,
                hover_image=h_img,
                images=[p_img, h_img],
                price=c_price,
                sizes=c_sizes
            )
            c_descriptions = cv.get("descriptions")
            if not c_descriptions and c_desc:
                c_descriptions = [c_desc]
            elif not c_descriptions:
                c_descriptions = []

            swatches_list.append({
                "name": c_name,
                "color": c_hex,
                "handle": prod.handle,
                "image": p_img,
                "hoverImage": h_img,
                "price": float(c_price),
                "priceFormatted": f"${float(c_price):.2f}",
                "sizes": c_sizes,
                "description": c_desc or (c_descriptions[0] if c_descriptions else ""),
                "descriptions": c_descriptions,
            })
            for sz in c_sizes:
                sku = f"{prod.handle[:8]}-{pcolor.id}-{sz}".upper()
                ProductVariant.objects.create(
                    sku=sku,
                    product=prod,
                    color=pcolor,
                    color_name=c_name,
                    size=sz,
                    price=c_price,
                    stock_quantity=50,
                    is_available=True
                )
    else:
        # Create at least 1 colorway
        pcolor = ProductColor.objects.create(
            product=prod,
            color_name=prod.colorway or "Default",
            color_hex="#1a202c",
            color_handle=prod.handle,
            primary_image=prod.image,
            hover_image=prod.hover_image,
            images=[prod.image, prod.hover_image],
            price=prod.price,
            sizes=prod.sizes
        )
        swatches_list.append({
            "name": prod.colorway or "Default",
            "color": "#1a202c",
            "handle": prod.handle,
            "image": prod.image,
            "hoverImage": prod.hover_image,
            "price": float(prod.price),
            "priceFormatted": f"${float(prod.price):.2f}",
            "sizes": prod.sizes
        })

    prod.swatches = swatches_list
    prod.save()

    return JsonResponse({
        "success": True,
        "message": f"Product '{prod.title}' created successfully!",
        "product_id": prod.id,
        "id": prod.id,
        "handle": prod.handle,
        "slug": prod.handle,
        "title": prod.title,
        "name": prod.title,
        "price": float(prod.price),
        "category": prod.category.title if prod.category else "Uncategorized",
        "category_id": prod.category_id,
        "image": prod.image,
    }, status=201)


@csrf_exempt
def api_product_detail(request, handle_or_id):
    """API endpoint to get product details for the edit modal, or update/delete."""
    product = None
    if str(handle_or_id).isdigit():
        product = Product.objects.filter(id=handle_or_id).first()
    if not product:
        product = Product.objects.filter(handle=handle_or_id).first()

    if not product:
        return JsonResponse({"error": "Product not found"}, status=404)

    if request.method == "GET":
        colors_data = []
        for cv in product.color_variants.all():
            colors_data.append({
                "id": cv.id,
                "color_name": cv.color_name,
                "color_hex": cv.color_hex,
                "primary_image": cv.primary_image,
                "hover_image": cv.hover_image,
                "images": cv.images if isinstance(cv.images, list) else [],
                "price": str(cv.price) if cv.price else str(product.price),
                "sizes": cv.sizes if isinstance(cv.sizes, list) else product.sizes,
            })

        return JsonResponse({
            "id": product.id,
            "title": product.title,
            "handle": product.handle,
            "price": str(product.price),
            "category_id": product.category_id,
            "subcategory_id": product.subcategory_id,
            "description": product.description,
            "image": product.image,
            "hover_image": product.hover_image,
            "sizes": product.sizes,
            "fit": product.fit,
            "rise": product.rise,
            "wash": product.wash,
            "colorway": product.colorway,
            "color": product.color,
            "is_active": product.is_active,
            "color_variants": colors_data,
        })

    elif request.method in ["POST", "PUT", "PATCH"]:
        try:
            data = json.loads(request.body.decode("utf-8"))
        except Exception:
            data = request.POST.dict()

        product.title = data.get("title", product.title)
        product.handle = data.get("handle", product.handle)
        if "price" in data and data["price"]:
            product.price = Decimal(str(data["price"]))
            product.price_formatted = f"${float(product.price):.2f}"

        if "category_id" in data:
            product.category_id = data["category_id"] or None
        if "subcategory_id" in data:
            product.subcategory_id = data["subcategory_id"] or None

        product.description = data.get("description", product.description)
        product.colorway = data.get("colorway", product.colorway)
        product.color = data.get("color", product.color)
        product.fit = data.get("fit", product.fit)
        product.rise = data.get("rise", product.rise)
        product.wash = data.get("wash", product.wash)
        product.image = data.get("image", product.image)
        product.hover_image = data.get("hover_image", product.hover_image)

        if "sizes" in data:
            product.sizes = data["sizes"] if isinstance(data["sizes"], list) else [s.strip() for s in str(data["sizes"]).split(",") if s.strip()]

        if "is_active" in data:
            product.is_active = bool(data["is_active"])

        # Sync color variants if provided
        color_variants_data = data.get("color_variants")
        if isinstance(color_variants_data, list):
            swatches_list = []
            for cv_data in color_variants_data:
                c_name = cv_data.get("color_name") or "Default"
                c_hex = cv_data.get("color_hex") or "#000000"
                p_img = cv_data.get("primary_image") or product.image
                h_img = cv_data.get("hover_image") or product.hover_image
                extra_imgs = cv_data.get("images", [])
                if isinstance(extra_imgs, str):
                    extra_imgs = [i.strip() for i in extra_imgs.split(",") if i.strip()]
                c_price = Decimal(str(cv_data.get("price") or product.price))
                c_sizes = cv_data.get("sizes") or product.sizes
                if isinstance(c_sizes, str):
                    c_sizes = [s.strip() for s in c_sizes.split(",") if s.strip()]

                cv_obj, _ = ProductColor.objects.update_or_create(
                    product=product,
                    color_name=c_name,
                    defaults={
                        "color_hex": c_hex,
                        "primary_image": p_img,
                        "hover_image": h_img,
                        "images": extra_imgs,
                        "price": c_price,
                        "sizes": c_sizes,
                    }
                )
                cv_desc = cv_data.get("description", "")
                cv_descs = cv_data.get("descriptions") or ([cv_desc] if cv_desc else [])
                swatches_list.append({
                    "name": c_name,
                    "color": c_hex,
                    "handle": product.handle,
                    "image": p_img,
                    "hoverImage": h_img,
                    "images": extra_imgs,
                    "price": float(c_price),
                    "priceFormatted": f"${float(c_price):.2f}",
                    "sizes": c_sizes,
                    "description": cv_desc or (cv_descs[0] if cv_descs else ""),
                    "descriptions": cv_descs,
                })

            if swatches_list:
                product.swatches = swatches_list

        product.save()
        return JsonResponse({"success": True, "message": "Product updated successfully"})

    elif request.method == "DELETE":
        title = product.title
        product.delete()
        return JsonResponse({"success": True, "message": f"Product '{title}' deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_add_category(request):
    """Endpoint to quickly add a new Category or SubCategory with sequence / display order."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    title = data.get("title", "").strip()
    handle = data.get("handle", "").strip() or title.lower().replace(" ", "-").replace("/", "-")
    parent_category_id = data.get("category_id") or data.get("parent_id")
    order_val = data.get("order")

    if not title:
        return JsonResponse({"error": "Title is required"}, status=400)

    if parent_category_id:
        if str(parent_category_id).isdigit():
            parent_cat = get_object_or_404(Category, id=int(parent_category_id))
        else:
            parent_cat = get_object_or_404(Category, handle=str(parent_category_id))
        if order_val is not None and str(order_val).strip() != "":
            try:
                order = int(order_val)
            except ValueError:
                order = 0
        else:
            max_order = SubCategory.objects.filter(category=parent_cat).aggregate(Max("order"))["order__max"] or 0
            order = max_order + 1

        subcat, created = SubCategory.objects.get_or_create(
            category=parent_cat,
            handle=handle,
            defaults={"title": title, "order": order}
        )
        if not created and order_val is not None:
            subcat.order = order
            subcat.title = title
            subcat.save()

        return JsonResponse({
            "success": True,
            "type": "subcategory",
            "id": subcat.id,
            "title": subcat.title,
            "handle": subcat.handle,
            "order": subcat.order,
            "category_id": parent_cat.id,
            "created": created
        })
    else:
        if order_val is not None and str(order_val).strip() != "":
            try:
                order = int(order_val)
            except ValueError:
                order = 0
        else:
            max_order = Category.objects.all().aggregate(Max("order"))["order__max"] or 0
            order = max_order + 1

        cat, created = Category.objects.get_or_create(
            handle=handle,
            defaults={"title": title, "order": order}
        )
        if not created and order_val is not None:
            cat.order = order
            cat.title = title
            cat.save()

        return JsonResponse({
            "success": True,
            "type": "category",
            "id": cat.id,
            "title": cat.title,
            "handle": cat.handle,
            "order": cat.order,
            "created": created
        })


@csrf_exempt
def api_update_category_order(request):
    """Endpoint to update sequence / order for Category or SubCategory."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body.decode("utf-8"))
    item_type = data.get("type", "category")
    item_id = data.get("id")
    order = int(data.get("order", 0))

    if item_type == "subcategory":
        sub = get_object_or_404(SubCategory, id=item_id)
        sub.order = order
        sub.save()
        return JsonResponse({"success": True, "message": f"Sequence updated for '{sub.title}' to {order}"})
    else:
        cat = get_object_or_404(Category, id=item_id)
        cat.order = order
        cat.save()
        return JsonResponse({"success": True, "message": f"Sequence updated for '{cat.title}' to {order}"})


@csrf_exempt
def api_delete_category(request, category_id):
    """Delete a Category by ID or handle."""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "DELETE or POST required"}, status=405)
    if str(category_id).isdigit():
        cat = Category.objects.filter(id=int(category_id)).first()
    else:
        cat = Category.objects.filter(handle=category_id).first()
    if not cat:
        return JsonResponse({"error": "Category not found"}, status=404)
    title = cat.title
    cat.delete()
    return JsonResponse({"success": True, "message": f"Category '{title}' deleted successfully."})


@csrf_exempt
def api_delete_subcategory(request, subcategory_id):
    """Delete a SubCategory by ID or handle."""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "DELETE or POST required"}, status=405)
    if str(subcategory_id).isdigit():
        sub = SubCategory.objects.filter(id=int(subcategory_id)).first()
    else:
        sub = SubCategory.objects.filter(handle=subcategory_id).first()
    if not sub:
        return JsonResponse({"error": "Subcategory not found"}, status=404)
    title = sub.title
    sub.delete()
    return JsonResponse({"success": True, "message": f"Subcategory '{title}' deleted successfully."})


@csrf_exempt
def api_order_detail(request, order_id):
    """Get or update full order details with itemized list for modal / tracking."""
    if str(order_id).isdigit():
        order = Order.objects.filter(id=int(order_id)).prefetch_related("items").first()
    else:
        order = Order.objects.filter(order_number__iexact=str(order_id)).prefetch_related("items").first()
        if not order and str(order_id).isalnum():
            order = Order.objects.filter(order_number__icontains=str(order_id)).prefetch_related("items").first()

    if not order:
        return JsonResponse({"error": "Order not found"}, status=404)

    # Handle update requests (PATCH / POST / PUT)
    if request.method in ["PATCH", "POST", "PUT"]:
        try:
            data = json.loads(request.body.decode("utf-8")) if request.body else {}
        except Exception:
            data = {}

        if "status" in data:
            order.status = str(data["status"]).strip().lower()
        if "payment_status" in data:
            order.payment_status = str(data["payment_status"]).strip().lower()
        if "paymentStatus" in data:
            order.payment_status = str(data["paymentStatus"]).strip().lower()
        if "carrier" in data:
            order.carrier = str(data["carrier"]).strip()
        if "tracking_number" in data:
            order.tracking_number = str(data["tracking_number"]).strip()
        if "estimated_delivery" in data:
            order.estimated_delivery = str(data["estimated_delivery"]).strip()
        order.save()

    items_data = []
    for item in order.items.all():
        items_data.append({
            "id": item.id,
            "product_name": item.product_name,
            "product_handle": item.product_handle,
            "color": item.color,
            "size": item.size,
            "price": str(item.price),
            "quantity": item.quantity,
            "image_url": item.image_url,
            "item_total": f"${float(item.price) * item.quantity:.2f}"
        })

    return JsonResponse({
        "id": order.id,
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "shipping_address": order.shipping_address,
        "subtotal": str(order.subtotal),
        "shipping_fee": str(order.shipping_fee),
        "discount": str(order.discount),
        "total_amount": str(order.total_amount),
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "estimated_delivery": order.estimated_delivery,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "created_at": order.created_at.strftime("%b %d, %Y %I:%M %p"),
        "items": items_data,
    })


@csrf_exempt
def api_order_update_tracking(request, order_id):
    """Update shipment tracking, carrier, and order status."""
    if request.method not in ["POST", "PATCH"]:
        return JsonResponse({"error": "POST required"}, status=405)

    order = get_object_or_404(Order, id=order_id)
    data = json.loads(request.body.decode("utf-8"))

    if "carrier" in data:
        order.carrier = data["carrier"].strip()
    if "tracking_number" in data:
        order.tracking_number = data["tracking_number"].strip()
    if "estimated_delivery" in data:
        order.estimated_delivery = data["estimated_delivery"].strip()
    if "status" in data:
        order.status = data["status"]
    if "payment_status" in data:
        order.payment_status = data["payment_status"]

    order.save()
    return JsonResponse({
        "success": True,
        "message": f"Tracking updated for {order.order_number}",
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
    })


@csrf_exempt
def api_cart_requests(request):
    """List or record customer cart requests."""
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            session_id = data.get("session_id", "guest_session")
            product_handle = data.get("product_handle", "")
            size = data.get("size", "Default")
            color = data.get("color", "")
            
            cart_item, created = CartRequest.objects.get_or_create(
                session_id=session_id,
                product_handle=product_handle,
                size=size,
                defaults={
                    "customer_name": data.get("customer_name", "Shopper"),
                    "customer_email": data.get("customer_email", ""),
                    "product_name": data.get("product_name", product_handle),
                    "color": color,
                    "price": Decimal(str(data.get("price", "0.00"))),
                    "quantity": int(data.get("quantity", 1)),
                    "image_url": data.get("image_url", ""),
                    "status": data.get("status", "active"),
                }
            )
            if not created:
                cart_item.quantity = int(data.get("quantity", cart_item.quantity + 1))
                if "customer_email" in data and data["customer_email"]:
                    cart_item.customer_email = data["customer_email"]
                if "status" in data:
                    cart_item.status = data["status"]
                cart_item.save()
            return JsonResponse({"success": True, "id": cart_item.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    carts = CartRequest.objects.all().order_by("-updated_at")
    data = []
    for c in carts:
        data.append({
            "id": c.id,
            "session_id": c.session_id,
            "customer_name": c.customer_name,
            "customer_email": c.customer_email,
            "product_name": c.product_name,
            "product_handle": c.product_handle,
            "color": c.color,
            "size": c.size,
            "price": str(c.price),
            "quantity": c.quantity,
            "total_value": f"${float(c.price) * c.quantity:.2f}",
            "image_url": c.image_url,
            "status": c.status,
            "updated_at": c.updated_at.strftime("%b %d, %I:%M %p"),
        })
    return JsonResponse({"success": True, "cart_requests": data})


@csrf_exempt
def api_cart_update_status(request, cart_id):
    """Update a cart request status (e.g. converted, abandoned)."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    cart_item = get_object_or_404(CartRequest, id=cart_id)
    data = json.loads(request.body.decode("utf-8"))
    cart_item.status = data.get("status", cart_item.status)
    cart_item.save()
    return JsonResponse({"success": True, "message": f"Cart item marked as {cart_item.status}"})


@csrf_exempt
def api_upload_file(request):
    """API endpoint to upload images or assets."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
    file_obj = request.FILES.get("file") or request.FILES.get("image")
    if not file_obj:
        return JsonResponse({"error": "No file uploaded"}, status=400)
    
    from django.conf import settings
    from django.core.files.storage import default_storage
    upload_subpath = request.POST.get("path", "products/uploads")
    # Clean file name and generate unique name if needed
    import time
    clean_name = file_obj.name.replace(" ", "_")
    filename = f"{upload_subpath}/{int(time.time())}_{clean_name}".replace("//", "/")
    saved_path = default_storage.save(filename, file_obj)
    file_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")
    return JsonResponse({"success": True, "url": file_url})


@csrf_exempt
def api_brands_list_create(request):
    """API endpoint to list and create store brands."""
    import os
    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "brands_data.json")
    
    default_brands = [
        {
            "id": 1,
            "name": "Luma Threads",
            "slug": "luma-threads",
            "description": "Premium sustainable essentials & utilitarian craftsmanship",
            "logo": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop",
            "categories": [{"slug": "tops", "name": "Tops"}, {"slug": "denim", "name": "Denim"}],
            "category_ids": ["tops", "denim"],
            "is_active": True,
        },
        {
            "id": 2,
            "name": "Pistola Denim",
            "slug": "pistola-denim",
            "description": "California-crafted premium denim and modern silhouettes",
            "logo": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop",
            "categories": [{"slug": "denim", "name": "Denim"}, {"slug": "bottoms", "name": "Bottoms"}],
            "category_ids": ["denim", "bottoms"],
            "is_active": True,
        },
        {
            "id": 3,
            "name": "Atelier Studio",
            "slug": "atelier-studio",
            "description": "Tailored outerwear, cashmere knitwear, and timeless classics",
            "logo": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&h=100&fit=crop",
            "categories": [{"slug": "outerwear", "name": "Outerwear"}, {"slug": "knitwear", "name": "Knitwear"}],
            "category_ids": ["outerwear", "knitwear"],
            "is_active": True,
        },
    ]

    brands = list(default_brands)
    if os.path.exists(data_file):
        try:
            with open(data_file, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                if isinstance(loaded, list) and len(loaded) > 0:
                    brands = loaded
        except Exception:
            pass

    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8")) if request.body else {}
        except Exception:
            body = request.POST.dict()

        name = body.get("name", "").strip()
        if not name:
            return JsonResponse({"error": "Brand name is required"}, status=400)

        import re, time
        slug = body.get("slug") or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        cat_ids = body.get("category_ids", [])
        cats = [{"slug": cid, "id": cid, "name": cid.capitalize()} for cid in cat_ids]

        new_brand = {
            "id": int(time.time() * 1000) % 10000000,
            "name": name,
            "slug": slug,
            "description": body.get("description", ""),
            "logo": body.get("logo", ""),
            "categories": cats,
            "category_ids": cat_ids,
            "is_active": body.get("is_active", True),
        }

        brands = [b for b in brands if b.get("slug") != slug]
        brands.insert(0, new_brand)
        try:
            with open(data_file, "w", encoding="utf-8") as f:
                json.dump(brands, f, indent=2)
        except Exception:
            pass

        return JsonResponse(new_brand, status=201)

    search = request.GET.get("search", "").strip().lower()
    if search:
        brands = [b for b in brands if search in b.get("name", "").lower() or search in b.get("description", "").lower()]

    return JsonResponse(brands, safe=False)


@csrf_exempt
def api_brand_detail(request, slug):
    """API endpoint to get, update, or delete a brand."""
    import os
    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "brands_data.json")
    brands = []
    if os.path.exists(data_file):
        try:
            with open(data_file, "r", encoding="utf-8") as f:
                brands = json.load(f)
        except Exception:
            pass

    brand = next((b for b in brands if b.get("slug") == slug or str(b.get("id")) == slug), None)

    if request.method == "DELETE":
        brands = [b for b in brands if b.get("slug") != slug and str(b.get("id")) != slug]
        try:
            with open(data_file, "w", encoding="utf-8") as f:
                json.dump(brands, f, indent=2)
        except Exception:
            pass
        return JsonResponse({"success": True})

    if request.method in ["PATCH", "PUT"]:
        try:
            body = json.loads(request.body.decode("utf-8")) if request.body else {}
        except Exception:
            body = request.POST.dict()

        if not brand:
            brand = {"id": slug, "slug": slug, "name": body.get("name", slug)}
            brands.append(brand)

        brand.update(body)
        if "category_ids" in body:
            brand["categories"] = [{"slug": cid, "id": cid, "name": cid.capitalize()} for cid in body["category_ids"]]

        try:
            with open(data_file, "w", encoding="utf-8") as f:
                json.dump(brands, f, indent=2)
        except Exception:
            pass
        return JsonResponse(brand)

    if not brand:
        return JsonResponse({"error": "Brand not found"}, status=404)
    return JsonResponse(brand)


@csrf_exempt
def api_category_features(request):
    """API endpoint to get or update category features."""
    if request.method == "POST":
        return JsonResponse({"success": True, "message": "Category features saved successfully"})
    return JsonResponse([], safe=False)


@csrf_exempt
def api_customers_list(request):
    """API endpoint to list registered customers and their stats."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.all().order_by("-date_joined")
    data = []
    for u in users:
        order_count = Order.objects.filter(customer_email__iexact=u.email).count()
        total_spent = Order.objects.filter(customer_email__iexact=u.email).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        data.append({
            "id": str(u.id),
            "uid": str(u.id),
            "email": u.email,
            "displayName": u.get_full_name() or u.username or u.email.split("@")[0],
            "name": u.get_full_name() or u.username or u.email.split("@")[0],
            "phone": getattr(u, "phone", "") or "",
            "address": getattr(u, "address", "") or "",
            "city": getattr(u, "city", "") or "",
            "lastVisit": u.last_login.isoformat() if u.last_login else u.date_joined.isoformat(),
            "visitCount": 1,
            "createdAt": u.date_joined.isoformat(),
            "order_count": order_count,
            "total_spent": float(total_spent),
            "is_staff": u.is_staff,
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
def api_user_create(request):
    """Create a new customer user from admin dashboard."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    email = data.get("email", "").strip()
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "User with this email already exists"}, status=400)

    name = data.get("name", "").strip()
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    if name and not first_name:
        parts = name.split(" ")
        first_name = parts[0]
        last_name = " ".join(parts[1:])
    username = email.split("@")[0] + "_" + str(User.objects.count() + 1)
    password = data.get("password") or "Welcome123!"

    user = User.objects.create(
        email=email,
        username=username,
        first_name=first_name,
        last_name=last_name,
        phone=data.get("phone", ""),
        address=data.get("address", ""),
        city=data.get("city", ""),
        country=data.get("country", "Nepal"),
    )
    user.set_password(password)
    user.save()
    return JsonResponse({
        "id": str(user.id),
        "uid": str(user.id),
        "email": user.email,
        "name": user.get_full_name() or user.username or user.email.split("@")[0],
        "displayName": user.get_full_name() or user.username or user.email.split("@")[0],
        "phone": getattr(user, "phone", "") or "",
        "address": getattr(user, "address", "") or "",
        "city": getattr(user, "city", "") or "",
        "order_count": 0,
        "total_spent": 0.0,
    }, status=201)


@csrf_exempt
def api_admin_reports(request):
    report_type = request.GET.get("type", "sales_by_city")
    country_filter = request.GET.get("country", "")

    orders = Order.objects.exclude(status="cancelled")

    if report_type == "sales_by_city":
        city_data = {}
        for order in orders:
            addr = order.shipping_address if isinstance(order.shipping_address, dict) else {}
            city = addr.get("city") or "Kathmandu"
            if city not in city_data:
                city_data[city] = {"total_orders": 0, "total_sales": 0.0}
            city_data[city]["total_orders"] += 1
            city_data[city]["total_sales"] += float(order.total_amount or 0)

        default_cities = ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur"]
        for c in default_cities:
            if c not in city_data:
                city_data[c] = {"total_orders": 0, "total_sales": 0.0}

        result = [
            {"city": city, "total_orders": data["total_orders"], "total_sales": round(data["total_sales"], 2)}
            for city, data in sorted(city_data.items(), key=lambda x: x[1]["total_sales"], reverse=True)
        ]
        return JsonResponse(result, safe=False)

    elif report_type == "sales_by_country":
        country_data = {}
        for order in orders:
            addr = order.shipping_address if isinstance(order.shipping_address, dict) else {}
            country = addr.get("country") or "Nepal"
            if country not in country_data:
                country_data[country] = {"total_orders": 0, "total_sales": 0.0}
            country_data[country]["total_orders"] += 1
            country_data[country]["total_sales"] += float(order.total_amount or 0)

        default_countries = ["Nepal", "United States", "India", "United Kingdom", "Australia"]
        for c in default_countries:
            if c not in country_data:
                country_data[c] = {"total_orders": 0, "total_sales": 0.0}

        result = [
            {"country": country, "total_orders": data["total_orders"], "total_sales": round(data["total_sales"], 2)}
            for country, data in sorted(country_data.items(), key=lambda x: x[1]["total_sales"], reverse=True)
        ]
        return JsonResponse(result, safe=False)

    return JsonResponse([], safe=False)


# ==========================================
# HERO SETTINGS, FOOTER SETTINGS & USER ACTIVITY
# ==========================================

DATA_DIR = os.path.join(settings.BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

HERO_FILE = os.path.join(DATA_DIR, "hero_settings.json")
FOOTER_FILE = os.path.join(DATA_DIR, "footer_settings.json")
ACTIVITY_FILE = os.path.join(DATA_DIR, "user_activity.json")

DEFAULT_HERO_SETTINGS = {
    "subtitle": "EVERYDAY UTILITY. ELEVATED EASE.",
    "title": "WINTER 2026",
    "desktop": "https://pistoladenim.com/cdn/shop/files/desktop_banner_winter24_2.jpg?v=1730999554&width=3840",
    "mobile": "https://pistoladenim.com/cdn/shop/files/mobile_banner_winter24_2.jpg?v=1730999554&width=1500",
    "cta": "EXPLORE THE CAMPAIGN",
    "ctaHref": "/collections/all-new",
    "secondaryCta": "SHOP BEST SELLERS",
    "secondaryCtaHref": "/collections/best-sellers",
    "badge": "NEW ARRIVAL • ARTISANAL DENIM",
    "overlayOpacity": 20,
    "alignment": "center",
    "bannerHoliday": {
        "enabled": True,
        "title": "HOLIDAY 2026",
        "subtitle": "CURATED CAPSULE COLLECTION",
        "image": "https://pistoladenim.com/cdn/shop/files/desktop_holiday_banner.jpg?v=1730999554&width=3840",
        "cta": "SHOP THE DROP",
        "ctaHref": "/collections/all-denim",
    }
}

DEFAULT_FOOTER_SETTINGS = {
    "newsletter": {
        "enabled": True,
        "title": "STAY IN THE KNOW",
        "placeholder": "Enter your email",
        "buttonText": "→",
        "successMessage": "Thank you for subscribing to Luma Threads!",
    },
    "customerSupport": {
        "enabled": True,
        "heading": "CUSTOMER SUPPORT",
        "email": "customerservice@lumathreads.com",
        "hours": "Monday – Friday 8AM – 5PM PST",
        "phone": "+1 (800) 586-2847",
        "address": "Atelier Studio, Los Angeles, CA",
    },
    "social": {
        "enabled": True,
        "facebook": "https://www.facebook.com/pistoladenimla/",
        "instagram": "https://www.instagram.com/pistoladenim/?hl=en",
        "twitter": "https://twitter.com/pistoladenim",
        "pinterest": "https://www.pinterest.com/pistoladenim/",
        "tiktok": "https://www.tiktok.com/@pistoladenim",
        "youtube": "",
    },
    "columns": [
        {
            "id": "col-shop",
            "title": "SHOP",
            "enabled": True,
            "links": [
                {"label": "All New", "url": "/collections/all-new"},
                {"label": "All Denim", "url": "/collections/all-denim"},
                {"label": "Best Sellers", "url": "/collections/best-sellers"},
                {"label": "Barrel Jeans", "url": "/collections/all-denim"},
                {"label": "Straight Leg", "url": "/collections/all-denim"},
            ],
        },
        {
            "id": "col-about",
            "title": "ABOUT",
            "enabled": True,
            "links": [
                {"label": "Our Story", "url": "/pages/about-us"},
                {"label": "Denim Fit Guide", "url": "/collections/all-denim"},
                {"label": "Sustainability", "url": "/pages/about-us"},
                {"label": "Stockists", "url": "/pages/about-us"},
            ],
        },
        {
            "id": "col-help",
            "title": "HELP",
            "enabled": True,
            "links": [
                {"label": "Shipping & Returns", "url": "/pages/about-us"},
                {"label": "FAQ", "url": "/pages/about-us"},
                {"label": "Size Guide", "url": "/pages/about-us"},
                {"label": "Contact Us", "url": "/pages/about-us"},
            ],
        },
    ],
    "bottomBar": {
        "copyright": "© 2026, Luma Threads. All rights reserved.",
        "showPaymentBadges": True,
        "paymentBadges": [
            "VISA", "MC", "AMEX", "DISC", "APPLE PAY", "PAYPAL", "KLARNA", "AFTERPAY"
        ],
    },
}


@csrf_exempt
def api_admin_hero_settings(request):
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            data = json.loads(request.body.decode("utf-8"))
            with open(HERO_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return JsonResponse({"status": "success", "data": data})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    # GET request
    if os.path.exists(HERO_FILE):
        try:
            with open(HERO_FILE, "r", encoding="utf-8") as f:
                settings_data = json.load(f)
            return JsonResponse(settings_data)
        except Exception:
            pass

    return JsonResponse(DEFAULT_HERO_SETTINGS)


@csrf_exempt
def api_admin_footer_settings(request):
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            data = json.loads(request.body.decode("utf-8"))
            with open(FOOTER_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return JsonResponse({"status": "success", "data": data})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    # GET request
    if os.path.exists(FOOTER_FILE):
        try:
            with open(FOOTER_FILE, "r", encoding="utf-8") as f:
                settings_data = json.load(f)
            return JsonResponse(settings_data)
        except Exception:
            pass

    return JsonResponse(DEFAULT_FOOTER_SETTINGS)


@csrf_exempt
def api_admin_activity(request):
    """Activity tracking API: records and queries user sessions, page durations, and card interactions."""
    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            activity = {
                "id": payload.get("id") or f"act_{uuid.uuid4().hex[:12]}",
                "uid": payload.get("uid") or "guest",
                "email": payload.get("email") or "guest@lumathreads.local",
                "displayName": payload.get("displayName") or "Guest Visitor",
                "pageType": payload.get("pageType") or "page",
                "path": payload.get("path") or "/",
                "action": payload.get("action") or "page_view",
                "duration": int(payload.get("duration") or 0),
                "metadata": payload.get("metadata") or {},
                "timestamp": payload.get("timestamp") or now_iso,
                "userAgent": payload.get("userAgent") or request.META.get("HTTP_USER_AGENT", ""),
                "screenResolution": payload.get("screenResolution") or "",
                "ipAddress": request.META.get("REMOTE_ADDR", ""),
            }

            activities = []
            if os.path.exists(ACTIVITY_FILE):
                try:
                    with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
                        activities = json.load(f)
                except Exception:
                    activities = []

            # If activity is a duration update for an existing session/card, update in place
            updated = False
            if activity.get("id"):
                for existing in activities:
                    if existing.get("id") == activity["id"]:
                        existing["duration"] = activity["duration"]
                        existing["metadata"] = activity["metadata"]
                        existing["timestamp"] = activity["timestamp"]
                        updated = True
                        break

            if not updated:
                activities.insert(0, activity)

            # Cap at 5000 records to prevent unbounded disk growth
            activities = activities[:5000]

            with open(ACTIVITY_FILE, "w", encoding="utf-8") as f:
                json.dump(activities, f, indent=2)

            return JsonResponse({"status": "success", "activity": activity})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    # GET request
    activities = []
    if os.path.exists(ACTIVITY_FILE):
        try:
            with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
                activities = json.load(f)
        except Exception:
            activities = []

    # Optional Filters
    uid_filter = request.GET.get("uid")
    path_filter = request.GET.get("path")
    action_filter = request.GET.get("action")
    card_filter = request.GET.get("card")

    filtered = activities
    if uid_filter:
        filtered = [a for a in filtered if a.get("uid") == uid_filter]
    if path_filter:
        filtered = [a for a in filtered if a.get("path") == path_filter]
    if action_filter:
        filtered = [a for a in filtered if a.get("action") == action_filter]
    if card_filter:
        filtered = [
            a for a in filtered
            if a.get("metadata", {}).get("productHandle") == card_filter or
               a.get("metadata", {}).get("productTitle") == card_filter
        ]

    limit = request.GET.get("limit")
    if limit and limit.isdigit():
        filtered = filtered[:int(limit)]

    return JsonResponse(filtered, safe=False)

