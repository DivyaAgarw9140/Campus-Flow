import { supabase } from '@/utils/supabase/client'
import { Redis } from '@upstash/redis'

// 1. Initialize Redis (Ensure keys are in .env.local and Vercel)
const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN!,
})

const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

export const getAIInsights = async () => {
  try {
    // 2. PILLAR 3: CHECK CACHE FIRST (The Speed Move)
    const cachedData: any = await redis.get('wait_time_cache');
    if (cachedData) {
      console.log("⚡ [REDIS] Cache Hit: Serving Instant Data");
      // JSON parse agar string hai, varna object return karo
      return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }

    // 3. CACHE MISS: Call FastAPI (Python ML Engine)
    console.log("🐢 [REDIS] Cache Miss: Fetching from Python ML Engine...");
    const response = await fetch(`${API_BASE}/predict-wait-time?price=70`);
    
    if (!response.ok) throw new Error("AI Engine unreachable");
    const data = await response.json();

    const result = {
      waitTime: data.estimated_minutes, 
      trend: data.estimated_minutes > 10 ? 'HIGH' : 'STABLE',
      queueLength: 3 
    };

    // 4. SAVE TO REDIS: Keep data for 30 seconds
    await redis.set('wait_time_cache', JSON.stringify(result), { ex: 30 });

    return result;

  } catch (e) {
    console.error("System Error:", e);
    // FALLBACK
    return { waitTime: 5, trend: 'STABLE', queueLength: 0 };
  }
}