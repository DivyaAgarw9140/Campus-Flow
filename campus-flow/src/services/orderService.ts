import { supabase } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid';

export const placeOrder = async (studentId: string, items: any[], totalPrice: number) => {
  const { data, error } = await supabase.rpc('place_order_with_lock', {
    p_student_id: studentId,
    p_items: items,
    p_total_price: totalPrice,
    p_idempotency_key: uuidv4() // Har baar naya UUID
  });

  if (error || (data && !data.success)) {
    throw new Error(data?.message || error?.message || "Unknown DB Error");
  }
  return data;
}