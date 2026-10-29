import uuid
from django.conf import settings
from django.db import models


class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", "Order Placed"),
        ("processing", "Processing"),
        ("shipped", "In Transit / Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50, blank=True, default="")
    shipping_address = models.JSONField(default=dict)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="processing")
    carrier = models.CharField(max_length=100, default="FedEx Ground")
    tracking_number = models.CharField(max_length=100, blank=True, default="")
    estimated_delivery = models.CharField(max_length=100, blank=True, default="3-5 Business Days")
    payment_method = models.CharField(max_length=100, default="Credit Card")
    payment_status = models.CharField(max_length=50, default="paid")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} ({self.customer_name})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"LT-{uuid.uuid4().hex[:8].upper()}"
        if not self.tracking_number:
            self.tracking_number = f"TRK-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=255)
    product_handle = models.CharField(max_length=255, blank=True, default="")
    color = models.CharField(max_length=100, blank=True, default="")
    size = models.CharField(max_length=50, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class CartRequest(models.Model):
    STATUS_CHOICES = (
        ("active", "In Bag / Active"),
        ("checkout", "Checkout Initiated"),
        ("converted", "Converted to Order"),
        ("abandoned", "Abandoned"),
    )

    session_id = models.CharField(max_length=100, db_index=True)
    customer_email = models.EmailField(blank=True, default="")
    customer_name = models.CharField(max_length=255, blank=True, default="Guest Shopper")
    product_name = models.CharField(max_length=255)
    product_handle = models.CharField(max_length=255, blank=True, default="")
    color = models.CharField(max_length=100, blank=True, default="")
    size = models.CharField(max_length=50, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.TextField(blank=True, default="")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.customer_name} - {self.product_name} ({self.status})"
