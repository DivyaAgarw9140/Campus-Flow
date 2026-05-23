"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { processOrderAction } from "./action";
import {useState} from 'react';
export default function CheckoutPage() {
  const { cart, totalPrice, removeFromCart, addToCart ,clearCart} = useCart();
  // If cart is empty, show a nice message
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-2xl font-bold text-gray-800">Your tray is empty! 🥣</h2>
        <p className="text-gray-500 mb-6">Go back to the menu to add some delicious food.</p>
        <Link href="/" className="bg-orange-600 text-white px-6 py-2 rounded-lg">
          Back to Menu
        </Link>
      </div>
    );
  }

  // Inside your CheckoutPage component
const handleConfirm = async () => {
  const [loading,setloading]=useState(false);
  try{
  setloading(true);
  const itemtoProces= cart.map((item:any)=>({
    id:item.id,
quantity:item.quantity,

  }));

  // 1. Call the server action
  const result = await processOrderAction(cart, totalPrice);

  if (result.error) {
    alert(result.error);
  } else {
    // 2. Clear the cart
    clearCart();
    // 3. Go to success page with the token
    window.location.href = `/token?id=${result.orderId}&token=${result.token}`;
  }
}
  catch(error)
  {
    alert("Something went wrong");
  }
  finally
  {
    setloading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-orange-950 mb-8 mt-10">Review Your Order 📋</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: List of Items */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-500 text-sm">₹{item.price} x {item.quantity}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-700 text-lg">
                  ₹{item.price * item.quantity}
                </span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Bill Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-md border h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Convenience Fee</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-orange-900 border-t pt-2">
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          <button 
            onClick={(handleConfirm) => alert("Connecting to Phase 2: Secure Order Logic...")}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
          >
            Confirm & Generate Token 🚀
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            By clicking, you agree to skip the canteen queue and be awesome.
          </p>
        </div>

      </div>
    </div>
  );
}