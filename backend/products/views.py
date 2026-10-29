from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, SubCategory, Collection, Product, ProductColor, ProductVariant
from .serializers import (
    CategorySerializer,
    SubCategorySerializer,
    CollectionSerializer,
    ProductSerializer,
)


class ProductListView(generics.ListCreateAPIView):
    """
    List all active products with rich filtering and sorting,
    or POST to create a brand new product.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        params = self.request.query_params

        # Filter by category
        category = params.get("category")
        if category:
            queryset = queryset.filter(
                Q(category__handle__iexact=category) | Q(category__title__iexact=category)
            )

        # Filter by subcategory
        subcategory = params.get("subcategory")
        if subcategory:
            queryset = queryset.filter(
                Q(subcategory__handle__iexact=subcategory) | Q(subcategory__title__iexact=subcategory)
            )

        # Filter by collection
        collection = params.get("collection")
        if collection:
            queryset = queryset.filter(
                Q(collections__handle__iexact=collection) | Q(collections__title__iexact=collection)
            )

        # Denim attributes
        fit = params.get("fit")
        if fit:
            queryset = queryset.filter(fit__iexact=fit)

        rise = params.get("rise")
        if rise:
            queryset = queryset.filter(rise__iexact=rise)

        wash = params.get("wash")
        if wash:
            queryset = queryset.filter(wash__iexact=wash)

        # Size filter
        size = params.get("size")
        if size:
            queryset = queryset.filter(sizes__icontains=size)

        # Featured
        if params.get("featured") == "true":
            queryset = queryset.filter(is_featured=True)

        # Search query
        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(colorway__icontains=search)
                | Q(color__icontains=search)
                | Q(handle__icontains=search)
            )

        # Sorting
        sort_by = params.get("sort_by") or params.get("sort")
        if sort_by in ["price-ascending", "price_asc"]:
            queryset = queryset.order_by("price")
        elif sort_by in ["price-descending", "price_desc"]:
            queryset = queryset.order_by("-price")
        elif sort_by in ["title-ascending", "title_asc"]:
            queryset = queryset.order_by("title")
        elif sort_by in ["title-descending", "title_desc"]:
            queryset = queryset.order_by("-title")
        elif sort_by in ["created-ascending", "oldest"]:
            queryset = queryset.order_by("created_at")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset.distinct()


class ProductDetailView(APIView):
    """
    CRUD:
    - GET: Retrieve product by handle or id
    - PUT / PATCH: Update product attributes
    - DELETE: Delete product
    """
    permission_classes = [permissions.AllowAny]

    def get_object(self, slug_or_id):
        product = None
        if str(slug_or_id).isdigit():
            product = Product.objects.filter(id=slug_or_id).first()
        if not product:
            product = Product.objects.filter(handle=slug_or_id).first()
        if not product:
            # Check by color variant handle or color name
            product = Product.objects.filter(
                Q(color_variants__color_handle__iexact=slug_or_id) |
                Q(color_variants__color_name__iexact=slug_or_id)
            ).first()
        return product

    def get(self, request, slug_or_id):
        product = self.get_object(slug_or_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    def put(self, request, slug_or_id):
        product = self.get_object(slug_or_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, slug_or_id):
        product = self.get_object(slug_or_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug_or_id):
        product = self.get_object(slug_or_id)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        product_title = product.title
        product.delete()
        return Response({"message": f"Product '{product_title}' deleted successfully."}, status=status.HTTP_200_OK)


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class SubCategoryListView(generics.ListCreateAPIView):
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = SubCategory.objects.all()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(
                Q(category__id=category if category.isdigit() else None)
                | Q(category__handle__iexact=category)
            )
        return queryset


class CollectionListView(generics.ListCreateAPIView):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]


class CollectionDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, handle):
        collection = Collection.objects.filter(handle=handle).first()
        if not collection:
            return Response({"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CollectionSerializer(collection)
        products = ProductSerializer(collection.products.filter(is_active=True), many=True).data
        data = serializer.data
        data["product_items"] = products
        return Response(data)
