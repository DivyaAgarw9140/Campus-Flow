"use client"; // Critical: Buttons need client-side JS

import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types";
import { placeOrderAction } from "@/app/actions/placeOrder";
export default function AddToTrayButton({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();

  return (
    <button
      disabled={!item.is_available}
      onClick={() => addToCart(item)}
      className="mt-4 w-full bg-orange-100 text-orange-700 font-bold py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-all disabled:bg-gray-100 disabled:text-gray-400"
    >
      {item.is_available ? "Add to Tray +" : "Out of Stock"}
    </button>
  );
}