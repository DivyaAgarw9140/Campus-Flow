import { supabase } from '../utils/supabase/client'
export const getAIInsights = async () => {
  const response = await fetch('http://localhost:8000/predict-wait-time?price=70');
  const data = await response.json();
  return {
    waitTime: data.estimated_minutes, // Yeh ab Python se aayega
    trend: data.estimated_minutes > 10 ? 'HIGH' : 'STABLE',
    queueLength: 3 
  };
}