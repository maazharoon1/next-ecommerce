import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode } from "@/sanity/lib/sales/getActiveSales";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const couponCode = searchParams.get('code');
  
  if (!couponCode) {
    return NextResponse.json(
      { error: "Coupon code is required" },
      { status: 400 }
    );
  }
  
  try {
    const coupon = await validateCouponCode(couponCode);
    
    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired coupon code" },
        { status: 200 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.couponCode,
        discountAmount: coupon.discountAmount,
        title: coupon.title,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
} 