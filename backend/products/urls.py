from django.urls import re_path
from .views import (
    ProductListView,
    ProductDetailView,
    CategoryListView,
    SubCategoryListView,
    CollectionListView,
    CollectionDetailView,
)

urlpatterns = [
    re_path(r"^products/?$", ProductListView.as_view(), name="product-list"),
    re_path(r"^products/(?P<slug_or_id>[^/]+)/?$", ProductDetailView.as_view(), name="product-detail"),
    re_path(r"^categories/?$", CategoryListView.as_view(), name="category-list"),
    re_path(r"^subcategories/?$", SubCategoryListView.as_view(), name="subcategory-list"),
    re_path(r"^collections/?$", CollectionListView.as_view(), name="collection-list"),
    re_path(r"^collections/(?P<handle>[^/]+)/?$", CollectionDetailView.as_view(), name="collection-detail"),
]
