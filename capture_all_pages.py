import os
import time
import json
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(os.getcwd(), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

SAMPLE_CART = [
    {
        "product": {
            "id": 1,
            "title": "Aria Ribbed Cashmere Polo",
            "handle": "aria-ribbed-cashmere-polo",
            "price": 248.00,
            "category": "Tops",
            "colorVariants": [{"name": "Dusty Cedar", "hex": "#a36363"}],
            "image": "https://www.pistoladenim.com/cdn/shop/files/P00016200RLMNWVE_LEXI_036.jpg"
        },
        "size": "M",
        "quantity": 1
    },
    {
        "product": {
            "id": 2,
            "title": "Devon Structured Boxy Denim Jacket",
            "handle": "devon-structured-boxy-denim-jacket",
            "price": 198.00,
            "category": "Jackets",
            "colorVariants": [{"name": "Raw Ecru", "hex": "#e8e4d9"}],
            "image": "https://www.pistoladenim.com/cdn/shop/files/P00016029ROSEWOD_LEXI_004.jpg"
        },
        "size": "S",
        "quantity": 2
    }
]

def main():
    print("Launching headless Chrome for screenshot capture...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Storefront Home
        print("Capturing 01_storefront_home.png...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_storefront_home.png"))

        # 2. Collection View
        print("Capturing 02_collection_all_denim.png...")
        page.goto("http://localhost:3000/collections/all-denim", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_collection_all_denim.png"))

        # 3. Product Detail (Aria Polo)
        print("Capturing 03_product_detail_aria_polo.png...")
        page.goto("http://localhost:3000/products/aria-ribbed-cashmere-polo?color=Dusty+Cedar", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_product_detail_aria_polo.png"))

        # 4. Product Detail (Devon Jacket)
        print("Capturing 04_product_detail_devon_jacket.png...")
        page.goto("http://localhost:3000/products/devon-structured-boxy-denim-jacket?color=Raw+Ecru", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_product_detail_devon_jacket.png"))

        # Seed localStorage cart
        cart_json = json.dumps(SAMPLE_CART)
        page.evaluate(f"localStorage.setItem('pistola_cart', '{cart_json}');")

        # 5. Cart View with Items
        print("Capturing 05_cart_view.png...")
        page.goto("http://localhost:3000/cart", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_cart_view.png"))

        # 6. Checkout with Payment Methods
        print("Capturing 06_checkout_payment_methods.png...")
        page.goto("http://localhost:3000/checkout", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_checkout_payment_methods.png"))

        # 7. Order Tracking Portal
        print("Capturing 07_order_tracking_portal.png...")
        page.goto("http://localhost:3000/track", wait_until="networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "07_order_tracking_portal.png"))

        # --- ADMIN DASHBOARD TABS ---
        dash_tabs = [
            ("08_dashboard_overview.png", "overview"),
            ("09_dashboard_products.png", "products"),
            ("10_dashboard_categories.png", "categories"),
            ("11_dashboard_orders_tracking.png", "orders"),
            ("12_dashboard_cart_requests.png", "cart-requests"),
            ("13_dashboard_customers_list.png", "customers"),
        ]

        page.goto("http://127.0.0.1:8000/dashboard/", wait_until="networkidle")
        time.sleep(1.5)

        for filename, tab in dash_tabs:
            print(f"Capturing Dashboard Tab [{tab}] -> {filename}...")
            page.evaluate(f"switchTab('{tab}');")
            time.sleep(1)
            page.screenshot(path=os.path.join(SCREENSHOTS_DIR, filename))

        # 14. Dashboard Tracking Modal
        print("Capturing 14_dashboard_tracking_modal.png...")
        page.evaluate("switchTab('orders');")
        time.sleep(0.5)
        track_btn = page.query_selector("button:has-text('Track')")
        if track_btn:
            track_btn.click()
            time.sleep(0.8)
            page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "14_dashboard_tracking_modal.png"))
            page.evaluate("closeTrackingModal();")
            time.sleep(0.5)

        # 15. Dashboard Invoice Modal
        print("Capturing 15_dashboard_invoice_modal.png...")
        invoice_btn = page.query_selector("button:has-text('Invoice')")
        if invoice_btn:
            invoice_btn.click()
            time.sleep(0.8)
            page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "15_dashboard_invoice_modal.png"))
            page.evaluate("closeOrderDetailModal();")
            time.sleep(0.5)

        # 16. Dashboard Add Product Modal
        print("Capturing 16_dashboard_add_product_modal.png...")
        page.evaluate("switchTab('products');")
        time.sleep(0.5)
        add_btn = page.query_selector("button:has-text('Add Product')")
        if add_btn:
            add_btn.click()
            time.sleep(0.8)
            page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "16_dashboard_add_product_modal.png"))
            page.evaluate("closeCreateModal();")
            time.sleep(0.5)

        browser.close()
    print("All screenshots successfully captured!")

if __name__ == "__main__":
    main()

