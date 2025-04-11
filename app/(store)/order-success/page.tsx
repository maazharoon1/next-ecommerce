'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import useBasketStore from "@/store/store";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const [isClient, setIsClient] = useState(false);
  const clearBasket = useBasketStore((state) => state.clearBasket);
  
  useEffect(() => {
    setIsClient(true);
    
    // Clear the basket after successful order
    if (orderId || orderNumber) {
      clearBasket();
    }
  }, [orderId, orderNumber, clearBasket]);
  
  if (!isClient) return null;
  
  return (
    <div className="container mx-auto my-10 px-4 max-w-3xl">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
            <p className="text-sm text-gray-600">
              Order Number: <span className="font-semibold">{orderNumber || "Processing"}</span>
            </p>
            {orderId && (
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-semibold">{orderId}</span>
              </p>
            )}
          </div>
          
          <div className="p-4 border rounded-lg">
            <p className="text-sm">
              We have sent an order confirmation email with details and tracking information.
            </p>
            <p className="text-sm mt-2">
              If you have any questions about your order, please contact our customer service team.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/orders">View My Orders</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 