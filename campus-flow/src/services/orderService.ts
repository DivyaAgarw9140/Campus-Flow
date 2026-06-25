import { supabase } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'; // Iske liye 'npm install uuid' karna hoga

export const placeOrder = async (studentId: string, items: any[], totalPrice: number) => {
  const idempotencyKey = uuidv4(); // Unique key for this attempt

  // Call the Atomic Lock function in DB
  const { data, error } = await supabase.rpc('place_order_with_lock', {
    p_student_id: studentId,
    p_items: items,
    p_total_price: totalPrice,
    p_idempotency_key: idempotencyKey
  });

  if (error || !data.success) {
    throw new Error(data?.message || error?.message);
  }

  return data;
}