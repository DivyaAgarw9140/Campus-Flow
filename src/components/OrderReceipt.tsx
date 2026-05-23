"use client"
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
export default function OrderReceipt({order}: {order : any})
{
    if(order.status !='Ready')
        return null;
    return (
        <div className="bg-white p-8 rounded-3xl shadow-3xl border-2 border-green-700 text-center-space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 text-green-700 py-2 rounded-full font-bold text-xs uppercase tracking-widest">
        Order Ready for Pickup
      </div>
    <h2 className="flex justify-center p-4 bg-white border-4 border-dashed border-gray-700"></h2>
        <QRCodeSVG
        value={`order_id :${order.id}`}
        size={200}
        fgColor="#16a34a"
        />
        
           <p className="text-sm text-gray-500 font-medium px-4">
        Show this QR code at the canteen counter to collect your meal.
      </p>
    </div>
    );
}