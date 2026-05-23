"use client"
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase"; // Database se user check karne ke liye
import {useRouter} from "next/navigation";

export default function Cart() {
  const router=useRouter();
  const { cart, totalPrice, totalItems, removeFromCart, placeOrder, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. Get the current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  if (totalItems === 0) return null;

const handleCheckout = async () => {
    // 1. Pehle state check karo
    setLoading(true);
    
    try {
      // 2. State par bharosa mat karo, seedha Supabase se session mango
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        console.log("Auth Error:", authError);
        alert("Bhai, session nahi mila! Ek baar Logout karke Login karo.");
        router.push("/login");
        setLoading(false); // <--- Yahan band karna zaroori hai
        return;
      }

      // 3. Agar user mil gaya, toh order place karo
      console.log("User found! ID:", session.user.id);
      
      const result = await placeOrder(session.user.id);
      
      if (result) {
        alert("Mubarak ho! Order ho gaya.");
        clearCart();
      }

    } catch (err: any) {
      console.error("Checkout crash:", err);
      alert("System crash: " + err.message);
    } finally {
      // 4. Chahe success ho ya fail, button ko vapas normal karo
      setLoading(false);
    }
  };
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 bg-white shadow-2xl border-t md:border-l border-orange-100 h-[70vh] md:h-screen z-50 flex flex-col transition-all">
      <div className="p-6 border-b flex justify-between items-center bg-orange-50">
        <h2 className="text-2xl font-black text-orange-900 italic underline decoration-orange-300">Your Tray 🛒</h2>
        <button onClick={clearCart} className="text-xs font-bold text-orange-600 hover:text-red-600 uppercase tracking-tighter">
          Clear Tray
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50">
        {cart.map((item: any) => (
          <div key={item.id} className="group flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-orange-200 transition-all">
            <div>
              <p className="font-bold text-gray-800 group-hover:text-orange-900">{item.name}</p>
              <p className="text-sm text-gray-500 font-medium">₹{item.price} × {item.quantity}</p>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)} 
              className="text-gray-300 hover:text-red-500 transition-colors p-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      <div className="p-6 bg-white border-t-2 border-orange-50 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Amount</span>
          <span className="text-3xl font-black text-orange-600">₹{totalPrice}</span>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
            ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'}
          `}
        >
          {loading ? (
            <>
              <span className="animate-spin text-2xl">⏳</span> Processing...
            </>
          ) : (
            "Confirm Order & Pay"
          )}
        </button>
        
        {!user && (
           <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-tight">
             Login Required to Place Order
           </p>
        )}
      </div>
    </div>
  );
}