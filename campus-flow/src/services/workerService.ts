import { supabase } from '@/utils/supabase/client'

export const processNextOrder = async () => {
  // 1. Sabse purana 'QUEUED' order uthao (FIFO - First In First Out)
  const { data: nextOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'QUEUED')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!nextOrder || fetchError) return null;

  console.log(`[WORKER]: Processing Order ${nextOrder.id}...`);

  // 2. Status change to PREPARING (Pillar 1: Orchestration)
  await supabase
    .from('orders')
    .update({ status: 'PREPARING' })
    .eq('id', nextOrder.id);

  // 3. Simulate cooking time (e.g., 5 seconds)
  setTimeout(async () => {
    await supabase
      .from('orders')
      .update({ status: 'READY' })
      .eq('id', nextOrder.id);
    console.log(`[WORKER]: Order ${nextOrder.id} is READY!`);
  }, 5000);

  return nextOrder;
}