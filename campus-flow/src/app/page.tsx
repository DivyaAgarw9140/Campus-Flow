'use client'

import Link from 'next/link'
import { getAIInsights } from '../services/predictionService'
import { placeOrder } from '../services/orderService'
import { getFoodRecommendation } from '../services/aiServices' // Naya Import
import { supabase } from '../utils/supabase/client'
import { useState, useEffect } from 'react'

export default function StudentHome() {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [myOrder, setMyOrder] = useState<any>(null)
  
  // AI States
  const [query, setQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  useEffect(() => {
    getAIInsights().then(setInsights)
    const channel = supabase.channel('live-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, 
      (payload) => { setMyOrder(payload.new) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

 const handleAISearch = async () => {
  setLoading(true);
  try {
    const suggestion = await getFoodRecommendation(query, insights?.waitTime || 0);
    setAiResponse(suggestion);
  } catch (error) {
    console.error("AI Search Failed");
  } finally {
    // YEH LINE TYPING UNLOCK KAR DEGI CHAHE ERROR AAYE YA NAHI
    setLoading(false); 
  }
};
  const handleOrder = async (foodName: string, price: number) => {
    console.log("Button clicked for:",foodName);
    setLoading(true)
    try {
      const result = await placeOrder("STUDENT_101", [{ name: foodName, qty: 1 }], price)
       console.log("Order Result from DB:", result); 
      alert(`✅ ${foodName} ordered!`);
    }
     catch (error:any)
     { console.error("Critical error durinf order",error.message||error);
       alert("❌ Order failed") }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-white pb-10">
      <nav className="p-6 flex justify-between items-center border-b">
        <h1 className="text-2xl font-black text-orange-600 tracking-tighter">CAMPUSFLOW</h1>
        <Link href="/admin" className="text-xs font-bold text-gray-400 hover:text-orange-500">STAFF LOGIN →</Link>
      </nav>

      <div className="max-w-md mx-auto pt-8 px-6">
        
        {/* AI SMART SEARCH (Pillar 2) */}
        <div className="mb-8">
          <div className="flex gap-2 p-2 bg-gray-100 rounded-3xl border-2 border-transparent focus-within:border-orange-500 transition-all">
            <input 
              type="text" 
              placeholder="Feeling tired? Ask AI..." 
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleAISearch} className="bg-orange-500 text-white px-5 py-2 rounded-2xl font-bold text-xs uppercase">Ask AI</button>
          </div>
          {aiResponse && (
            <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-100 rounded-2xl animate-in slide-in-from-top-2">
              <p className="text-[10px] font-black text-purple-600 uppercase mb-1">AI Recommendation</p>
              <p className="text-gray-700 text-sm italic leading-relaxed">"{aiResponse}"</p>
            </div>
          )}
        </div>

        {/* LIVE TRACKER */}
        {myOrder && (
          <div className="mb-8 p-6 bg-gray-900 rounded-[32px] shadow-2xl border-b-4 border-orange-500">
            <h3 className="text-white text-2xl font-black italic uppercase">
              {myOrder.status === 'QUEUED' ? 'Waiting in Line...' : 
               myOrder.status === 'PREPARING' ? 'Cooking Now 👨‍🍳' : 'Ready for Pickup! 🍕'}
            </h3>
          </div>
        )}

        <div className="bg-orange-50 p-8 rounded-[40px] text-center border-2 border-orange-100">
          <h2 className="text-gray-500 uppercase tracking-widest text-[10px] font-bold mb-2">Live Queue Wait-Time</h2>
          <p className="text-7xl font-black text-orange-600">{insights?.waitTime || '--'}</p>
          <p className="text-lg font-bold text-orange-600 -mt-2 uppercase">Minutes</p>
        </div>

        <div className="mt-10 space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 italic">Quick Cravings 😋</h3>
          <div className="grid gap-4">
            <button onClick={() => handleOrder("Samosa", 15)} disabled={loading} className="group flex justify-between items-center p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-orange-500 transition-all">
              <div className="text-left">
                <h4 className="font-bold text-gray-800 text-lg">Crispy Samosa</h4>
                <p className="text-gray-500 text-sm">₹15 • Freshly fried</p>
              </div>
              <span className="bg-white p-3 rounded-full shadow-sm text-xl">＋</span>
            </button>
            <button onClick={() => handleOrder("Cold Coffee", 40)} disabled={loading} className="group flex justify-between items-center p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-orange-500 transition-all">
              <div className="text-left">
                <h4 className="font-bold text-gray-800 text-lg">Cold Coffee</h4>
                <p className="text-gray-500 text-sm">₹40 • Caffeine kick</p>
              </div>
              <span className="bg-white p-3 rounded-full shadow-sm text-xl">＋</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}