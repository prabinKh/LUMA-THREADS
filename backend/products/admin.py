from django.contrib import admin
from .models import Category, SubCategory, Collection, Product, ProductColor, ProductVariant


class ProductColorInline(admin.StackedInline):
    model = ProductColor
    extra = 1
    fields = ("color_name", "color_hex", "color_handle", "primary_image", "hover_image", "images", "price", "sizes")


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("color_name", "size", "price", "compare_at_price", "sku", "stock_quantity", "is_available")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "handle", "order")
    prepopulated_fields = {"handle": ("title",)}
    search_fields = ("title", "handle")


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "handle", "order")
    list_filter = ("category",)
    prepopulated_fields = {"handle": ("title",)}
    search_fields = ("title", "handle", "category__title")


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("title", "handle")
    prepopulated_fields = {"handle": ("title",)}
    search_fields = ("title", "handle")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "handle",
        "price",
        "category",
        "subcategory",
        "colorway",
        "fit",
        "rise",
        "wash",
        "is_featured",
        "is_active",
    )
    list_filter = ("category", "subcategory", "fit", "rise", "wash", "is_featured", "is_active")
    search_fields = ("title", "handle", "color", "colorway", "description")
    prepopulated_fields = {"handle": ("title",)}
    filter_horizontal = ("collections",)
    inlines = [ProductColorInline, ProductVariantInline]
    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "handle", "category", "subcategory", "collections", "price", "price_formatted", "badge")
        }),
        ("Denim & Fit Specs", {
            "fields": ("color", "colorway", "rise", "fit", "wash")
        }),
        ("Images & Visuals", {
            "fields": ("image", "hover_image", "images", "swatches")
        }),
        ("Details & Sizing", {
            "fields": ("sizes", "details", "description", "size_and_fit", "care")
        }),
        ("Status & Visibility", {
            "fields": ("is_featured", "is_active")
        }),
    )


@admin.register(ProductColor)
class ProductColorAdmin(admin.ModelAdmin):
    list_display = ("product", "color_name", "color_hex", "price", "primary_image")
    search_fields = ("product__title", "color_name")


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "color_name", "size", "price", "sku", "stock_quantity", "is_available")
    list_filter = ("size", "is_available")
    search_fields = ("product__title", "color_name", "size", "sku")
