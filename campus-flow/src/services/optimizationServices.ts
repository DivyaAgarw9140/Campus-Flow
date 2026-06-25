import { supabase } from '@/utils/supabase/client'

export const getOptimizedBatches = async () => {
  // 1. Saare 'QUEUED' orders uthao
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'QUEUED');

  if (!orders || orders.length === 0) return [];

  // 2. BATCHING ALGORITHM (Pillar 3: Algorithmic Rigor)
  // Hum orders ko 'food items' ke basis par group karenge
  const batches: any = {};

  orders.forEach(order => {
    order.items.forEach((item: any) => {
      if (!batches[item.name]) {
        batches[item.name] = {
          itemName: item.name,
          totalQty: 0,
          orderIds: []
        };
      }
      batches[item.name].totalQty += item.qty;
      batches[item.name].orderIds.push(order.id.slice(0, 5)); // Short ID
    });
  });

  // 3. Convert object to array for UI
  return Object.values(batches);
}