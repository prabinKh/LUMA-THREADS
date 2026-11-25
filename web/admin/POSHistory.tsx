import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { type Order } from "@/types/admin";
import { orderService } from "@/api/orderService";
import { Package, Search, ChevronRight, Clock, CheckCircle2, Truck, XCircle, User, Mail, Phone, MapPin, Menu, ShoppingCart, Printer, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { safeToDate } from "@/lib/utils";

const POSHistory = () => {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen: (open: boolean) => void }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await orderService.getAll();
        // Only show POS orders
        const posOrders = (ordersData as (Order & { source?: string })[]).filter(order => 
          order.source === "pos" || 
          order.orderId?.startsWith("POS-") || 
          order.orderId?.startsWith("BILL-")
        );

        setOrders(posOrders);
      } catch (error) {
        console.error("Error fetching POS orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const collectPayment = async (orderId: string) => {
    setIsUpdatingPayment(true);
    try {
      await orderService.update(orderId, {
        paymentStatus: "paid",
        status: "delivered"
      });
      setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, paymentStatus: "paid", status: "delivered" } : o));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: "paid", status: "delivered" } : null);
      }
      toast.success("Payment collected! Marked as PAID.");
    } catch (error) {
      console.error("Error collecting payment:", error);
      toast.error("Failed to collect payment");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "shipped": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-accent text-foreground border-border";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "processing": return <Package size={14} />;
      case "shipped": return <Truck size={14} />;
      case "delivered": return <CheckCircle2 size={14} />;
      case "cancelled": return <XCircle size={14} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-full w-full pb-20 lg:pb-0">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
        <div className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">POS History</h1>
              <p className="text-muted-foreground">View and manage all POS transactions</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-card animate-pulse rounded-2xl border border-border" />
                ))
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                  <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-bold">No POS orders found</h3>
                  <p className="text-muted-foreground">Transactions from the POS terminal will appear here</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <motion.div
                    layoutId={order.id}
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 bg-card border rounded-2xl cursor-pointer transition-all hover:shadow-md group ${selectedOrder?.id === order.id ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                          <ShoppingCart size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">POS Order #{order.orderId || String(order.id).slice(-6).toUpperCase()}</h3>
                          <p className="text-xs text-muted-foreground">{(() => {
                            const date = safeToDate(order.createdAt);
                            return date ? format(date, "MMM dd, yyyy • HH:mm") : "Unknown";
                          })()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.paymentStatus === "paid" ? "PAID" : "UNPAID"}
                        </span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold">{formatPrice(order.totalAmount)}</span>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Order Details Panel */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {selectedOrder ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-card border border-border rounded-3xl p-6 sticky top-24 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-foreground">Order Details</h2>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <ChevronRight size={20} className="rotate-90 md:rotate-0" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Status Update */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Update Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(selectedOrder.id, status)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedOrder.status === status ? getStatusColor(status) : "bg-muted border-transparent hover:border-border"}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-accent" />

                      {/* Customer Info */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Customer Information</label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{selectedOrder.customerName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail size={12} />
                              {selectedOrder.customerEmail}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Phone size={14} className="text-muted-foreground mt-0.5" />
                            <span>{selectedOrder.shippingAddress.phone}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin size={14} className="text-muted-foreground mt-0.5" />
                            <span>{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-accent" />

                      {/* Items */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Order Items ({(selectedOrder.items || []).length})</label>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                          {(selectedOrder.items || []).map((item, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="w-12 h-12 bg-accent rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-foreground">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Status & Details */}
                      <div className="pt-4 border-t border-border mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-semibold">Payment Status:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            selectedOrder.paymentStatus === "paid" 
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}>
                            {selectedOrder.paymentStatus === "paid" ? "PAID" : "UNPAID"} ({selectedOrder.paymentMethod || "Cash"})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-foreground">Total Amount</span>
                          <span className="text-xl font-bold text-emerald-600 font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button 
                            onClick={() => setShowReceiptModal(true)}
                            className="py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Printer size={15} />
                            Print Bill
                          </button>
                          {selectedOrder.paymentStatus === "unpaid" ? (
                            <button 
                              onClick={() => collectPayment(selectedOrder.id)}
                              disabled={isUpdatingPayment}
                              className="py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              <CreditCard size={15} />
                              {isUpdatingPayment ? "Saving..." : "Pay Now"}
                            </button>
                          ) : (
                            <button 
                              onClick={() => setShowReceiptModal(true)}
                              className="py-2.5 bg-muted text-muted-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              View Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center sticky top-24">
                    <ShoppingCart size={48} className="mx-auto text-muted-foreground/50 mb-4 opacity-20" />
                    <p className="text-sm text-muted-foreground">Select a transaction to view details</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Receipt / Bill Modal for History */}
      <AnimatePresence>
        {showReceiptModal && selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-history-invoice, #printable-history-invoice * {
                  visibility: visible !important;
                }
                #printable-history-invoice {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 16px !important;
                  background: white !important;
                  color: black !important;
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
                    {selectedOrder.paymentStatus === "paid" ? "Tax Invoice / Receipt" : "Store Bill / Quotation"}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedOrder.paymentStatus === "paid" 
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {selectedOrder.paymentStatus === "paid" ? "PAID" : "UNPAID"}
                  </span>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-card text-foreground" id="printable-history-invoice">
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
                    <p className="font-bold text-foreground text-sm">{selectedOrder.customerName}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone || "In-store Walk-in"}
                    </p>
                    {selectedOrder.customerEmail && (
                      <p className="text-muted-foreground text-[11px] truncate">{selectedOrder.customerEmail}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice Info</p>
                    <p className="font-bold text-foreground font-mono text-sm">{selectedOrder.orderId}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {(() => {
                        const date = safeToDate(selectedOrder.createdAt);
                        return date ? format(date, "MMM dd, yyyy · hh:mm a") : format(new Date(), "MMM dd, yyyy · hh:mm a");
                      })()}
                    </p>
                    <p className="text-muted-foreground text-[11px] uppercase font-bold">
                      Pay Mode: {selectedOrder.paymentMethod || "Cash"}
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
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="grid grid-cols-12 text-xs py-1.5 border-b border-border/50 items-center">
                      <div className="col-span-6 font-medium text-foreground pr-2 truncate">
                        {item.name}
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
                    <span className="font-semibold text-foreground font-mono">{formatPrice(selectedOrder.subtotal ?? (selectedOrder.totalAmount * 0.9))}</span>
                  </div>
                  {Number(selectedOrder.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold font-mono">-{formatPrice(selectedOrder.discount ?? 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-semibold text-foreground font-mono">{formatPrice(selectedOrder.tax ?? (selectedOrder.totalAmount * 0.1))}</span>
                  </div>
                  <div className="flex justify-between text-base pt-3 border-t border-border font-bold">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-emerald-600 font-mono text-lg">{formatPrice(selectedOrder.totalAmount ?? 0)}</span>
                  </div>
                </div>

                {/* Barcode & Policy */}
                <div className="mt-8 pt-6 border-t border-dashed border-border text-center space-y-2">
                  <div className="font-mono text-xs tracking-[0.3em] font-black opacity-60">
                    ||| | ||||| || |||||| | |||| |||
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{selectedOrder.orderId}</p>
                  <p className="text-xs font-bold text-foreground pt-1">Thank You For Shopping At Luma Threads!</p>
                  <p className="text-[10px] text-muted-foreground">Exchanges accepted within 14 days with original bill.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 bg-muted flex gap-2 sm:gap-3 shrink-0 no-print border-t border-border">
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-3 bg-card border border-border text-foreground rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSHistory;
