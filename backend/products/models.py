from django.db import models


class Category(models.Model):
    title = models.CharField(max_length=150)
    handle = models.SlugField(max_length=150, unique=True)
    image = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["order", "title"]

    def __str__(self):
        return self.title


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    title = models.CharField(max_length=150)
    handle = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Sub-Categories"
        ordering = ["order", "title"]

    def __str__(self):
        return f"{self.category.title} > {self.title}"


class Collection(models.Model):
    title = models.CharField(max_length=150)
    handle = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    image = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Product(models.Model):
    handle = models.SlugField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    colorway = models.CharField(max_length=100, blank=True, default="")
    color = models.CharField(max_length=100, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_formatted = models.CharField(max_length=50, blank=True, default="")
    image = models.TextField(blank=True, default="")
    hover_image = models.TextField(blank=True, default="")
    images = models.JSONField(default=list, blank=True)
    badge = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    size_and_fit = models.TextField(blank=True, default="")
    care = models.TextField(blank=True, default="")
    sizes = models.JSONField(default=list, blank=True)
    details = models.JSONField(default=list, blank=True)
    swatches = models.JSONField(default=list, blank=True)
    rise = models.CharField(max_length=50, blank=True, default="")
    fit = models.CharField(max_length=50, blank=True, default="")
    wash = models.CharField(max_length=50, blank=True, default="")
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    subcategory = models.ForeignKey(
        SubCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    collections = models.ManyToManyField(Collection, blank=True, related_name="products")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.price_formatted and self.price:
            self.price_formatted = f"${float(self.price):.2f}"
        super().save(*args, **kwargs)


class ProductColor(models.Model):
    """
    Color dimension: A dress/product can have multiple colors (e.g. Savvy Red, Noir, Winter White).
    Each color has:
    - Visual Color swatch (color_hex & color_name)
    - Main Image (shown on card when color is selected)
    - Hover Image
    - Multiple Gallery Images
    - Specific Price/Amount for this color
    - Specific Sizes for this color
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="color_variants")
    color_name = models.CharField(max_length=100)
    color_hex = models.CharField(max_length=20, default="#000000")
    color_handle = models.SlugField(max_length=150, blank=True, default="")
    primary_image = models.TextField(blank=True, default="", help_text="Main image shown on the card for this color")
    hover_image = models.TextField(blank=True, default="")
    images = models.JSONField(default=list, blank=True, help_text="Multiple gallery images for this color")
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Specific amount for this color")
    sizes = models.JSONField(default=list, blank=True, help_text="Specific sizes available for this color")

    def __str__(self):
        return f"{self.product.title} - {self.color_name}"


class ProductVariant(models.Model):
    """
    Specific SKU dimension: Combines Product + Color + Size with its own Price (amount) and Stock.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    color = models.ForeignKey(ProductColor, on_delete=models.CASCADE, null=True, blank=True, related_name="variants")
    color_name = models.CharField(max_length=100, blank=True, default="")
    size = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Specific amount for this size/color combination")
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, default="")
    stock_quantity = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.title} [{self.color_name or 'Default'} / {self.size}] - ${self.price}"
