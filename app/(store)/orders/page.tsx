"use server"
import { formatCurrency } from "@/lib/formateCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";

interface SanityProduct {
  _id: string;
  _type: "product";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  product?: string;
  price?: number;
  image?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
    };
  };
}

interface OrderProduct {
  _key: string;
  product: SanityProduct;
  quantity: number;
}

interface Order {
  _id: string;
  _type: "order";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  orderNumber?: string;
  orderDate?: string;
  status?: string;
  paymentMethod?: "cash" | "card";
  totalPrice?: number;
  currency?: string;
  amountDiscount?: number;
  products?: OrderProduct[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerName?: string;
  stripeCheckoutSessionId?: string;
}

export default async function OrdersPage() {
const { userId } = await auth()

if (!userId) {
    redirect("/")
}

// Get orders and type cast to avoid TypeScript errors
// Using any type and type assertions because the actual Sanity data structure
// is more complex than our interfaces can capture
const orders = await getMyOrders(userId) as unknown as Order[]

return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg w-full max-w-4xl ">
       
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-8">My Orders</h1>
{orders.length == 0 ? (
    <div className="text-center text-gray-600">
        <p >you have not placed any orders yet</p>
    </div>
) : (
<>
<div className="space-y-6 sm:space-y-8">
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {orders.map((order: any) => (
        <div key={order.orderNumber || order._id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >

            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                 <div>
                    <p className="text-sm text-gray-600 mb-1 font-bold">
                        Order Number
                    </p>
                    <p className="font-mono text-sm text-green-600 break-all">
                        {order.orderNumber || "N/A"}
                    </p>
             </div>
     
             <div className="sm:text-right">
             <p className="text-sm text-gray-600 mb-1">
                Order Date
             </p>
             <p className="font-medium ">
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
             </p>
             </div>

             </div>

             <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
               <div className="flex items-center">
                <span className="text-sm mr-2">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${order.status === "delivered" 
                        ? "bg-green-100 text-green-800" 
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"} ` }>
                    {order.status}
                </span>
                
                {order.paymentMethod && (
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs ${
                    order.paymentMethod === "cash" 
                      ? "bg-amber-50 text-amber-700 border border-amber-200" 
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {order.paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}
                  </span>
                )}
               </div>
              
               <div className="sm:text-right">
                <p className="text-sm text-gray-600 mb-1">
                    Total Amount
                </p>
                <p className="font-bold text-lg">
                    {formatCurrency(order.totalPrice || 0, order.currency || "USD")}
                </p>
               </div>

             
               </div>
          {order.amountDiscount ? (
            <div className="mt-4 p-4 sm:p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 font-medium mb-1 text-sm sm:text-base">
                   Discount Applied:{" "} {formatCurrency(order.amountDiscount , order.currency ?? "USD")}
                    </p>
                    <p className="text-sm text-gray-600 sm:text-base">
                        Original Subtotal:{" "} {
                        formatCurrency((order.totalPrice ?? 0) + (order.amountDiscount ), order.currency ?? "USD")}
                    </p>
            </div>
          ) : null}

                  </div>
                  <div className="px-4 py-3 sm:px-6 sm:py-4 ">
                    <div className="text-sm font-semibold text-gray-600 mb-3 sm:mb-4 ">
                        Order Items
                    </div>
                   <div className="space-y-3 sm:space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.products?.map((product: any) => (
                    <div key={`${order._id}-${product.product?._id || 'unknown'}`} 
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-b last-border-b-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                           {product.product?.image?.asset && (
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-md overflow-hidden">
                            <Image 
                            src={(imageUrl(product.product.image)).url()}
                            alt={product.product?.product || "product image"}
                            fill
                            className="object-cover"
                            />
                            </div>
                           )} 
                   {/* product title */}
                   <div>
                    <p className="text-sm font-medium sm:text-base">
                        {product.product?.product || "Unknown Product"}
                    </p>
                    <p className="text-sm text-gray-600">
                    Quantity: {product.quantity || "N/A"}
                    </p>
                   </div>

                   </div>
                   
                   <p className="font-medium text-right">
                    {product?.product?.price && product.quantity ?
                            formatCurrency(product.product.price * product.quantity, order?.currency || "USD")
                     : "N/A"}
                   </p>
                    </div>
                   ))}
                 
                  </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Products</h3>
                      <p className="text-sm">{order.products?.length || 0} item(s)</p>
                    </div>
                    
                    {order.shippingAddress && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Shipping Address</h3>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            {order.customerName && (
                              <p className="text-sm font-medium">{order.customerName}</p>
                            )}
                            <p className="text-sm">
                              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
        ))}
</div>
</>
)}
    </div>
    </div>
)


}
