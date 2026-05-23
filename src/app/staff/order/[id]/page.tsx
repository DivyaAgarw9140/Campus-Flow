"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COLLECTED";

interface OrderItem {
  id: string;
  quantity: number;
  menu_items: { name: string } | null;
}

interface Order {
  id: string;
  token_number: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  insideitems: OrderItem[];
}

// Raw shape Supabase returns before we cast it
interface RawOrder {
  id: string;
  token_number: number;
  status: string;
  total_price: number;
  created_at: string;
  insideitems: {
    id: string;
    quantity: number;
    menu_items: { name: string } | null;
  }[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:   "bg-yellow-50 border-yellow-200 text-yellow-700",
  PREPARING: "bg-blue-50 border-blue-200 text-blue-700",
  READY:     "bg-green-50 border-green-200 text-green-700",
  COLLECTED: "bg-gray-50 border-gray-200 text-gray-500",
};

const NEXT_STATUS: Record<string, OrderStatus> = {
  PENDING:   "PREPARING",
  PREPARING: "READY",
  READY:     "COLLECTED",
};

const NEXT_LABEL: Record<string, string> = {
  PENDING:   "Start Preparing",
  PREPARING: "Mark Ready",
  READY:     "Mark Collected",
};

const NEXT_BTN: Record<string, string> = {
  PENDING:   "bg-blue-500 hover:bg-blue-600",
  PREPARING: "bg-green-500 hover:bg-green-600",
  READY:     "bg-gray-500 hover:bg-gray-600",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function castOrder(raw: RawOrder): Order {
  return {
    ...raw,
    status: raw.status as OrderStatus,
    insideitems: raw.insideitems.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      menu_items: i.menu_items,
    })),
  };
}

export default function StaffOrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  async function fetchNewOrder(id: string) {
    const { data } = await supabase
      .from("orders")
      .select(`
        id, token_number, status, total_price, created_at,
        insideitems ( id, quantity, menu_items ( name ) )
      `)
      .eq("id", id)
      .single();
    if (data) setOrders((prev) => [...prev, castOrder(data as RawOrder)]);
  }

  // Fetch active orders
  useEffect(() => {
    async function fetchOrders() {
      const { data } = await supabase
        .from("orders")
        .select(`
          id, token_number, status, total_price, created_at,
          insideitems ( id, quantity, menu_items ( name ) )
        `)
        .in("status", ["PENDING", "PREPARING", "READY"])
        .order("created_at", { ascending: true });

      setOrders((data as RawOrder[] ?? []).map(castOrder));
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("staff-orders-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as RawOrder;
            if (updated.status === "COLLECTED") {
              setOrders((prev) => prev.filter((o) => o.id !== updated.id));
            } else {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === updated.id
                    ? { ...o, status: updated.status as OrderStatus }
                    : o
                )
              );
            }
          }
          if (payload.eventType === "INSERT") {
            fetchNewOrder(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdating(orderId);
    setOrders((prev) =>
      prev
        .map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        .filter((o) => o.status !== "COLLECTED")
    );
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    setUpdating(null);
  }

  const filtered = filter === "ALL"
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts = {
    PENDING:   orders.filter((o) => o.status === "PENDING").length,
    PREPARING: orders.filter((o) => o.status === "PREPARING").length,
    READY:     orders.filter((o) => o.status === "READY").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Active Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} orders in queue</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(["PENDING", "PREPARING", "READY"] as OrderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "ALL" : s)}
              className={`rounded-xl p-4 text-left border transition-all ${
                filter === s
                  ? STATUS_COLORS[s] + " border-2"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
              <p className="text-sm text-gray-500 capitalize">{s.toLowerCase()}</p>
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">✅</span>
            <p className="text-gray-500 font-medium">All clear! No active orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 ${
                  order.status === "READY"
                    ? "border-green-300 shadow-md"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-500">
                      #{order.token_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {order.insideitems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600
                                       text-xs font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <span className="text-gray-700">{item.menu_items?.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{order.total_price}
                  </span>
                </div>

                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                    disabled={updating === order.id}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white
                                transition-all active:scale-[0.98]
                                disabled:opacity-60 disabled:cursor-not-allowed
                                ${NEXT_BTN[order.status]}`}
                  >
                    {updating === order.id ? "Updating…" : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}