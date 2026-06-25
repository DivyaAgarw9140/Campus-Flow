'use client'

import { placeOrder } from '@/services/orderService'
import { getAIInsights } from '@/services/predictionService'
import { processNextOrder } from '@/services/workerService'
import { getOptimizedBatches } from '@/services/optimizationServices'
import { getInventoryForecast } from '@/services/demandServices'// Naya Import
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [forecast, setForecast] = useState<any[]>([]) // Pillar 2 state

  const refreshSystemMetrics = async () => {
    // 1. Live Wait-time & Trend
    const data = await getAIInsights();
    setInsights(data);
    
    // 2. Batch Optimization (Pillar 3)
    const batchData = await getOptimizedBatches();
    setBatches(batchData);

    // 3. ML Demand Forecasting (Pillar 2)
    const forecastData = await getInventoryForecast();
    setForecast(forecastData || []);
  }

  useEffect(() => {
    refreshSystemMetrics();
  }, []);

  const handleWorkerStart = async () => {
    setLoading(true);
    try {
      await processNextOrder();
      // Delay to allow DB state transition
      setTimeout(() => refreshSystemMetrics(), 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleTestOrder = async () => {
    setLoading(true)
    try {
      // Samosa order inject for simulation
      await placeOrder("STUDENT_ID_101", [{ name: "Samosa", qty: 1 }], 15)
      refreshSystemMetrics();
    } catch (error) {
      alert(error instanceof Error ? error.message : "System Error");
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 pb-20">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-orange-600 tracking-tighter uppercase italic">Control Center</h1>
          <p className="text-gray-500 mt-2 font-sans tracking-widest text-[10px] font-bold uppercase">Admin Orchestration & Supply Chain Intelligence</p>
        </div>

        {/* ROW 1: AI METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="p-8 bg-white rounded-[40px] border-2 border-blue-100 shadow-xl">
            <h3 className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mb-1">AI Wait-Time Prediction</h3>
            <p className="text-5xl font-black text-gray-800">{insights?.waitTime || '0'} <span className="text-lg font-normal text-gray-400 italic">mins</span></p>
            <div className="w-full bg-gray-100 h-3 rounded-full mt-6 overflow-hidden">
               <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${Math.min((insights?.queueLength || 0) * 15, 100)}%`}}></div>
            </div>
          </div>
          
          <div className="p-8 bg-white rounded-[40px] border-2 border-purple-100 shadow-xl">
            <h3 className="text-purple-600 font-bold uppercase text-[10px] tracking-widest mb-1">Demand Trend</h3>
            <p className="text-5xl font-black text-gray-800">{insights?.trend || 'STABLE'}</p>
            <p className="text-xs text-gray-400 mt-6 font-sans text-[10px]">Queue Density: <span className="text-purple-600 font-bold">{insights?.queueLength || 0} tasks</span></p>
          </div>
        </div>

        {/* ROW 2: PILLAR 2 - INVENTORY FORECASTING (The ML Section) */}
        <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-[40px] shadow-2xl text-white border-b-8 border-indigo-500">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-indigo-400 font-sans">📊 Demand Forecasting</h3>
              <p className="text-[8px] font-bold text-indigo-300 tracking-[0.3em]">ML_MODEL: RANDOM_FOREST_V2</p>
            </div>
            <div className="bg-green-500/20 text-green-400 text-[9px] font-black px-3 py-1 rounded-full border border-green-500/50">Wastage Saved: 22%</div>
          </div>

          <div className="grid gap-4">
            {forecast.length > 0 ? forecast.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                <div>
                  <p className="text-xl font-black tracking-tight">{item.name}</p>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase">Daily Avg: {item.currentDailySales} units</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-black text-[10px] uppercase tracking-widest mb-1">Target Stock</p>
                  <p className="text-3xl font-black">{item.suggestedStock}</p>
                </div>
              </div>
            )) : (
              <div className="py-6 text-center">
                <p className="text-indigo-300 text-xs animate-pulse uppercase font-bold tracking-widest">Running Predictive Analytics...</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: PILLAR 3 - OPTIMIZATION ENGINE */}
        <div className="w-full max-w-2xl bg-white p-8 rounded-[40px] border-4 border-dashed border-green-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black text-gray-800 uppercase italic font-sans">⚡ Optimization Engine</h3>
             <span className="text-[9px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Batching Active</span>
          </div>
          <div className="grid gap-3">
            {batches.map((batch: any, index) => (
              <div key={index} className="flex justify-between items-center p-5 bg-gray-50 rounded-3xl border-2 border-gray-100">
                <div>
                  <p className="text-lg font-black text-gray-800">{batch.itemName} <span className="text-green-500 text-sm">x{batch.totalQty}</span></p>
                  <p className="text-[8px] text-gray-400 font-mono mt-1 uppercase">Order_Cluster_IDs: {batch.orderIds.join(', ')}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-orange-500 uppercase">Throughput: +35%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
          <button onClick={handleWorkerStart} disabled={loading} className="flex-1 px-8 py-6 bg-green-600 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 uppercase italic">
            {loading ? 'Processing...' : '⚙️ Orchestrate'}
          </button>
          <button onClick={handleTestOrder} disabled={loading} className="flex-1 px-8 py-6 bg-gray-900 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 uppercase italic">
            ➕ Inject Task
          </button>
        </div>

        <button onClick={refreshSystemMetrics} className="text-orange-600 font-bold text-[10px] tracking-[0.4em] uppercase hover:underline">
          🔄 Sync Live Cluster Metrics
        </button>

        {/* LOGS */}
        <div className="mt-4 p-6 bg-gray-900 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
          <p className="text-green-400 text-[10px] font-mono leading-relaxed">
            [SYS_LOG]: ORCHESTRATOR_ID: node-cf-01_active<br/>
            [SYS_LOG]: ML_ENGINE: Status_Stable<br/>
            [SYS_LOG]: INVENTORY_LOCKS: Enabled (Pillar_4)<br/>
            <span className="animate-pulse">_</span>
          </p>
        </div>
      </div>
    </main>
  )
}