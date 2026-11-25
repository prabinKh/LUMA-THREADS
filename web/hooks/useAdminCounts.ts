import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/api/orderService";
import { productService } from "@/api/productService";
import { customerService } from "@/api/customerService";
import { useMemo } from "react";
import { type Order } from "@/types/order";

export interface AdminCounts {
  orders: Order[];
  totalOrders: number;
  newOrdersCount: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  shippedOrdersCount: number;
  deliveredOrdersCount: number;
  conformOrdersCount: number;
  cancelledOrdersCount: number;
  dontConformOrdersCount: number;
  attentionOrdersCount: number;
  productsCount: number;
  customersCount: number;
  recentOrders: Order[];
  loading: boolean;
  refetch: () => void;
}

export const useAdminCounts = (): AdminCounts => {
  // Poll orders every 4 seconds for live counter updates
  const { data: rawOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders-live"],
    queryFn: () => orderService.getAll(),
    refetchInterval: 4000,
    staleTime: 2000,
  });

  const { data: rawProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: () => productService.getAll(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: rawCustomers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["admin-customers-count"],
    queryFn: () => customerService.getAll(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const orders = useMemo(() => (Array.isArray(rawOrders) ? rawOrders : []), [rawOrders]);
  const products = useMemo(() => (Array.isArray(rawProducts) ? rawProducts : []), [rawProducts]);
  const customers = useMemo(() => (Array.isArray(rawCustomers) ? rawCustomers : []), [rawCustomers]);

  const totalOrders = orders.length;

  const newOrdersCount = useMemo(
    () => {
      const explicitNew = orders.filter((o) => o.status === "new").length;
      if (explicitNew > 0) return explicitNew;
      const activeIncoming = orders.filter((o) => ["new", "pending", "processing"].includes(o.status)).length;
      return activeIncoming > 0 ? activeIncoming : orders.length;
    },
    [orders]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );
  const processingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "processing").length,
    [orders]
  );
  const shippedOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "shipped").length,
    [orders]
  );
  const deliveredOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );
  const conformOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "process_conform").length,
    [orders]
  );
  const cancelledOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "cancelled").length,
    [orders]
  );
  const dontConformOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "process_dont_conform").length,
    [orders]
  );

  // Orders needing staff attention (new, pending, or processing)
  const attentionOrdersCount = useMemo(
    () => orders.filter((o) => ["new", "pending", "processing"].includes(o.status)).length,
    [orders]
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  return {
    orders,
    totalOrders,
    newOrdersCount,
    pendingOrdersCount,
    processingOrdersCount,
    shippedOrdersCount,
    deliveredOrdersCount,
    conformOrdersCount,
    cancelledOrdersCount,
    dontConformOrdersCount,
    attentionOrdersCount,
    productsCount: products.length,
    customersCount: customers.length,
    recentOrders,
    loading: ordersLoading || productsLoading || customersLoading,
    refetch: refetchOrders,
  };
};
