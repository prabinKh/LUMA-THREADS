from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer


class OrderListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user)
        else:
            email = request.query_params.get("email")
            if email:
                orders = Order.objects.filter(customer_email__iexact=email)
            else:
                orders = Order.objects.all()[:20]

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
