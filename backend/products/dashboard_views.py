import json
from decimal import Decimal
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count, Q
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
    context = {
        "categories": categories,
        "subcategories": subcategories,
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
    """Create a brand new product with category, subcategory and color swatches."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        data = request.POST.dict()

    title = data.get("title", "").strip()
    if not title:
        return JsonResponse({"error": "Product title is required"}, status=400)

    handle = data.get("handle", "").strip() or title.lower().replace(" ", "-").replace("/", "-")
    price = Decimal(str(data.get("price") or "168.00"))
    
    category_id = data.get("category_id") or None
    subcategory_id = data.get("subcategory_id") or None
    
    # Validation: if subcategory is selected, ensure it belongs to category
    if subcategory_id and not category_id:
        sub = SubCategory.objects.filter(id=subcategory_id).first()
        if sub:
            category_id = sub.category_id

    sizes = data.get("sizes", ["XS", "S", "M", "L"])
    if isinstance(sizes, str):
        sizes = [s.strip() for s in sizes.split(",") if s.strip()]

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
        image=data.get("image", "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80"),
        hover_image=data.get("hover_image", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"),
        is_active=True,
    )

    # Attach colors if provided
    color_variants_data = data.get("color_variants")
    swatches_list = []
    if isinstance(color_variants_data, list) and len(color_variants_data) > 0:
        for cv in color_variants_data:
            c_name = cv.get("color_name") or "Default"
            c_hex = cv.get("color_hex") or "#000000"
            p_img = cv.get("primary_image") or prod.image
            h_img = cv.get("hover_image") or prod.hover_image
            c_price = Decimal(str(cv.get("price") or prod.price))
            c_sizes = cv.get("sizes") or prod.sizes
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
            swatches_list.append({
                "name": c_name,
                "color": c_hex,
                "handle": prod.handle,
                "image": p_img,
                "hoverImage": h_img,
                "price": float(c_price),
                "priceFormatted": f"${float(c_price):.2f}",
                "sizes": c_sizes
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
        "handle": prod.handle
    })


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
    """Endpoint to quickly add a new Category or SubCategory."""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    title = data.get("title", "").strip()
    handle = data.get("handle", "").strip() or title.lower().replace(" ", "-")
    parent_category_id = data.get("category_id")

    if not title:
        return JsonResponse({"error": "Title is required"}, status=400)

    if parent_category_id:
        parent_cat = get_object_or_404(Category, id=parent_category_id)
        subcat, created = SubCategory.objects.get_or_create(
            category=parent_cat,
            handle=handle,
            defaults={"title": title}
        )
        return JsonResponse({
            "success": True,
            "type": "subcategory",
            "id": subcat.id,
            "title": subcat.title,
            "handle": subcat.handle,
            "category_id": parent_cat.id,
            "created": created
        })
    else:
        cat, created = Category.objects.get_or_create(
            handle=handle,
            defaults={"title": title}
        )
        return JsonResponse({
            "success": True,
            "type": "category",
            "id": cat.id,
            "title": cat.title,
            "handle": cat.handle,
            "created": created
        })


@csrf_exempt
def api_delete_category(request, category_id):
    """Delete a Category."""
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)
    cat = get_object_or_404(Category, id=category_id)
    title = cat.title
    cat.delete()
    return JsonResponse({"success": True, "message": f"Category '{title}' deleted successfully."})


@csrf_exempt
def api_delete_subcategory(request, subcategory_id):
    """Delete a SubCategory."""
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)
    sub = get_object_or_404(SubCategory, id=subcategory_id)
    title = sub.title
    sub.delete()
    return JsonResponse({"success": True, "message": f"Subcategory '{title}' deleted successfully."})


@csrf_exempt
def api_order_detail(request, order_id):
    """Get full order details with itemized list for modal / tracking."""
    order = get_object_or_404(Order.objects.prefetch_related("items"), id=order_id)
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

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
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
        "success": True,
        "message": f"Customer '{user.get_full_name() or user.email}' created successfully!",
        "user_id": user.id,
        "email": user.email
    })
