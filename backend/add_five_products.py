import os
import sys
import django
import json

# Setup Django environment
sys.path.append(r"C:\Users\Del\Documents\DSA\pattern\pistoladenim_site\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lumathreads.settings")
django.setup()

from products.models import Product, ProductColor, ProductVariant, Category, SubCategory, Collection

NEW_PRODUCTS = [
    {
        "title": "Sloane Slouchy Denim Trench - Vintage Indigo",
        "handle": "sloane-slouchy-denim-trench",
        "category_id": 5, # Jackets
        "subcategory_id": 12, # Outerwear
        "collection_handles": ["all-denim", "all-new"],
        "badge": "NEW ARRIVAL",
        "description": "Crafted from non-stretch premium cotton denim with a gentle garment wash, the Sloane Trench offers a relaxed silhouette with dropped shoulders, storm flap, and a detachable tie belt.",
        "size_and_fit": "Relaxed slouchy fit. For a tailored silhouette, size down one size. Model is 5'10 wearing size Small.",
        "care": "Machine wash cold with like colors. Line dry inside out to preserve color richness.",
        "details": ["100% Premium Rigid Cotton Denim", "Double-breasted horn button closure", "Raglan dropped shoulders", "Matching self-tie waist belt", "Deep storm welt pockets"],
        "rise": "",
        "fit": "Relaxed Overcoat",
        "wash": "Vintage Indigo",
        "colors": [
            {
                "color_name": "Vintage Indigo",
                "color_hex": "#364a66",
                "color_handle": "vintage-indigo",
                "price": 268.00,
                "sizes": ["XS", "S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Washed Sand",
                "color_hex": "#d8cbbb",
                "color_handle": "washed-sand",
                "price": 258.00,
                "sizes": ["S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Onyx Black",
                "color_hex": "#1e1e1e",
                "color_handle": "onyx-black",
                "price": 278.00,
                "sizes": ["XS", "S", "M", "L", "XL"],
                "primary_image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                ]
            }
        ]
    },
    {
        "title": "Rowan Relaxed Carpenter Pant - Utility Taupe",
        "handle": "rowan-relaxed-carpenter-pant",
        "category_id": 1, # Denim
        "subcategory_id": 2, # Wide Leg Jeans
        "collection_handles": ["all-denim", "best-sellers"],
        "badge": "BEST SELLER",
        "description": "Inspired by authentic workwear, the Rowan Carpenter Pant pairs a mid-to-high rise waist with a relaxed wide leg, functional hammer loop, and tool pockets in structured bull denim.",
        "size_and_fit": "Rise: 11.5\", Inseam: 32\", Leg Opening: 20\". Fits true to size with relaxed ease through hip and thigh.",
        "care": "Machine wash cold inside out. Tumble dry low or air dry.",
        "details": ["98% Cotton, 2% Elastane comfort stretch", "Hammer loop and side tool pocket", "Antique brass hardware and rivets", "Clean finished wide leg hem"],
        "rise": "High Rise",
        "fit": "Relaxed Carpenter",
        "wash": "Utility Taupe",
        "colors": [
            {
                "color_name": "Utility Taupe",
                "color_hex": "#8d8070",
                "color_handle": "utility-taupe",
                "price": 198.00,
                "sizes": ["24", "25", "26", "27", "28", "29", "30"],
                "primary_image": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Faded Olive",
                "color_hex": "#525b44",
                "color_handle": "faded-olive",
                "price": 198.00,
                "sizes": ["25", "26", "27", "28", "29", "30", "31"],
                "primary_image": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Stonewash Blue",
                "color_hex": "#46698b",
                "color_handle": "stonewash-blue",
                "price": 218.00,
                "sizes": ["24", "25", "26", "27", "28", "29"],
                "primary_image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80"
                ]
            }
        ]
    },
    {
        "title": "Aria Ribbed Cashmere Polo - Oatmeal Heather",
        "handle": "aria-ribbed-cashmere-polo",
        "category_id": 3, # Sweaters
        "subcategory_id": 9, # Pullovers
        "collection_handles": ["all-new"],
        "badge": "ESSENTIAL",
        "description": "Ultra-soft knit polo spun from responsibly sourced Mongolian cashmere blended with ultrafine merino wool. Features a clean Johnny collar and wide rib texture.",
        "size_and_fit": "Body-skimming fit with stretch. Fits true to size. Length: 22\" from high point shoulder.",
        "care": "Hand wash cold in gentle wool detergent. Lay flat to dry on towel. Do not wring.",
        "details": ["70% Cashmere, 30% Ultrafine Merino Wool", "Open Johnny polo collar neckline", "Vertical micro-rib knitting", "Fine ribbed cuffs and hem"],
        "rise": "",
        "fit": "Slim Ribbed",
        "wash": "",
        "colors": [
            {
                "color_name": "Oatmeal Heather",
                "color_hex": "#e2dbd0",
                "color_handle": "oatmeal-heather",
                "price": 228.00,
                "sizes": ["XS", "S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Espresso Brown",
                "color_hex": "#422e23",
                "color_handle": "espresso-brown",
                "price": 228.00,
                "sizes": ["S", "M", "L", "XL"],
                "primary_image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Dusty Cedar",
                "color_hex": "#985750",
                "color_handle": "dusty-cedar",
                "price": 238.00,
                "sizes": ["XS", "S", "M"],
                "primary_image": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80"
                ]
            }
        ]
    },
    {
        "title": "Celeste Bias Cut Silk Slip Dress - Champagne Luster",
        "handle": "celeste-bias-cut-silk-slip-dress",
        "category_id": 6, # Dresses
        "subcategory_id": 15, # Slip Dresses
        "collection_handles": ["all-new"],
        "badge": "EXCLUSIVE",
        "description": "Pure silk charmeuse cut on the bias for fluid movement and an effortless drape that skims the curves. Finished with delicate adjustable French spaghetti straps and French seams.",
        "size_and_fit": "Bias cut allows gentle stretch and body skimming. Midi length hits mid-calf.",
        "care": "Dry clean recommended or hand wash cold with silk wash.",
        "details": ["100% Mulberry Silk Charmeuse", "Bias-cut construction for liquid drape", "Adjustable delicate spaghetti straps", "Subtle V-neckline front and back", "French seams"],
        "rise": "",
        "fit": "Bias Midi Slip",
        "wash": "",
        "colors": [
            {
                "color_name": "Champagne Luster",
                "color_hex": "#f1e6d0",
                "color_handle": "champagne-luster",
                "price": 218.00,
                "sizes": ["XS", "S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Midnight Navy",
                "color_hex": "#1a2436",
                "color_handle": "midnight-navy",
                "price": 218.00,
                "sizes": ["XS", "S", "M", "L", "XL"],
                "primary_image": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Emerald Moss",
                "color_hex": "#284236",
                "color_handle": "emerald-moss",
                "price": 228.00,
                "sizes": ["S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80"
                ]
            }
        ]
    },
    {
        "title": "Devon Structured Boxy Denim Jacket - Raw Ecru",
        "handle": "devon-structured-boxy-denim-jacket",
        "category_id": 5, # Jackets
        "subcategory_id": 11, # Denim Jackets
        "collection_handles": ["all-denim", "all-new"],
        "badge": "TRENDING",
        "description": "Modern take on the vintage trucker jacket. Cut with a boxy, cropped silhouette, dropped shoulder, and oversized flap chest pockets in premium undyed ecru denim.",
        "size_and_fit": "Boxy cropped fit. Take your normal size for fashion-forward volume. Model is 5'9 wearing size Small.",
        "care": "Machine wash cold inside out. Hang dry to maintain shape.",
        "details": ["100% Unbleached Organic Cotton Denim", "Boxy cropped proportions", "Shank button front closure", "Oversized utility chest pockets", "Signature Luma Threads engraved buttons"],
        "rise": "",
        "fit": "Boxy Cropped",
        "wash": "Raw Ecru",
        "colors": [
            {
                "color_name": "Raw Ecru",
                "color_hex": "#f0ece1",
                "color_handle": "raw-ecru",
                "price": 188.00,
                "sizes": ["XS", "S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Deep Indigo",
                "color_hex": "#1f2e4d",
                "color_handle": "deep-indigo",
                "price": 198.00,
                "sizes": ["XS", "S", "M", "L", "XL"],
                "primary_image": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=900&q=80"
                ]
            },
            {
                "color_name": "Washed Sage",
                "color_hex": "#82917e",
                "color_handle": "washed-sage",
                "price": 188.00,
                "sizes": ["S", "M", "L"],
                "primary_image": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
                "hover_image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
                ]
            }
        ]
    }
]

created_products_dict = {}

for p_data in NEW_PRODUCTS:
    first_col = p_data["colors"][0]
    
    # Swatches json list
    swatches_list = []
    for c in p_data["colors"]:
        swatches_list.append({
            "name": c["color_name"],
            "hex": c["color_hex"],
            "handle": c["color_handle"],
            "image": c["primary_image"],
            "hoverImage": c["hover_image"],
            "price": c["price"],
            "priceFormatted": f"${c['price']:.2f}",
            "sizes": c["sizes"]
        })
    
    # Combine all sizes for the base product
    all_sizes = []
    for c in p_data["colors"]:
        for sz in c["sizes"]:
            if sz not in all_sizes:
                all_sizes.append(sz)
                
    category = Category.objects.filter(id=p_data["category_id"]).first()
    subcategory = SubCategory.objects.filter(id=p_data["subcategory_id"]).first()

    prod, created = Product.objects.update_or_create(
        handle=p_data["handle"],
        defaults={
            "title": p_data["title"],
            "colorway": first_col["color_name"],
            "color": first_col["color_name"].lower(),
            "price": first_col["price"],
            "price_formatted": f"${first_col['price']:.2f}",
            "image": first_col["primary_image"],
            "hover_image": first_col["hover_image"],
            "images": first_col["images"],
            "badge": p_data["badge"],
            "description": p_data["description"],
            "size_and_fit": p_data["size_and_fit"],
            "care": p_data["care"],
            "sizes": all_sizes,
            "details": p_data["details"],
            "swatches": swatches_list,
            "rise": p_data.get("rise", ""),
            "fit": p_data.get("fit", ""),
            "wash": p_data.get("wash", ""),
            "category": category,
            "subcategory": subcategory,
            "is_active": True,
        }
    )

    # Attach to Collections
    for col_handle in p_data["collection_handles"]:
        col = Collection.objects.filter(handle=col_handle).first()
        if col:
            col.products.add(prod)

    # Create ProductColor records
    ProductColor.objects.filter(product=prod).delete()
    for c in p_data["colors"]:
        pcolor = ProductColor.objects.create(
            product=prod,
            color_name=c["color_name"],
            color_hex=c["color_hex"],
            color_handle=c["color_handle"],
            primary_image=c["primary_image"],
            hover_image=c["hover_image"],
            images=c["images"],
            price=c["price"],
            sizes=c["sizes"]
        )
        # Create variants for each size of this color
        for sz in c["sizes"]:
            sku = f"{prod.handle[:12]}-{c['color_handle'][:6]}-{sz}".upper()
            ProductVariant.objects.update_or_create(
                sku=sku,
                defaults={
                    "product": prod,
                    "color": pcolor,
                    "color_name": c["color_name"],
                    "size": sz,
                    "price": c["price"],
                    "stock_quantity": 50,
                    "is_available": True
                }
            )

    print(f"Created/Updated Product: {prod.title} (handle: {prod.handle}) with {len(p_data['colors'])} colors.")
    
    # Store in dict for catalog.json syncing
    created_products_dict[prod.handle] = {
        "handle": prod.handle,
        "title": prod.title,
        "colorway": prod.colorway,
        "color": prod.color,
        "price": float(prod.price),
        "priceFormatted": prod.price_formatted,
        "image": prod.image,
        "hoverImage": prod.hover_image,
        "images": prod.images,
        "badge": prod.badge,
        "description": prod.description,
        "sizeAndFit": prod.size_and_fit,
        "care": prod.care,
        "sizes": prod.sizes,
        "details": prod.details,
        "swatches": prod.swatches,
        "rise": prod.rise,
        "fit": prod.fit,
        "wash": prod.wash,
        "category_title": category.title if category else "",
        "subcategory_title": subcategory.title if subcategory else "",
    }

# Update catalog.json in both web and pistoladenim-nextjs
def update_catalog(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        catalog_data = json.load(f)

    for h, p in created_products_dict.items():
        catalog_data["products"][h] = p

    for p_data in NEW_PRODUCTS:
        h = p_data["handle"]
        for col_handle in p_data["collection_handles"]:
            if col_handle in catalog_data.get("collections", {}):
                if h not in catalog_data["collections"][col_handle]["products"]:
                    catalog_data["collections"][col_handle]["products"].insert(0, h)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(catalog_data, f, indent=2)
    print(f"Updated {file_path}")

update_catalog(r"C:\Users\Del\Documents\DSA\pattern\pistoladenim_site\web\lib\catalog.json")
update_catalog(r"C:\Users\Del\Documents\DSA\pattern\pistoladenim-nextjs\lib\catalog.json")
print("ALL DONE SUCCESSFULLY!")

