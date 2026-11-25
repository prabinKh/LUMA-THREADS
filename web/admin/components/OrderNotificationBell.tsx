import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ShoppingBag, ArrowRight, Clock, Package, CheckCircle2, ChevronRight, Truck } from "lucide-react";
import { useAdminCounts } from "@/hooks/useAdminCounts";
import { formatPrice, safeToDate } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export const OrderNotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    attentionOrdersCount,
    totalOrders,
    recentOrders,
    newOrdersCount,
    pendingOrdersCount,
    processingOrdersCount,
  } = useAdminCounts();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "processing":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "delivered":
      case "process_conform":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-colors focus:outline-none"
        aria-label="Order notifications"
      >
        <Bell size={20} />
        {attentionOrdersCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm animate-pulse">
            {attentionOrdersCount > 9 ? "9+" : attentionOrdersCount}
          </span>
        ) : totalOrders > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-sm">
            {totalOrders > 99 ? "99+" : totalOrders}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Notification Header */}
            <div className="p-4 border-b border-border bg-accent/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-500" />
                <h4 className="font-bold text-sm text-foreground">Order Activity</h4>
              </div>
              <div className="flex items-center gap-1.5">
                {attentionOrdersCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {attentionOrdersCount} Action Needed
                  </span>
                )}
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {totalOrders} Total
                </span>
              </div>
            </div>

            {/* Quick Status Pill Bar */}
            <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-muted/20 border-b border-border text-center text-xs">
              <Link
                to="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>New</span>
                <span className="font-bold">({newOrdersCount})</span>
              </Link>
              <Link
                to="/admin/orders/processing"
                onClick={() => setIsOpen(false)}
                className="py-1 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Processing</span>
                <span className="font-bold">({processingOrdersCount})</span>
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>All</span>
                <span className="font-bold">({totalOrders})</span>
              </Link>
            </div>

            {/* Order Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border custom-scrollbar">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No orders recorded yet</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const date = safeToDate(order.createdAt);
                  return (
                    <Link
                      key={order.id}
                      to="/admin/orders"
                      onClick={() => setIsOpen(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-accent/60 transition-colors group block"
                    >
                      <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-emerald-500 transition-colors">
                        <Package size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-xs text-foreground truncate">
                            #{String(order.id).slice(-6).toUpperCase()} · {order.customerName}
                          </span>
                          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate">
                            {order.items?.length || 1} item{order.items?.length === 1 ? "" : "s"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                            <span>{date ? format(date, "HH:mm") : ""}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer View All */}
            <div className="p-3 border-t border-border bg-accent/20">
              <Link
                to="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open Order Manager</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotificationBell;
