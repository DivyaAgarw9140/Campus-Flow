"use client"
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  // 1. Database se list mangwane ka function
  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(quantity, menu_items(name))')
      .neq('status', 'COLLECTED') 
      .order('created_at', { ascending: true });
    
    if (data) setOrders(data);
    if (error) console.error("Error fetching:", error);
  }

  // 2. Button dabane par jo kaam hoga (Database Update)
  async function updateStatus(orderId: string, newStatus: string) {
    console.log("Updating to:", newStatus);
let updateData:any={ status: newStatus};
if(newStatus==='PREPARING')
{
  updateData.prep_started_at=new Date().toISOString();
}
else if(newStatus ==='READY')
{
  updateData.prep_finished_at=new Date().toISOString();

}

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error("SUPABASE ERROR",error.message);
      alert("Error: " + error.message);
    } else {
      // Refresh list taaki card move ho jaye
      await fetchOrders(); 
     const msg= newStatus==='READY'?"STUDENT notified!":"Cooking started";
     alert(msg);
    }
  }

  useEffect(() => {
    fetchOrders();

    // Realtime connection (Automatic update)
    const channel = supabase.channel('staff-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-black mb-10 text-center">STAFF KDS DASHBOARD 👨‍🍳</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: PLACED -> PREPARING */}
        <OrderColumn 
          title="New Orders" 
          orders={orders.filter(o => o.status === 'PLACED')} 
          nextStatus="PREPARING"
          buttonText="Accept & Start Cooking"
          onAction={updateStatus}
          color="bg-orange-600"
        />

        {/* Column 2: PREPARING -> READY */}
        <OrderColumn 
          title="In Progress" 
          orders={orders.filter(o => o.status === 'PREPARING')} 
          nextStatus="READY"
          buttonText="Mark as Ready"
          onAction={updateStatus}
          color="bg-blue-600"
        />

        {/* Column 3: READY -> COLLECTED */}
        <OrderColumn 
          title="Ready for Pickup" 
          orders={orders.filter(o => o.status === 'READY')} 
          nextStatus="COLLECTED"
          buttonText="Confirm Collection ✅"
          onAction={updateStatus}
          color="bg-green-600"
        />
      </div>
    </main>
  );
}

// -----------------------------------------------------------
// YEH HAI WO BUTTON WALA HISSA (Don't delete this!)
// -----------------------------------------------------------
function OrderColumn({ title, orders, nextStatus, buttonText, onAction, color }: any) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700 min-h-[400px]">
      <h2 className="text-xl font-bold mb-6 text-center border-b border-slate-700 pb-2">
        {title} ({orders.length})
      </h2>
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-slate-800 p-5 rounded-2xl border-l-4 border-orange-500 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-3xl font-black text-white">#{order.token_number}</span>
              <span className="text-xs opacity-50 font-bold uppercase tracking-widest">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="mb-6">
              {order.order_items.map((item: any, i: number) => (
                <p key={i} className="text-lg font-bold text-slate-300">
                   {item.quantity}x {item.menu_items.name}
                </p>
              ))}
            </div>

            {/* 👇 YEH HAI WO ASLI BUTTON */}
            <button 
              onClick={() => {
                console.log("Button clicked!");
                onAction(order.id, nextStatus); // Yeh upar wale updateStatus ko call karta hai
              }}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase transition-all hover:brightness-110 active:scale-95 ${color} text-white shadow-lg`}
            >
              {buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}