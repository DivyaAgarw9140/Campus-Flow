"use server"
import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error("Update Order Error:", error.message);
    return { error: error.message };
  }
revalidatePath('/staff');
  return { success: true };
}

/** 
 * FUNCTION 2: Toggles Menu Item Availability 
 * (Marking a Samosa as Sold Out)
 */


export async function toggleItemAvailability(itemId: string, currentState: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: !currentState })
    .eq('id', itemId);

  if (error) 
  {
    console.log("updte",error.message);
  return { error: error.message };
}
  revalidatePath('/staff');
  revalidatePath('/'); // Refresh student home page too
  return { success: true };
}