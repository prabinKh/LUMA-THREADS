from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer


class OrderListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        orders = Order.objects.all().order_by("-created_at")

        # Allow non-admin customer filtering
        is_admin_req = (
            "/admin/" in request.path
            or (request.user and (request.user.is_staff or getattr(request.user, "is_admin", False)))
        )

        email = request.query_params.get("email")
        if email and not is_admin_req:
            orders = orders.filter(customer_email__iexact=email)
        elif request.user and request.user.is_authenticated and not is_admin_req:
            orders = orders.filter(user=request.user)

        # Status filter
        status_param = request.query_params.get("status")
        if status_param and status_param.lower() not in ["all", ""]:
            orders = orders.filter(status__iexact=status_param)

        # Exclude status filter
        exclude_status = request.query_params.get("exclude_status")
        if exclude_status:
            exclude_list = [s.strip().lower() for s in exclude_status.split(",") if s.strip()]
            for exc in exclude_list:
                orders = orders.exclude(status__iexact=exc)

        # Payment status filter
        payment_status = request.query_params.get("payment_status")
        if payment_status:
            orders = orders.filter(payment_status__iexact=payment_status)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailTrackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, identifier):
        order = Order.objects.filter(
            Q(order_number__iexact=identifier)
            | Q(tracking_number__iexact=identifier)
            | (Q(id=identifier) if identifier.isdigit() else Q(pk__isnull=True))
        ).first()

        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)
        return Response(serializer.data)
