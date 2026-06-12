"use client"
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

 function TokenPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [status, setStatus] = useState("PENDING");
  const supabase = createClient();

  useEffect(() => {
    if (!orderId) return;

    // 1. Listen for status updates in real-time
    const channel = supabase
      .channel('order-status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, 
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-700 ${status === 'READY' ? 'bg-green-50' : 'bg-orange-50'}`}>
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm text-center border-t-8 border-orange-600">
        <h1 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-widest">
           {status === 'READY' ? '🎉 Ready for Pickup!' : '⏳ Preparing Order'}
        </h1>
        
        {/* The Card turns green when Ready */}
        <div className={`${status === 'READY' ? 'bg-green-600' : 'bg-orange-600'} py-10 rounded-3xl mb-8 transition-colors duration-500 shadow-xl`}>
           <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Token Number</p>
           <h2 className="text-8xl font-black text-white tracking-tighter">#{searchParams.get('token')}</h2>
        </div>

        {status === 'READY' && (
          <p className="text-green-600 font-black animate-pulse mb-6 uppercase tracking-tight">🔥 Go to the counter now!</p>
        )}
        
        {/* Keep your QR code here too */}
      </div>
    </div>
  );
}
export default function TokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TokenPageContent />
    </Suspense>
  );
}