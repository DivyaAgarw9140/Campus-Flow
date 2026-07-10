"use server"
import { createClient } from "@/utils/supabase/server";

export async function processOrderAction(cart: any[], total: number) {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login required to order." };

  // 2. Call the SQL Function (RPC)
  const { data, error } = await supabase.rpc('place_campus_order', {
    p_user_id: user.id,
    p_total_price: total,
    p_items: cart 
  });

  if (error) return { error: error.message };

  return { 
    success: true, 
    orderId: data[0].o_order_id, 
    token: data[0].o_token_number 
  };
}

