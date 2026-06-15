import { supabase } from "../lib/supabase"; 
import { MenuItem } from "../types";        
import AddToTrayButton from "../components/AddToTrayButton";
import ActiveOrderBadge from "../components/ActiveOrderBadge"; 
import Cart from "../components/Cart";
import Link from "next/link";

export default async function HomePage() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order('category');

  if (error) {
    return <div className="p-20 text-center text-red-500">Failed to load menu. Please refresh.</div>;
  }

  const menuItems: MenuItem[] = data || [];
  
  // Amazon SDE Logic: Helper function for ETA
  const waitTime = 16.5;
  const getFriendlyMessage = (time: number) => {
    if (time <= 5) return "Ready almost instantly!";
    if (time <= 10) return `Pick up in about ${Math.round(time)} mins`;
    return `Busy kitchen: Ready in ~${Math.round(time)} mins`;
  };

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen max-w-7xl mx-auto pb-32">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-orange-900 tracking-tight italic">Campus Flow</h1>
          <p className="text-orange-700/60 font-medium">Canteen in your pocket</p>
        </div>
        <ActiveOrderBadge /> 
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <div key={item.id} className="group bg-white p-2 rounded-3xl shadow-sm border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 w-full mb-4 overflow-hidden rounded-2xl">
                <img 
                  src={item.image_url || "/placeholder-food.jpg"} 
                  alt={item.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            
            <div className="px-3 pb-3">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                <span className="bg-orange-100 text-orange-700 text-sm px-2 py-1 rounded-lg font-bold">
                   ₹{item.price}
                </span>
              </div>

              {/* 🤖 AI PREDICTION BADGE */}
              <div className="mt-1 mb-4 p-3 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-tighter">
                    AI Live Estimate
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {getFriendlyMessage(waitTime)}
                </p>
              </div>

              <AddToTrayButton item={item} />
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Cart ko yahan rakha hai taaki sidebar sahi se khule */}
      <Cart />
    </main>
  );
}