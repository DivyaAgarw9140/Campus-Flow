"use client"
import { useEffect, useState } from "react";
// import { createClient } from "@/utils/supabase/client";
import {supabase} from "@/utils/supabase/client";
import { updateOrderStatus, toggleItemAvailability } from "./action";
import ActiveOrderBadge from "@/components/ActiveOrderBadge";

export default function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  // const supabase = createClient();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`*, order_items (quantity, menu_items (name))`)
      .neq('status', 'COLLECTED')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('name');
    if (data) setMenuItems(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();

    const channel = supabase
      .channel('realtime-staff')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchMenu())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ANALYTICS LOGIC (The God-Level Touch)
  const todayRevenue = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
const handleToggleStock = async (itemId: string, currentState: boolean) => {
  // 1. OPTIMISTIC UPDATE: Change the UI immediately before the database responds
  // This makes the app feel "God-Level" fast
  setMenuItems((prev) =>
    prev.map((item) =>
      item.id === itemId ? { ...item, is_available: !currentState } : item
    )
  );

  // 2. Call the backend to save the change
  const result = await toggleItemAvailability(itemId, currentState);

  if (result.error) {
    // 3. ROLLBACK: If the database fails, switch it back and alert the user
    alert("Error updating stock: " + result.error);
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_available: currentState } : item
      )
    );
  }
};
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Canteen Command Center 👩‍🍳</h1>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border flex items-center gap-4">
           <span className="text-xs font-bold text-gray-400">TODAY'S REVENUE</span>
           <span className="text-xl font-black text-green-600">₹{todayRevenue}</span>
        </div>
      </div>

      {/* SECTION: LIVE ORDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {orders.map((order) => (
          <div key={order.id} className={`p-6 rounded-3xl border-2 shadow-sm transition-all bg-white ${order.status === 'READY' ? 'border-green-500' : 'border-transparent'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-5xl font-black text-orange-600">#{order.token_number}</h2>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{order.status}</span>
            </div>
            <div className="border-y py-4 my-4 border-gray-100">
              {order.order_items?.map((item: any, idx: number) => (
                <p key={idx} className="text-gray-700 font-medium">{item.quantity}x {item.menu_items?.name}</p>
              ))}
            </div>
            <div className="flex gap-2">
              {order.status === 'PENDING' && <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="flex-1 bg-orange-100 text-orange-700 py-3 rounded-xl font-bold">Start Cooking</button>}
              {order.status === 'PREPARING' && <button onClick={() => updateOrderStatus(order.id, 'READY')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Mark Ready</button>}
              {order.status === 'READY' && <button onClick={() => updateOrderStatus(order.id, 'COLLECTED')} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold">Collected</button>}
            </div>
          </div>
        
        ))}
      </div>
 <ActiveOrderBadge/>
      {/* SECTION: INVENTORY */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-6">Inventory Management 📦</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-2xl flex flex-col gap-4">
              <p className="font-bold">{item.name}</p>
            
              <button onClick={() => handleToggleStock(item.id, item.is_available)} className={`py-2 rounded-xl text-xs font-bold ${item.is_available ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {item.is_available ? "Mark Sold Out" : "Mark Available"}
              </button>
            </div>
           
          ))}
        </div>
      </div>
    </div>
  );
}