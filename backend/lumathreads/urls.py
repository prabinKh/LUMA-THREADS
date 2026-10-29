from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from products.dashboard_views import (
    dashboard_view,
    api_product_create,
    api_product_detail,
    api_add_category,
    api_delete_category,
    api_delete_subcategory,
    api_order_detail,
    api_order_update_tracking,
    api_cart_requests,
    api_cart_update_status,
    api_user_create,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "name": "Luma Threads API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "products": "/api/store/products/",
            "categories": "/api/store/categories/",
            "collections": "/api/store/collections/",
            "orders": "/api/orders/",
            "register": "/api/account/register/",
            "login": "/api/account/login/",
            "profile": "/api/account/profile/",
            "dashboard": "/dashboard/",
            "admin": "/admin/",
        }
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    # Industry-level Store Admin Dashboard Views & APIs
    path("dashboard/", dashboard_view, name="dashboard"),
    path("dashboard/api/products/create/", api_product_create, name="dashboard-product-create"),
    path("dashboard/api/products/<str:handle_or_id>/", api_product_detail, name="dashboard-product-detail"),
    path("dashboard/api/categories/add/", api_add_category, name="dashboard-add-category"),
    path("dashboard/api/categories/<int:category_id>/delete/", api_delete_category, name="dashboard-delete-category"),
    path("dashboard/api/subcategories/<int:subcategory_id>/delete/", api_delete_subcategory, name="dashboard-delete-subcategory"),
    path("dashboard/api/orders/<int:order_id>/", api_order_detail, name="dashboard-order-detail"),
    path("dashboard/api/orders/<int:order_id>/tracking/", api_order_update_tracking, name="dashboard-order-tracking"),
    path("dashboard/api/cart-requests/", api_cart_requests, name="dashboard-cart-requests"),
    path("api/cart-requests/", api_cart_requests, name="api-cart-requests"),
    path("dashboard/api/cart-requests/<int:cart_id>/status/", api_cart_update_status, name="dashboard-cart-status"),
    path("dashboard/api/users/add/", api_user_create, name="dashboard-user-create"),
    # General API
    path("api/", api_root, name="api-root"),
    # Accounts
    path("api/account/", include("accounts.urls")),
    # Products / Catalog
    path("api/store/", include("products.urls")),
    path("api/", include("products.urls")),
    # Orders / Checkout / Tracking
    path("api/", include("orders.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
