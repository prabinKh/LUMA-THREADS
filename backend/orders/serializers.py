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
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(required=False, allow_blank=True)
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
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    shipping_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    items = CreateOrderItemInputSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        customer_name = validated_data.get("customer_name")
        if not customer_name:
            fn = validated_data.get("first_name", "")
            ln = validated_data.get("last_name", "")
            customer_name = f"{fn} {ln}".strip() or "Customer"

        address_dict = {
            "address": validated_data.get("address", ""),
            "apartment": validated_data.get("apartment", ""),
            "city": validated_data.get("city", ""),
            "state": validated_data.get("state", ""),
            "postal_code": validated_data.get("postal_code") or validated_data.get("zip", ""),
            "country": validated_data.get("country", "US"),
        }

        user = self.context.get("request").user if self.context.get("request") and self.context["request"].user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            customer_name=customer_name,
            customer_email=validated_data.get("customer_email"),
            customer_phone=validated_data.get("customer_phone", ""),
            shipping_address=address_dict,
            subtotal=validated_data.get("subtotal", 0.00),
            shipping_fee=validated_data.get("shipping_fee", 0.00),
            total_amount=validated_data.get("total_amount"),
            payment_method=validated_data.get("payment_method", "Credit Card"),
            status="processing",
        )

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
                price=item.get("price"),
                quantity=item.get("quantity", 1),
                image_url=img,
            )

        return order

