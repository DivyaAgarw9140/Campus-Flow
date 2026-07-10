import { supabase } from '@/utils/supabase/client'

// 1. Environment variable se URL uthao (Vercel ke liye)
const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

export const getInventoryForecast = async () => {
  try {
    // 2. Localhost hata kar API_BASE use karo
    const response = await fetch(`${API_BASE}/forecast-demand?item_id=1`);
    
    if (!response.ok) throw new Error("Forecast engine unreachable");

    const data = await response.json();

    return [{
      name: data.item_name,
      currentDailySales: 30, // Mock data
      suggestedStock: data.predicted_demand_next_hour,
      wastageSaved: 15 // Mock data
    }];
  } catch (e) {
    console.error("Forecast Fetch Error:", e);
    return [];
  }
}