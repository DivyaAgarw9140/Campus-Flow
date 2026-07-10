import { supabase } from '@/utils/supabase/client' // Absolute path use karo

// 1. Environment variable se URL uthao
const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

export const getAIInsights = async () => {
  try {
    // 2. YAHAN MISTAKE THI: Localhost hata kar API_BASE use karo
    // Backticks (`) use karna zaroori hai
    const response = await fetch(`${API_BASE}/predict-wait-time?price=70`);
    
    if (!response.ok) throw new Error("AI Engine unreachable");

    const data = await response.json();

    return {
      waitTime: data.estimated_minutes, 
      trend: data.estimated_minutes > 10 ? 'HIGH' : 'STABLE',
      queueLength: 3 
    };
  } catch (e) {
    console.error("Fetch Error:", e);
    // FALLBACK: Agar API down ho toh UI crash na ho
    return {
      waitTime: 5,
      trend: 'STABLE',
      queueLength: 0
    };
  }
}