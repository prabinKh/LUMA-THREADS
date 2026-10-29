from rest_framework import serializers
from .models import Category, SubCategory, Collection, Product, ProductColor, ProductVariant


class SubCategorySerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source="category.title", read_only=True)

    class Meta:
        model = SubCategory
        fields = ["id", "category", "category_title", "title", "handle", "description", "order"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "title", "handle", "image", "description", "order", "subcategories"]


class CollectionSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ["id", "title", "handle", "description", "image", "products"]

    def get_products(self, obj):
        return list(obj.products.values_list("handle", flat=True))


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = [
            "id",
            "color_name",
            "color_hex",
            "color_handle",
            "primary_image",
            "hover_image",
            "images",
            "price",
            "sizes",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "color",
            "color_name",
            "size",
            "price",
            "compare_at_price",
            "sku",
            "stock_quantity",
            "is_available",
        ]


class ProductSerializer(serializers.ModelSerializer):
    priceFormatted = serializers.CharField(source="price_formatted", read_only=True)
    hoverImage = serializers.CharField(source="hover_image", required=False, allow_blank=True)
    sizeAndFit = serializers.CharField(source="size_and_fit", required=False, allow_blank=True)
    category_title = serializers.CharField(source="category.title", read_only=True)
    category_handle = serializers.CharField(source="category.handle", read_only=True)
    subcategory_title = serializers.CharField(source="subcategory.title", read_only=True)
    subcategory_handle = serializers.CharField(source="subcategory.handle", read_only=True)
    color_variants = ProductColorSerializer(many=True, required=False, read_only=True)
    variants = ProductVariantSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "handle",
            "title",
            "colorway",
            "color",
            "price",
            "priceFormatted",
            "image",
            "hoverImage",
            "images",
            "badge",
            "description",
            "sizeAndFit",
            "care",
            "sizes",
            "details",
            "swatches",
            "rise",
            "fit",
            "wash",
            "category",
            "category_title",
            "category_handle",
            "subcategory",
            "subcategory_title",
            "subcategory_handle",
            "collections",
            "color_variants",
            "variants",
            "is_featured",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
