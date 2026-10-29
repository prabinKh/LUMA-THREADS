from django.urls import re_path
from .views import OrderListCreateView, OrderDetailTrackView

urlpatterns = [
    re_path(r"^orders/?$", OrderListCreateView.as_view(), name="order-list-create"),
    re_path(r"^orders/(?P<identifier>[^/]+)/?$", OrderDetailTrackView.as_view(), name="order-detail-track"),
]
