import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { backenedClient } from "@/sanity/lib/backenedClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    
    // Retrieve the order from Sanity
    const order = await backenedClient.fetch(
      `*[_type == "order" && stripeCheckoutSessionId == $sessionId][0]`,
      { sessionId }
    );

    return NextResponse.json({ 
      success: true,
      session,
      order: order || null
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve checkout session" },
      { status: 500 }
    );
  }
} 