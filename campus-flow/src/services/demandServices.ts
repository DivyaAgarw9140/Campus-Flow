import { supabase } from '@/utils/supabase/client'
export const getInventoryForecast = async () => {
  try {
    // Samosa (ID: 1) ke liye forecast mang rahe hain
    const response = await fetch('http://localhost:8000/forecast-demand?item_id=1');
    const data = await response.json();

    return [{
      name: data.item_name,
      currentDailySales: 30, // Mock data
      suggestedStock: data.predicted_demand_next_hour,
      wastageSaved: 15 // Mock data
    }];
  } catch (e) {
    return [];
  }
}