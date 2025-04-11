import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { BasketItem } from "@/store/store"; // Import correct type instead of unused Product

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      clerkUserId,
      shippingAddress,
      products,
      totalPrice,
      couponCode,
      amountDiscount,
      currency,
    } = body;
    
    // Validate required fields
    if (!orderNumber || !customerName || !customerEmail || !clerkUserId || 
        !shippingAddress || !products || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const client = createClient({
      apiVersion,
      dataset,
      projectId,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    });
    const newShippingAddress = {
      ...shippingAddress,
      _type: "shippingAddress"
    }
    // Create the order
    const order = await client.create({
      _type: "order",
      orderNumber,
      
      customerName: customerName,
        email: customerEmail,
        clerkUserId,
      shippingAddress: newShippingAddress,
      products: products.map((item: BasketItem, index: number) => ({
        _key: `${item.product._id}-${Date.now()}-${index}`,
        product: {
          _type: "reference",
          _ref: item.product._id
        },
        quantity: item.quantity,
      })),
      totalPrice,
      amountDiscount,
      couponCode,
      currency,
      paymentMethod: "cash",
      status: "pending",
      orderDate: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 