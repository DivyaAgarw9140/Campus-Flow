"use client" 
import React, { createContext, useContext, useState } from 'react';
import { supabase } from "../lib/supabase"; // ✅ FIX 1: Import added

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);

  // --- CART LOGIC ---
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + (item?.quantity || 0), 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item?.price * item.quantity || 0), 0);

  // --- 50 LPA BACKEND LOGIC (Moved inside the Provider) ---
  const handlePlaceOrder = async (userId: string) => {
    try {
      if (cart.length === 0) return alert("Tray is empty!");

      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          user_id: userId, 
          total_price: totalPrice, 
          status: 'PLACED',
          idempotency_key: crypto.randomUUID() 
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Add items to order_items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert("Order placed successfully! Token #" + order.token_number);
      clearCart(); // Auto clear tray after success
      return order;

    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      totalPrice, 
      totalItems, 
      clearCart,
      placeOrder: handlePlaceOrder // Exported for use in Checkout button
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);