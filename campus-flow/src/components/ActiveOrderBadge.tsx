"use client"
import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

// 1. Define strict types (Recruiters love this)
interface Order {
  id: string;
  token_number: number;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COLLECTED';
  user_id: string;
}

export default function ActiveOrderBadge() {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    async function initializeRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch existing active order
      const { data } = await supabase
        .from('orders')
        .select('*')
        // .eq('user_id', user.id)
        .neq('status', 'COLLECTED')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) setActiveOrder(data);

      // 2. 50 LPA Logic: Filtered Real-time Subscription
      // We only listen to changes where user_id matches the logged-in user
      channel = supabase
        .channel(`'order-updates-global`)
        .on(
          'postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${user.id}` // SECURITY: Only listen to MY orders
          }, 
          (payload) => {
            const updatedOrder = payload.new as Order;
            if (updatedOrder.status === 'COLLECTED') {
              setActiveOrder(null); // Remove badge if collected
            } else {
              setActiveOrder(updatedOrder);
            }
          }
        )
        .subscribe();
    }

    initializeRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (!activeOrder) return null;

  const isReady = activeOrder.status === 'READY';

  return (
    <div className={`fixed bottom-6 right-6 p-5 rounded-3xl shadow-2xl border-2 flex items-center gap-4 transition-all duration-500 transform hover:scale-105 z-50 ${
      isReady 
      ? 'bg-green-600 border-green-400 animate-bounce' 
      : 'bg-orange-900 border-orange-700 shadow-orange-200'
    }`}>
      <div className={`p-2 rounded-xl ${isReady ? 'bg-green-400/30' : 'bg-orange-800/50'}`}>
         {isReady ? '🔥' : '⏳'}
      </div>
      <div className="text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
          Token #{activeOrder.token_number}
        </p>
        <p className="font-bold text-sm">
            {isReady ? "READY: Pick it up!" : "Kitchen: " + activeOrder.status}
        </p>
      </div>
    </div>
  );
}