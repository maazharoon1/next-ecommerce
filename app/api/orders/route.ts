import { client } from "@/sanity/lib/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentMethod, shippingAddress, couponCode } = body

    // Get cart items from session or database
    const cartItems: Array<{
      _key: string;
      product: {
        _type: string;
        _ref: string;
      };
      quantity: number;
    }> = []

    // Create order in Sanity
    const order = await client.create({

      _type: "order",
      paymentMethod,
      shippingAddress,
      items: cartItems,
      couponCode,
      status: "pending",
      total: 0, // Calculate total from cart items
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
} 