from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product_name", "product_handle", "color", "size", "price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "customer_name",
        "customer_email",
        "total_amount",
        "status",
        "carrier",
        "tracking_number",
        "created_at",
    )
    list_filter = ("status", "carrier", "payment_status", "created_at")
    search_fields = ("order_number", "tracking_number", "customer_name", "customer_email")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at", "updated_at")
