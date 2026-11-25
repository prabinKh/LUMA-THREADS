from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from products.dashboard_views import (
    dashboard_view,
    dashboard_overview_view,
    dashboard_products_view,
    dashboard_product_add_view,
    dashboard_product_edit_view,
    dashboard_categories_view,
    dashboard_orders_view,
    dashboard_order_detail_view,
    dashboard_cart_requests_view,
    dashboard_customers_view,
    api_product_create,
    api_product_detail,
    api_add_category,
    api_update_category_order,
    api_delete_category,
    api_delete_subcategory,
    api_order_detail,
    api_order_update_tracking,
    api_cart_requests,
    api_cart_update_status,
    api_user_create,
    api_customers_list,
    api_category_features,
    api_upload_file,
    api_brands_list_create,
    api_brand_detail,
    api_admin_reports,
    api_admin_hero_settings,
    api_admin_footer_settings,
    api_admin_activity,
)
from orders.views import OrderListCreateView
from products.views import CategoryListView, SubCategoryListView, CollectionListView, CollectionDetailView


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
    # Industry-level Store Admin Individual Pages
    path("dashboard/", dashboard_overview_view, name="dashboard-overview"),
    path("dashboard/overview/", dashboard_overview_view, name="dashboard-overview-alias"),
    path("dashboard/products/", dashboard_products_view, name="dashboard-products"),
    path("dashboard/products/add/", dashboard_product_add_view, name="dashboard-product-add"),
    path("dashboard/products/<str:handle_or_id>/edit/", dashboard_product_edit_view, name="dashboard-product-edit"),
    path("dashboard/categories/", dashboard_categories_view, name="dashboard-categories"),
    path("dashboard/orders/", dashboard_orders_view, name="dashboard-orders"),
    path("dashboard/orders/<int:order_id>/", dashboard_order_detail_view, name="dashboard-order-detail-page"),
    path("dashboard/cart-requests/", dashboard_cart_requests_view, name="dashboard-cart-requests-page"),
    path("dashboard/customers/", dashboard_customers_view, name="dashboard-customers"),
    # Dashboard AJAX / REST APIs
    path("dashboard/api/products/create/", api_product_create, name="dashboard-product-create"),
    path("dashboard/api/products/<str:handle_or_id>/", api_product_detail, name="dashboard-product-detail"),
    path("dashboard/api/categories/add/", api_add_category, name="dashboard-add-category"),
    path("dashboard/api/categories/reorder/", api_update_category_order, name="dashboard-reorder-category"),
    path("dashboard/api/categories/<int:category_id>/delete/", api_delete_category, name="dashboard-delete-category"),
    path("dashboard/api/subcategories/<int:subcategory_id>/delete/", api_delete_subcategory, name="dashboard-delete-subcategory"),
    path("dashboard/api/orders/<int:order_id>/", api_order_detail, name="dashboard-order-detail"),
    path("dashboard/api/orders/<int:order_id>/tracking/", api_order_update_tracking, name="dashboard-order-tracking"),
    path("dashboard/api/cart-requests/", api_cart_requests, name="dashboard-cart-requests"),
    path("api/cart-requests/", api_cart_requests, name="api-cart-requests"),
    path("dashboard/api/cart-requests/<int:cart_id>/status/", api_cart_update_status, name="dashboard-cart-status"),
    path("dashboard/api/users/add/", api_user_create, name="dashboard-user-create"),
    # Admin REST APIs for frontend admin (supports with and without trailing slash)
    re_path(r"^api/admin/products/?$", api_product_create, name="api-admin-product-create"),
    re_path(r"^api/admin/products/(?P<handle_or_id>[^/]+)/?$", api_product_detail, name="api-admin-product-detail"),
    re_path(r"^api/admin/orders/?$", OrderListCreateView.as_view(), name="api-admin-orders-list"),
    re_path(r"^api/admin/orders/create/?$", OrderListCreateView.as_view(), name="api-admin-orders-create"),
    re_path(r"^api/store/orders/create/?$", OrderListCreateView.as_view(), name="api-store-orders-create"),
    re_path(r"^store/orders/create/?$", OrderListCreateView.as_view(), name="store-orders-create"),
    re_path(r"^api/orders/create/?$", OrderListCreateView.as_view(), name="api-orders-create"),
    re_path(r"^api/admin/orders/(?P<order_id>[^/]+)/?$", api_order_detail, name="api-admin-order-detail"),
    re_path(r"^api/admin/categories/?$", CategoryListView.as_view(), name="api-admin-categories-list"),
    re_path(r"^api/admin/categories/add/?$", api_add_category, name="api-admin-add-category"),
    re_path(r"^api/admin/categories/(?P<category_id>[^/]+)/delete/?$", api_delete_category, name="api-admin-delete-category"),
    re_path(r"^api/admin/subcategories/?$", SubCategoryListView.as_view(), name="api-admin-subcategories-list"),
    re_path(r"^api/admin/subcategories/add/?$", api_add_category, name="api-admin-add-subcategory"),
    re_path(r"^api/admin/subcategories/(?P<subcategory_id>[^/]+)/delete/?$", api_delete_subcategory, name="api-admin-delete-subcategory"),
    re_path(r"^api/admin/subcategories/(?P<subcategory_id>[^/]+)/?$", api_delete_subcategory, name="api-admin-subcategory-detail-delete"),
    re_path(r"^api/admin/category-features/?$", api_category_features, name="api-admin-category-features"),
    re_path(r"^api/admin/brands/?$", api_brands_list_create, name="api-admin-brands-list"),
    re_path(r"^api/admin/brands/(?P<slug>[^/]+)/?$", api_brand_detail, name="api-admin-brand-detail"),
    re_path(r"^api/store/brands/?$", api_brands_list_create, name="api-store-brands-list"),
    re_path(r"^api/store/brands/(?P<slug>[^/]+)/?$", api_brand_detail, name="api-store-brand-detail"),
    re_path(r"^api/admin/collections/?$", CollectionListView.as_view(), name="api-admin-collections-list"),
    re_path(r"^api/admin/collections/(?P<handle>[^/]+)/?$", CollectionDetailView.as_view(), name="api-admin-collection-detail"),
    re_path(r"^api/store/collections/?$", CollectionListView.as_view(), name="api-store-collections-list"),
    re_path(r"^api/store/collections/(?P<handle>[^/]+)/?$", CollectionDetailView.as_view(), name="api-store-collection-detail"),
    re_path(r"^api/admin/customers/?$", api_customers_list, name="api-admin-customers"),
    re_path(r"^api/admin/customers/add/?$", api_user_create, name="api-admin-customer-add"),
    re_path(r"^api/admin/users/add/?$", api_user_create, name="api-admin-user-add"),
    re_path(r"^api/admin/reports/?$", api_admin_reports, name="api-admin-reports"),
    re_path(r"^dashboard/api/reports/?$", api_admin_reports, name="dashboard-api-reports"),
    # Hero Settings APIs
    re_path(r"^api/admin/hero-settings/?$", api_admin_hero_settings, name="api-admin-hero-settings"),
    re_path(r"^api/store/hero-settings/?$", api_admin_hero_settings, name="api-store-hero-settings"),
    re_path(r"^store/hero-settings/?$", api_admin_hero_settings, name="store-hero-settings"),
    # Footer Settings APIs
    re_path(r"^api/admin/footer-settings/?$", api_admin_footer_settings, name="api-admin-footer-settings"),
    re_path(r"^api/store/footer-settings/?$", api_admin_footer_settings, name="api-store-footer-settings"),
    re_path(r"^api/companies/footer/current/?$", api_admin_footer_settings, name="api-companies-footer-current"),
    re_path(r"^companies/footer/current/?$", api_admin_footer_settings, name="companies-footer-current"),
    re_path(r"^api/companies/locations/?$", lambda req: JsonResponse([], safe=False), name="api-companies-locations"),
    re_path(r"^companies/locations/?$", lambda req: JsonResponse([], safe=False), name="companies-locations"),
    # User Activity APIs
    re_path(r"^api/admin/activity/?$", api_admin_activity, name="api-admin-activity"),
    re_path(r"^dashboard/api/activity/?$", api_admin_activity, name="dashboard-api-activity"),
    re_path(r"^api/activity/?$", api_admin_activity, name="api-activity"),
    re_path(r"^api/admin/service-tickets/?$", lambda req: JsonResponse([], safe=False), name="api-admin-service-tickets"),
    re_path(r"^api/chat/chat-sessions/?$", lambda req: JsonResponse([], safe=False), name="api-chat-sessions"),
    re_path(r"^api/chat/chat-messages/?$", lambda req: JsonResponse([], safe=False), name="api-chat-messages"),
    re_path(r"^api/admin/upload/?$", api_upload_file, name="api-admin-upload"),
    re_path(r"^api/admin/upload-model/?$", api_upload_file, name="api-admin-upload-model"),
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
