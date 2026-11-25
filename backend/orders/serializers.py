
import uuid
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_handle",
            "color",
            "size",
            "price",
            "quantity",
            "image_url",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "customer_email",
            "customer_phone",
            "shipping_address",
            "subtotal",
            "shipping_fee",
            "discount",
            "total_amount",
            "status",
            "carrier",
            "tracking_number",
            "estimated_delivery",
            "payment_method",
            "payment_status",
            "items",
            "created_at",
            "updated_at",
        ]


class CreateOrderItemInputSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    product_name = serializers.CharField(required=False, allow_blank=True)
    productId = serializers.CharField(required=False, allow_blank=True)
    handle = serializers.CharField(required=False, allow_blank=True)
    color = serializers.CharField(required=False, allow_blank=True)
    size = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField(default=1)
    image = serializers.CharField(required=False, allow_blank=True)
    image_url = serializers.CharField(required=False, allow_blank=True)


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customerName = serializers.CharField(required=False, allow_blank=True)
    customer_email = serializers.CharField(required=False, allow_blank=True, default="")
    customerEmail = serializers.CharField(required=False, allow_blank=True, default="")
    customer_phone = serializers.CharField(required=False, allow_blank=True)
    customerPhone = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    apartment = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    zip = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True, default="US")
    payment_method = serializers.CharField(required=False, default="Credit Card")
    paymentMethod = serializers.CharField(required=False, default="")
    payment_status = serializers.CharField(required=False, default="paid")
    paymentStatus = serializers.CharField(required=False, default="")
    status = serializers.CharField(required=False, default="processing")
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    shipping_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    totalAmount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    orderId = serializers.CharField(required=False, allow_blank=True)
    order_number = serializers.CharField(required=False, allow_blank=True)
    source = serializers.CharField(required=False, allow_blank=True, default="storefront")
    shippingAddress = serializers.DictField(required=False)
    shipping_address = serializers.DictField(required=False)
    items = CreateOrderItemInputSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        # Normalize customer name
        customer_name = (
            validated_data.get("customer_name")
            or validated_data.get("customerName")
            or f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()
            or "Walk-in Customer"
        )

        customer_email = (
            validated_data.get("customer_email")
            or validated_data.get("customerEmail")
            or "pos-customer@lumathreads.com"
        )

        customer_phone = (
            validated_data.get("customer_phone")
            or validated_data.get("customerPhone")
            or ""
        )

        # Shipping Address dictionary
        address_dict = (
            validated_data.get("shippingAddress")
            or validated_data.get("shipping_address")
            or {
                "address": validated_data.get("address", "POS In-Store"),
                "apartment": validated_data.get("apartment", ""),
                "city": validated_data.get("city", "Store"),
                "state": validated_data.get("state", ""),
                "postal_code": validated_data.get("postal_code") or validated_data.get("zip", ""),
                "country": validated_data.get("country", "US"),
                "phone": customer_phone,
            }
        )

        # Totals
        total_amount = (
            validated_data.get("total_amount")
            or validated_data.get("totalAmount")
            or 0.00
        )
        subtotal = validated_data.get("subtotal", total_amount)
        shipping_fee = validated_data.get("shipping_fee", 0.00)
        discount = validated_data.get("discount", 0.00)

        # Status & Payment
        order_status = (
            validated_data.get("status")
            or "processing"
        ).lower()

        payment_status = (
            validated_data.get("paymentStatus")
            or validated_data.get("payment_status")
            or "paid"
        ).lower()

        payment_method = (
            validated_data.get("paymentMethod")
            or validated_data.get("payment_method")
            or "Cash"
        )

        order_number = (
            validated_data.get("orderId")
            or validated_data.get("order_number")
            or ""
        )

        user = None
        if customer_email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.filter(email__iexact=customer_email).first()
        if not user and self.context.get("request") and self.context["request"].user.is_authenticated:
            req_u = self.context["request"].user
            if not getattr(req_u, "is_staff", False):
                user = req_u

        order = Order(
            user=user,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            shipping_address=address_dict,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            discount=discount,
            total_amount=total_amount,
            payment_method=payment_method,
            payment_status=payment_status,
            status=order_status,
        )
        if order_number:
            order.order_number = order_number
        order.save()
        if order_number:
            if Order.objects.filter(order_number=order_number).exists():
                order_number = f"{order_number}-{uuid.uuid4().hex[:4].upper()}"
            order.order_number = order_number
        order.save()

        for item in items_data:
            p_name = item.get("product_name") or item.get("name") or "Product"
            img = item.get("image_url") or item.get("image") or ""
            handle = item.get("handle") or item.get("productId") or ""
            OrderItem.objects.create(
                order=order,
                product_name=p_name,
                product_handle=handle,
                color=item.get("color", ""),
                size=item.get("size", ""),
                price=item.get("price", 0.00),
                quantity=item.get("quantity", 1),
                image_url=img,
            )

        return order

