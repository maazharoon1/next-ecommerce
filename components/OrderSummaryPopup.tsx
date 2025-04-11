import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, CreditCard, Tag, X, Loader2 } from "lucide-react";

interface OrderSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shippingAddress: {
    title: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
    percentage: number;
  };
  total: number;
  isLoading?: boolean;
}

export function OrderSummaryPopup({
  isOpen,
  onClose,
  onConfirm,
  shippingAddress,
  paymentMethod,
  subtotal,
  discount,
  total,
  isLoading = false
}: OrderSummaryPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Order Summary
          </DialogTitle>
        </DialogHeader>
        
        {/* Shipping Address */}
        <div className="space-y-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>
            <div className="text-gray-600">
              <p className="font-medium">{shippingAddress.title}</p>
              <p>{shippingAddress.street}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h3>
            <p className="text-gray-600 mt-1 capitalize">
              {paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Price Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    Discount ({discount.percentage}% off)
                    <span className="text-xs bg-green-100 px-2 py-0.5 rounded">
                      {discount.code}
                    </span>
                  </span>
                  <span>-${discount.amount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Place Order
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 