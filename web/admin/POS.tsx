import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/api/productService";
import { customerService } from "@/api/customerService";
import { orderService } from "@/api/orderService";
import { type Product, type ProductSwatch } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { type Order, type OrderItem, type Customer } from "@/types/admin";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  X,
  User,
  CreditCard,
  Banknote,
  ChevronRight,
  Store,
  Filter,
  Apple,
  Beef,
  Coffee,
  Cookie,
  LayoutGrid,
  Percent,
  Share2,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Check,
  Users as UsersIcon,
  Smartphone,
  Monitor,
  Laptop,
  Headphones,
  Home,
  Cpu,
  MousePointer2 as Mouse,
  Tablet,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { safeToDate } from "@/lib/utils";
import { getCategoryColor, renderCategoryIcon } from "@/lib/icons";

interface CartItem {
  cartItemId: string;
  id: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

const POSProductCard = ({ 
  product, 
  onAddToCart 
}: { 
  product: Product; 
  onAddToCart: (item: {
    productId: string;
    name: string;
    color: string;
    size: string;
    price: number;
    image: string;
  }) => void;
}) => {
  const [activeSwatch, setActiveSwatch] = useState<ProductSwatch | null>(
    product.swatches && product.swatches.length > 0 ? product.swatches[0] : null
  );

  const currentSizes = (activeSwatch?.sizes && activeSwatch.sizes.length > 0)
    ? activeSwatch.sizes
    : (product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"]);

  const [selectedSize, setSelectedSize] = useState<string>(currentSizes[0] || "M");

  const currentColorway = activeSwatch?.name || product.colorway || "Standard";
  const currentMainImage = activeSwatch?.image || product.image || "/placeholder.jpg";
  const currentPrice = typeof activeSwatch?.price === 'number'
    ? activeSwatch.price
    : (typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)));

  const handleSwatchSelect = (swatch: ProductSwatch) => {
    setActiveSwatch(swatch);
    const swatchSizes = swatch.sizes && swatch.sizes.length > 0 ? swatch.sizes : currentSizes;
    if (!swatchSizes.includes(selectedSize)) {
      setSelectedSize(swatchSizes[0] || "M");
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart({
      productId: String(product.id || product.handle || ""),
      name: product.name || product.title,
      color: currentColorway,
      size: selectedSize || currentSizes[0] || "M",
      price: currentPrice,
      image: currentMainImage,
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl lg:rounded-3xl p-3 lg:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Media & Badges */}
        <div className="relative aspect-[3/4] sm:aspect-square rounded-xl lg:rounded-2xl overflow-hidden bg-muted mb-3 border border-border">
          <img 
            src={currentMainImage} 
            alt={`${product.name} - ${currentColorway}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-card/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-foreground border border-border">
            {product.category || "Apparel"}
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/90 text-white backdrop-blur-sm rounded-lg text-[9px] font-bold shadow-sm">
            {product.stock || 45} In Stock
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 bg-black/75 text-white backdrop-blur-sm rounded-md text-[9px] font-semibold truncate max-w-[140px]">
              {currentColorway}
            </span>
          </div>
        </div>

        {/* Title & Price */}
        <div className="mb-2">
          <h3 className="font-bold text-xs lg:text-sm text-foreground line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm lg:text-base font-black text-emerald-600 font-mono">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {selectedSize ? `Size: ${selectedSize}` : ""}
            </span>
          </div>
        </div>

        {/* Color Swatches */}
        {product.swatches && product.swatches.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1 font-semibold">
              <span>Color:</span>
              <span className="text-foreground font-bold truncate max-w-[100px]">{currentColorway}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.swatches.map((swatch, idx) => {
                const isActive = activeSwatch?.name === swatch.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSwatchSelect(swatch)}
                    title={swatch.name}
                    className={`w-5 h-5 rounded-md border transition-all cursor-pointer ${
                      isActive 
                        ? "ring-2 ring-emerald-500 border-white scale-110 shadow-sm" 
                        : "border-border hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: swatch.color || "#333" }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection Pills */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1 font-semibold">
            <span>Size:</span>
            <span className="text-foreground font-bold">{selectedSize}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {currentSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Plus size={14} />
        Add to Cart · {formatPrice(currentPrice)}
      </button>
    </div>
  );
};

import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";

const POS = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { customers: customersList, loading: customersLoading } = useCustomers();
  const [cart, setCart] = useState<CartItem[]>([]);
  const loading = productsLoading || customersLoading;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [customerType, setCustomerType] = useState("Walk-in-customer");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");
  const [activeTab, setActiveTab] = useState<"products" | "cart">("products");

  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customersList.slice(0, 8);
    const q = customerSearchQuery.toLowerCase();
    return customersList.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 10);
  }, [customerSearchQuery, customersList]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.email.trim()) {
      toast.error("Customer email is required");
      return;
    }
    setIsCreatingCustomer(true);
    try {
      const created = await customerService.create({
        name: newCustomerForm.name.trim() || newCustomerForm.email.split("@")[0],
        email: newCustomerForm.email.trim(),
        phone: newCustomerForm.phone.trim(),
        address: newCustomerForm.address.trim(),
        city: newCustomerForm.city.trim(),
      });
      setSelectedCustomer(created);
      setShowNewCustomerModal(false);
      setNewCustomerForm({ name: "", email: "", phone: "", address: "", city: "" });
      toast.success(`Customer ${created.name} registered and selected for billing!`);
    } catch (err: any) {
      console.error("Error creating customer:", err);
      toast.error(err?.response?.data?.error || "Failed to create customer");
    } finally {
      setIsCreatingCustomer(false);
    }
  };
  
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (name: unknown) => {
    if (!name || typeof name !== 'string') return LayoutGrid;
    const lowerName = name.toLowerCase();
    if (lowerName.includes("monitor")) return Monitor;
    if (lowerName.includes("laptop")) return Laptop;
    if (lowerName.includes("mobile") || lowerName.includes("phone")) return Smartphone;
    if (lowerName.includes("tablet")) return Tablet;
    if (lowerName.includes("audio") || lowerName.includes("headphone")) return Headphones;
    if (lowerName.includes("desktop") || lowerName.includes("computer")) return Cpu;
    if (lowerName.includes("peripheral") || lowerName.includes("mouse") || lowerName.includes("keyboard")) return Mouse;
    if (lowerName.includes("home") || lowerName.includes("kitchen")) return Home;
    if (lowerName.includes("fruit") || lowerName.includes("apple")) return Apple;
    if (lowerName.includes("vegetable") || lowerName.includes("beef")) return Beef;
    if (lowerName.includes("beverage") || lowerName.includes("coffee")) return Coffee;
    if (lowerName.includes("snack") || lowerName.includes("cookie")) return Cookie;
    if (lowerName.includes("grocer") || lowerName.includes("store")) return Store;
    return LayoutGrid;
  };

  const dynamicCategories = useMemo(() => [
    { name: "All", icon: LayoutGrid },
    ...Array.from(new Set(products.map(p => p.category)))
      .filter(Boolean)
      .sort()
      .map(cat => ({
        name: cat,
        icon: getCategoryIcon(cat),
        color: getCategoryColor(cat as string)
      }))
  ], [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(queryLower)) ||
        (p.id && p.id.toLowerCase().includes(queryLower))
      );
    }
    return filtered;
  }, [searchQuery, selectedCategory, products]);

  const addToCart = (itemData: {
    productId: string;
    name: string;
    color: string;
    size: string;
    price: number;
    image: string;
  }) => {
    const cartItemId = `${itemData.productId}-${itemData.color}-${itemData.size}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        cartItemId,
        id: itemData.productId,
        productId: itemData.productId,
        name: itemData.name,
        color: itemData.color,
        size: itemData.size,
        price: itemData.price,
        quantity: 1,
        image: itemData.image,
      }];
    });
    toast.success(`Added ${itemData.name} (${itemData.color}, ${itemData.size}) to cart`, { duration: 1200 });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    toast.error("Item removed from cart");
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const discountAmount = discountType === "flat" ? discount : (subtotal * discount) / 100;
  const total = Math.max(0, subtotal + tax - discountAmount);

  const effectiveCustomerName = customerType === "Walk-in-customer"
    ? (walkinName.trim() || "Walk-in Customer")
    : (selectedCustomer?.name || "Registered Customer");
  const effectiveCustomerPhone = customerType === "Walk-in-customer"
    ? walkinPhone.trim()
    : (selectedCustomer?.phone || "");
  const effectiveCustomerEmail = customerType === "Walk-in-customer"
    ? ""
    : (selectedCustomer?.email || "");

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);

    const orderData = {
      uid: selectedCustomer?.id || user?.id || "pos-admin",
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        features: [item.color, item.size].filter(Boolean)
      })),
      subtotal,
      tax,
      discount: discountAmount,
      totalAmount: total,
      customerType: selectedCustomer ? "Registered Customer" : "Walk-in-customer",
      customerName: effectiveCustomerName,
      customerEmail: effectiveCustomerEmail,
      customerPhone: effectiveCustomerPhone,
      status: "pending" as const,
      paymentStatus: "unpaid" as const,
      paymentMethod,
      source: "pos",
      orderId: `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingAddress: {
        address: selectedCustomer?.address || "POS In-Store",
        city: selectedCustomer?.city || "Retail Store",
        phone: effectiveCustomerPhone || "N/A"
      }
    };

    try {
      const result = await orderService.create(orderData);
      setLastOrder(result);
      setShowInvoice(true);
      setCart([]);
      setDiscount(0);
      setWalkinName("");
      setWalkinPhone("");
      setCashTendered("");
      toast.success("Bill generated successfully!");
    } catch (error) {
      console.error("Error creating bill:", error);
      toast.error("Failed to generate bill");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);

    const orderData = {
      uid: selectedCustomer?.id || user?.id || "pos-admin",
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        features: [item.color, item.size].filter(Boolean)
      })),
      subtotal,
      tax,
      discount: discountAmount,
      totalAmount: total,
      customerType: selectedCustomer ? "Registered Customer" : "Walk-in-customer",
      customerName: effectiveCustomerName,
      customerEmail: effectiveCustomerEmail,
      customerPhone: effectiveCustomerPhone,
      status: "delivered" as const,
      paymentStatus: "paid" as const,
      paymentMethod,
      source: "pos",
      orderId: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingAddress: {
        address: selectedCustomer?.address || "POS In-Store",
        city: selectedCustomer?.city || "Retail Store",
        phone: effectiveCustomerPhone || "N/A"
      }
    };

    try {
      const result = await orderService.create(orderData);
      setLastOrder(result);
      setShowInvoice(true);
      setCart([]);
      setDiscount(0);
      setWalkinName("");
      setWalkinPhone("");
      setCashTendered("");
      setSelectedCustomer(null);
      toast.success("Payment successful!");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayUnpaidBill = async () => {
    if (!lastOrder) return;
    const orderIdToUpdate = lastOrder.id || lastOrder.orderId;
    if (!orderIdToUpdate) return;
    setIsProcessing(true);
    try {
      await orderService.update(orderIdToUpdate, {
        paymentStatus: "paid",
        status: "delivered"
      });
      setLastOrder({ ...lastOrder, paymentStatus: "paid", status: "delivered" });
      toast.success("Payment recorded! Bill marked as PAID.");
    } catch (error) {
      console.error("Error updating bill payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareInvoice = (customer: Customer) => {
    if (!lastOrder) return;

    const itemsList = lastOrder.items.map(item => 
      `${item.name} x ${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    const orderDate = safeToDate(lastOrder.createdAt) || new Date();

    const emailBody = `
LUMA THREADS - TAX INVOICE
Invoice / Order ID: ${lastOrder.orderId}
Customer: ${customer.name}
Date: ${format(orderDate, "MMM dd, yyyy · hh:mm a")}
Status: ${(lastOrder.paymentStatus || "").toUpperCase()}

Items:
${itemsList}

Subtotal: ${formatPrice(lastOrder.subtotal || 0)}
Tax (10%): ${formatPrice(lastOrder.tax || 0)}
Total Amount: ${formatPrice(lastOrder.totalAmount)}
Payment Method: ${(lastOrder.paymentMethod || "Cash").toUpperCase()}

Thank you for shopping at LUMA THREADS!
Flagship Store: 128 Fashion Ave, NY 10018
Tel: +1 (800) 586-2847
    `.trim();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${customer.email}&su=Invoice for Order ${lastOrder.orderId}&body=${encodeURIComponent(emailBody)}`;
    
    window.open(gmailUrl, '_blank');
    setShowShareModal(false);
    toast.success(`Invoice shared with ${customer.name}`);
  };

  const filteredShareCustomers = customersList.filter(c => {
    const queryLower = shareSearchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(queryLower)) ||
      (c.email && c.email.toLowerCase().includes(queryLower)) ||
      (c.phone && c.phone.includes(shareSearchQuery))
    );
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col lg:overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-border bg-card shrink-0 z-10">
        <button 
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "products" ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-50/50" : "text-muted-foreground"}`}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab("cart")}
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === "cart" ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-50/50" : "text-muted-foreground"}`}
        >
          Cart ({cart.length})
          {cart.length > 0 && activeTab !== "cart" && (
            <span className="absolute top-3 right-[30%] w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6">
        {/* Product Section */}
        <div className={`flex-1 flex flex-col min-w-0 gap-4 lg:gap-6 lg:overflow-hidden ${activeTab !== "products" ? "hidden lg:flex" : "flex"}`}>
          <div className="bg-card border border-border rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">Products</h2>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 lg:mt-6 overflow-x-auto no-scrollbar pb-2">
              {dynamicCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat.name 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-muted text-muted-foreground hover:bg-accent border border-border"
                  }`}
                >
                  <cat.icon size={14} className="lg:w-4 lg:h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {filteredProducts.map(product => (
                <POSProductCard
                  key={product.id || product.handle}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>

          {/* Mobile Floating Cart Button */}
          {cart.length > 0 && activeTab === "products" && (
            <motion.button
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={() => setActiveTab("cart")}
              className="lg:hidden fixed bottom-28 right-6 z-30 bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              <ShoppingCart size={18} />
              <span>Checkout ({cart.length})</span>
            </motion.button>
          )}
        </div>

        {/* Billing Section */}
        <div className={`w-full lg:w-96 bg-card border border-border rounded-2xl lg:rounded-3xl flex flex-col shadow-sm lg:overflow-hidden shrink-0 ${activeTab !== "cart" ? "hidden lg:flex" : "flex"} flex-1 lg:flex-initial lg:h-auto`}>
          <div className="p-4 sm:p-5 border-b border-border shrink-0 space-y-3">
            {/* Customer Type Selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Billing Customer</h2>
              <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType("Walk-in-customer");
                    setSelectedCustomer(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerType === "Walk-in-customer" 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType("Registered")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerType === "Registered" 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Account
                </button>
              </div>
            </div>

            {/* Walk-in Customer Fields */}
            {customerType === "Walk-in-customer" && (
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text"
                  placeholder="Guest Name (opt)"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input 
                  type="text"
                  placeholder="Phone # (opt)"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Registered Customer Selection & Search */}
            {customerType === "Registered" && (
              <div className="space-y-2">
                {selectedCustomer ? (
                  <div className="p-3 bg-muted/70 rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center shrink-0 text-xs">
                        {(selectedCustomer.name || "CU").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{selectedCustomer.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{selectedCustomer.email}</p>
                        <p className="text-[9px] text-emerald-600 font-bold font-mono">
                          {selectedCustomer.order_count || 0} Orders · {formatPrice(selectedCustomer.total_spent || 0)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-all border border-border shrink-0 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                          type="text"
                          placeholder="Search customer by name, email..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewCustomerModal(true)}
                        className="px-2.5 py-2 bg-foreground text-background rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-sm"
                        title="Register New Customer"
                      >
                        <UserPlus size={14} />
                        <span>New</span>
                      </button>
                    </div>

                    {/* Customer Dropdown Results */}
                    <div className="max-h-36 overflow-y-auto custom-scrollbar border border-border rounded-xl bg-card divide-y divide-border/50 shadow-sm">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground p-3 text-center">No customers found</p>
                      ) : (
                        filteredCustomers.map(c => (
                          <div
                            key={c.id || c.email}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearchQuery("");
                            }}
                            className="p-2 hover:bg-muted/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-foreground truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap shrink-0">
                              {c.order_count || 0} orders
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Column Headers */}
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1 border-t border-border/50">
              <div className="col-span-6">Item & Variant</div>
              <div className="col-span-3 text-center">Qty</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-8">
                <ShoppingCart size={44} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className="grid grid-cols-12 items-center gap-2 p-2 rounded-xl hover:bg-muted/40 transition-colors border border-border/40">
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-foreground" title={item.name}>{item.name}</p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-muted text-[9px] font-semibold text-muted-foreground truncate max-w-[70px]">
                          {item.color}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-accent text-[9px] font-bold text-foreground">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center justify-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-5 h-5 bg-accent rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/80 cursor-pointer"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center font-mono">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-5 h-5 bg-accent rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/80 cursor-pointer"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-foreground font-mono">{formatPrice(item.price * item.quantity)}</span>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-muted-foreground/50 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-muted border-t border-border space-y-4 shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sub Total :</span>
                <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%) :</span>
                <span className="font-bold text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent size={14} />
                  <span>Discount :</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-card border border-border rounded-lg text-sm font-bold outline-none"
                  />
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")}
                    className="bg-card border border-border rounded-lg text-sm font-bold px-2 py-2 outline-none"
                  >
                    <option value="flat">Rs.</option>
                    <option value="percent">%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border pb-32 lg:pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-foreground">Total :</span>
                <span className="text-lg font-bold text-emerald-600">{formatPrice(total)}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {[
                  { id: "cash", icon: Banknote, label: "Cash" },
                  { id: "card", icon: CreditCard, label: "Card" },
                  { id: "upi", icon: Smartphone, label: "UPI" },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as Order["paymentMethod"])}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${
                      paymentMethod === method.id 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" 
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <method.icon size={16} />
                    <span className="text-[10px] font-bold uppercase">{method.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "cash" && (
                <div className="bg-card p-3 rounded-xl border border-border space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Cash Tendered:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-bold">$</span>
                      <input 
                        type="number"
                        step="any"
                        placeholder={total.toFixed(2)}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-24 px-2 py-1 bg-muted border border-border rounded-lg text-sm font-bold text-right outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  {Number(cashTendered) > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-border">
                      <span className="text-muted-foreground font-semibold">Change Due:</span>
                      <span className={`font-bold ${Number(cashTendered) >= total ? "text-emerald-600" : "text-rose-500"}`}>
                        {Number(cashTendered) >= total 
                          ? formatPrice(Number(cashTendered) - total)
                          : `Short by ${formatPrice(total - Number(cashTendered))}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCreateBill}
                  disabled={isProcessing}
                  className="py-3 bg-card border border-border text-foreground rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Printer size={16} className="text-muted-foreground" />
                  {isProcessing ? "Generating..." : "Create Bill"}
                </button>
                <button 
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CreditCard size={16} />
                  {isProcessing ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && lastOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-pos-invoice, #printable-pos-invoice * {
                  visibility: visible !important;
                }
                #printable-pos-invoice {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 16px !important;
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-border"
            >
              <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0 no-print">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {lastOrder.paymentStatus === "paid" ? "Tax Invoice / Receipt" : "Store Bill / Quotation"}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    lastOrder.paymentStatus === "paid" 
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {lastOrder.paymentStatus === "paid" ? "PAID" : "UNPAID"}
                  </span>
                </div>
                <button onClick={() => setShowInvoice(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-card text-foreground" id="printable-pos-invoice" ref={invoiceRef}>
                {/* Store Header */}
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <div className="w-14 h-14 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
                    LT
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Luma Threads</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Flagship Apparel & Streetwear Store</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">128 Fashion Ave, New York, NY 10018 · Tel: +1 (800) 586-2847</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">GST/Tax Reg: LT-884920-US</p>
                </div>

                {/* Bill Meta */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-muted/50 p-4 rounded-xl border border-border">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer Info</p>
                    <p className="font-bold text-foreground text-sm">{lastOrder.customerName}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {lastOrder.customerPhone || lastOrder.shippingAddress?.phone || "In-store Walk-in"}
                    </p>
                    {lastOrder.customerEmail && (
                      <p className="text-muted-foreground text-[11px] truncate">{lastOrder.customerEmail}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice Info</p>
                    <p className="font-bold text-foreground font-mono text-sm">{lastOrder.orderId}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {(() => {
                        const date = safeToDate(lastOrder.createdAt);
                        return date ? format(date, "MMM dd, yyyy · hh:mm a") : format(new Date(), "MMM dd, yyyy · hh:mm a");
                      })()}
                    </p>
                    <p className="text-muted-foreground text-[11px] uppercase font-bold">
                      Pay Mode: {lastOrder.paymentMethod || "Cash"}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  {(lastOrder.items || []).map((item: OrderItem, i: number) => (
                    <div key={i} className="grid grid-cols-12 text-xs py-2 border-b border-border/50 items-center">
                      <div className="col-span-6 pr-2">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Color: {item.color || (item as any).features?.[0] || 'Default'} · Size: {item.size || (item as any).features?.[1] || 'Standard'}
                        </p>
                      </div>
                      <div className="col-span-2 text-center text-muted-foreground font-mono">{item.quantity}</div>
                      <div className="col-span-2 text-right text-muted-foreground font-mono">{formatPrice(item.price)}</div>
                      <div className="col-span-2 text-right font-bold text-foreground font-mono">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary */}
                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground font-mono">{formatPrice(lastOrder.subtotal ?? 0)}</span>
                  </div>
                  {Number(lastOrder.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold font-mono">-{formatPrice(lastOrder.discount ?? 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-semibold text-foreground font-mono">{formatPrice(lastOrder.tax ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-3 border-t border-border font-bold">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-emerald-600 font-mono text-lg">{formatPrice(lastOrder.totalAmount ?? 0)}</span>
                  </div>
                </div>

                {/* Barcode & Policy */}
                <div className="mt-8 pt-6 border-t border-dashed border-border text-center space-y-2">
                  <div className="font-mono text-xs tracking-[0.3em] font-black opacity-60">
                    ||| | ||||| || |||||| | |||| |||
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{lastOrder.orderId}</p>
                  <p className="text-xs font-bold text-foreground pt-1">Thank You For Shopping At Luma Threads!</p>
                  <p className="text-[10px] text-muted-foreground">Exchanges accepted within 14 days with original bill.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 bg-muted flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 shrink-0 no-print border-t border-border">
                <button 
                  onClick={() => setShowInvoice(false)}
                  className="flex-1 min-w-[70px] py-3 bg-card border border-border text-foreground rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 min-w-[70px] py-3 bg-blue-500 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={15} />
                  Share
                </button>
                {lastOrder.paymentStatus === "unpaid" ? (
                  <>
                    <button 
                      onClick={handlePrint}
                      className="flex-1 min-w-[80px] py-3 bg-card border border-border text-foreground rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={15} />
                      Print Bill
                    </button>
                    <button 
                      onClick={handlePayUnpaidBill}
                      disabled={isProcessing}
                      className="flex-1 min-w-[90px] py-3 bg-emerald-500 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <CreditCard size={15} />
                      {isProcessing ? "Processing..." : "Pay Now"}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handlePrint}
                    className="flex-1 min-w-[90px] py-3 bg-emerald-500 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} />
                    Print Receipt
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Share Invoice</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={shareSearchQuery}
                    onChange={(e) => setShareSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                  {filteredShareCustomers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No customers found</p>
                  ) : (
                    filteredShareCustomers.map(customer => (
                      <button
                        key={customer.email}
                        onClick={() => handleShareInvoice(customer)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-foreground">{customer.name}</p>
                            <p className="text-[10px] text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-muted text-muted-foreground rounded-lg flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <MailIcon size={16} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 bg-muted">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 bg-card border border-border text-muted-foreground rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Customer Registration Modal */}
      <AnimatePresence>
        {showNewCustomerModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-border"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <UserPlus size={18} />
                  </div>
                  <h3 className="font-bold text-foreground">Register & Bill Customer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="p-5 space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-5678"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="124 Fashion Ave"
                      value={newCustomerForm.address}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerModal(false)}
                    className="flex-1 py-2.5 bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-accent transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCustomer}
                    className="flex-1 py-2.5 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingCustomer ? "Saving..." : "Save & Bill"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
);
};

export default POS;
