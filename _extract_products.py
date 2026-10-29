import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(r"c:\Users\Del\Documents\DSA\pattern\pistoladenim_site")

FILES = {
    "home": ROOT / "index" / "index_local.html",
    "all-new": ROOT / "collections__all-new" / "collections__all-new_local.html",
    "best-sellers": ROOT / "collections__best-sellers" / "collections__best-sellers_local.html",
    "all-denim": ROOT / "collections__all-denim" / "collections__all-denim_local.html",
    "about": ROOT / "pages__about-us" / "pages__about-us_local.html",
    "product": ROOT / "products__wes-high-rise-barrel-moonbeam" / "products__wes-high-rise-barrel-moonbeam_local.html",
}


def clean(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def abs_url(src: str) -> str:
    src = unescape(src)
    src = src.split("&amp;width=")[0].split("?v=")[0] + (
        "?v=" + src.split("?v=")[1].split("&")[0] if "?v=" in src else ""
    )
    src = unescape(src.split("?")[0])
    if src.startswith("//"):
        return "https:" + src
    return src


def uniq(seq):
    seen = set()
    out = []
    for x in seq:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


def extract_ns_cards(html: str):
    products = {}
    blocks = re.split(r'class="ns-product product-card', html)
    for block in blocks[1:]:
        handle_m = re.search(r'href="/products/([^"]+)"', block)
        if not handle_m:
            continue
        handle = handle_m.group(1)
        if handle in products:
            continue
        name_m = re.search(
            r'js-card-product-name-link"[^>]*>(.*?)</a>', block, re.S
        )
        title = clean(name_m.group(1)) if name_m else handle.replace("-", " ").title()
        color_m = re.search(r'ns-prod-name-colorway[^>]*>(.*?)</em>', block, re.S)
        color = clean(color_m.group(1)) if color_m else ""
        price_m = re.search(r'price-item--regular">\s*(\$[\d,.]+)', block)
        sale_m = re.search(r'price-item--sale[^>]*>\s*(\$[\d,.]+)', block)
        price = (price_m.group(1) if price_m else sale_m.group(1) if sale_m else "")
        imgs = [
            abs_url(s)
            for s in re.findall(r'<img[^>]+src="([^"]+)"', block)
            if "cdn/shop/files" in s
        ]
        badge = ""
        if re.search(r'product-tag[^>]*>\s*New', block):
            badge = "New"
        elif re.search(r'Best seller', block, re.I):
            badge = "Best seller"
        products[handle] = {
            "handle": handle,
            "title": title,
            "color": color,
            "price": price or "$0.00",
            "images": uniq(imgs)[:4],
            "badge": badge,
        }
    return products


def extract_home_cards(html: str):
    products = {}
    blocks = re.split(r'class="card-wrapper', html)
    for block in blocks[1:]:
        handle_m = re.search(r'href="/products/([^"]+)"', block)
        if not handle_m:
            continue
        handle = handle_m.group(1)
        if handle in products or handle == "gift-card":
            continue
        title_m = re.search(r'card__heading h5.*?href="/products/[^"]+"[^>]*>(.*?)</a>', block, re.S)
        title = clean(title_m.group(1)) if title_m else handle.replace("-", " ").title()
        color_m = re.search(r'card__heading-colorway[^>]*>(.*?)</em>', block, re.S)
        color = clean(color_m.group(1)) if color_m else ""
        price_m = re.search(r'price-item--regular">\s*(\$[\d,.]+)', block)
        imgs = [
            abs_url(s)
            for s in re.findall(r'<img[^>]+src="([^"]+)"', block)
            if "cdn/shop/files" in s
        ]
        badge = "New Arrival" if "New Arrival" in block else ""
        products[handle] = {
            "handle": handle,
            "title": title,
            "color": color,
            "price": price_m.group(1) if price_m else "$0.00",
            "images": uniq(imgs)[:4],
            "badge": badge,
        }
    return products


home_html = FILES["home"].read_text(encoding="utf-8", errors="ignore")
about_html = FILES["about"].read_text(encoding="utf-8", errors="ignore")
product_html = FILES["product"].read_text(encoding="utf-8", errors="ignore")

all_products = {}
collections = {}

home_products = extract_home_cards(home_html)
all_products.update(home_products)

for key in ("all-new", "best-sellers", "all-denim"):
    html = FILES[key].read_text(encoding="utf-8", errors="ignore")
    items = extract_ns_cards(html)
    handles = []
    for handle, p in items.items():
        handles.append(handle)
        existing = all_products.get(handle)
        if not existing or (len(p["images"]) > len(existing.get("images", []))):
            all_products[handle] = p
        elif existing and not existing.get("images"):
            existing["images"] = p["images"]
    collections[key] = {
        "handle": key,
        "title": {"all-new": "All New", "best-sellers": "Best Sellers", "all-denim": "All Denim"}[key],
        "products": handles,
    }

# PDP extras for Wes
gallery = [
    abs_url(s)
    for s in re.findall(
        r'product__media[\s\S]{0,400}src="(//www\.pistoladenim\.com/cdn/shop/files/[^"]+)"',
        product_html,
    )
]
if not gallery:
    gallery = [
        abs_url(s)
        for s in re.findall(r'src="(//www\.pistoladenim\.com/cdn/shop/files/WES[^"]+)"', product_html)
    ]

wes = all_products.get("wes-high-rise-barrel-moonbeam") or {
    "handle": "wes-high-rise-barrel-moonbeam",
    "title": "Wes High Rise Barrel - Moonbeam",
    "color": "Moonbeam",
    "price": "$248.00",
    "images": [],
    "badge": "New",
}
if gallery:
    wes["images"] = uniq(gallery)[:8]
wes["description"] = (
    "The Wes High Rise Barrel in Moonbeam is a sculpted barrel-leg jean with a high rise "
    "and a softly faded wash. Designed for everyday wear with a clean, modern silhouette."
)
wes["details"] = [
    "High rise barrel leg",
    "Moonbeam wash",
    "Premium denim construction",
    "Made for everyday wear",
]
wes["sizes"] = ["23", "24", "25", "26", "27", "28", "29", "30", "31", "32"]
all_products["wes-high-rise-barrel-moonbeam"] = wes

fallback = wes["images"][0] if wes.get("images") else ""
for p in all_products.values():
    if not p.get("images") and fallback:
        p["images"] = [fallback]
    p.setdefault("description", f"{p['title']} from Pistola Denim.")
    p.setdefault("sizes", ["23", "24", "25", "26", "27", "28", "29", "30"] if "rise" in p["handle"] or "jean" in p["handle"] or "denim" in p["handle"] or "barrel" in p["handle"] or "lexi" in p["handle"] or "sabrina" in p["handle"] or "jett" in p["handle"] or "kyra" in p["handle"] or "saige" in p["handle"] or "beau" in p["handle"] or "harlowe" in p["handle"] else ["XS", "S", "M", "L", "XL"])
    p.setdefault("badge", "")
    p.setdefault("color", "")
    p.setdefault("details", [])

cats = []
for m in re.finditer(
    r'<img alt="([^"]+)" src="(//www\.pistoladenim\.com/cdn/shop/files/[^"]+)"',
    home_html,
):
    alt, src = m.group(1), m.group(2)
    if alt.isupper() or alt in ("THE LEXI", "DARK WASH", "HOLIDAY 2026", "PANTS", "KNITS", "ICONS"):
        url = abs_url(src)
        if not any(c["title"] == alt for c in cats):
            href = {
                "ICONS": "/collections/best-sellers",
                "THE LEXI": "/collections/all-denim",
                "DARK WASH": "/collections/all-denim",
                "HOLIDAY 2026": "/collections/all-new",
                "PANTS": "/collections/all-denim",
                "KNITS": "/collections/all-new",
            }.get(alt, "/collections/all-new")
            cats.append({"title": alt, "image": url, "href": href})

desktop = re.search(r'image-banner__desktop-first[^>]*src="([^"]+)"', home_html)
mobile = re.search(r'image-banner__mobile-first[^>]*src="([^"]+)"', home_html)

about_img = re.search(r'grace-img2\.png[^"]*', about_html)
about = {
    "heading": "Clothing for women going places.",
    "subheading": "About The Brand",
    "image": "https://www.pistoladenim.com/cdn/shop/files/grace-img2.png",
    "paragraphs": [
        "Pistola is a Los Angeles-based womenswear brand founded in 2013 by Grace Na. With over twenty years of experience in the apparel industry, Na was able to identify whitespace in the denim market. She aimed to offer high-quality pieces with luxury construction and fabrication at a lower price than her counterparts. With her extensive knowledge of the industry, she made her vision a reality.",
        "Over the last decade, the brand has naturally evolved into new categories, offering everyday premium pieces with street-smart and utilitarian sensibility. Two things have remained consistent since the brand's inception — quality and ease. Pistola continues to produce clothing for a busy, modern, and city-dwelling woman who demands her clothing work as hard as she does. Evolution is in our DNA, but our mission to bring women superior products at sensible prices will never change.",
    ],
}

out = {
    "hero": {
        "desktop": abs_url(desktop.group(1)) if desktop else "",
        "mobile": abs_url(mobile.group(1)) if mobile else "",
        "cta": "Shop New Arrivals",
        "ctaHref": "/collections/all-new",
    },
    "categories": cats[:6],
    "homeProducts": [h for h in home_products.keys() if h != "gift-card"][:12],
    "collections": collections,
    "products": all_products,
    "about": about,
}

print("products", len(all_products))
print("collections", {k: len(v["products"]) for k, v in collections.items()})
print("home", len(out["homeProducts"]))
print("hero", out["hero"])
print("sample", json.dumps(list(all_products.values())[1], indent=2)[:800])
(ROOT / "_extracted.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
print("wrote _extracted.json")
