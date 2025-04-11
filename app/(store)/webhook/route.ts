import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { backenedClient } from "@/sanity/lib/backenedClient";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import { Metadata } from "@/actions/createCheckoutSession";

// Define a proper type for order data
interface OrderData {
  _type: string;
  orderNumber: string;
  paymentMethod: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  customerName: string;
  clerkUserId: string;
  email: string;
  currency: string;
  amountDiscount: number;
  products: Array<{
    _key: string;
    product: {
      _type: string;
      _ref: string;
    };
    quantity: number;
  }>;
  totalPrice: number;
  status: string;
  orderDate: string;
  shippingAddress: {
    title: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

export async function POST(request: NextRequest) {
   try {
     console.log("Webhook received");
     const body = await request.text();
     const headerList = await headers();
     const signature = headerList.get("stripe-signature");
     
     if (!signature) {
       console.error("Missing stripe signature");
       return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
     }

     console.log("Signature verified");
     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
     if (!webhookSecret) {
       console.error("Missing webhook secret in environment variables");
       return NextResponse.json(
         { error: "Server configuration error" },
         { status: 500 }
       );
     }

     let event: Stripe.Event;
     try {
       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
       console.log("Event received:", event.type);
     } catch (error) {
       console.error("Invalid webhook signature:", error);
       return NextResponse.json(
         { error: "Invalid webhook signature" },
         { status: 400 }
       );
     }

     if (event.type !== "checkout.session.completed") {
       console.log("Unhandled event type:", event.type);
       return NextResponse.json(
         { message: `Unhandled event type ${event.type}` },
         { status: 200 }
       );
     }

     const session = event.data.object as Stripe.Checkout.Session;
     if (!session) {
       console.error("Invalid session data");
       throw new Error("Invalid session data");
     }

     console.log("Creating order in Sanity...");
     const order = await createOrderInSanity(session);
     console.log("Order created successfully:", order._id);
     
     return NextResponse.json(
       { message: "Order created successfully", orderId: order._id },
       { status: 200 }
     );
   } catch (error) {
     console.error("Webhook error:", error);
     return NextResponse.json(
       { error: "Internal server error" },
       { status: 500 }
     );
   }
}

async function createOrderInSanity(session: Stripe.Checkout.Session){
 const {
    id,
    amount_total,
    currency,
    payment_intent,
    customer,
    total_details    
    } = session;

    const { 
      orderNumber,
      customerName,
      customerEmail,
      clerkUserID,
      shippingTitle,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
      shippingPhone
    } = (session.metadata as unknown) as Required<Metadata>;

    if (!orderNumber || !customerName || !customerEmail || !clerkUserID ||
        !shippingStreet || !shippingCity || !shippingState || 
        !shippingZipCode || !shippingCountry || !shippingTitle || !shippingPhone) {
      throw new Error('Missing required metadata fields');
    }

    // Validate phone number format
    const phoneStr = shippingPhone.toString();
    const cleanedPhone = phoneStr.replace(/\D/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      throw new Error('Invalid phone number format');
    }

    // Get the line items with the product
    const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
        id,
        {
            expand: ["data.price.product"]
        }
    );
    // Create the sanity products
    const sanityProducts = lineItemsWithProduct.data.map((item) => {
      const product = item.price?.product as Stripe.Product;
      
      return {
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: product?.metadata?.productID
        },
        quantity: item.quantity || 0,
      };
    });
    
    // Prepare order data
    const orderData: OrderData = {
      _type: "order",
      orderNumber,
      paymentMethod: "card",
      stripeCheckoutSessionId: id,
      stripePaymentIntentId: payment_intent as string,
      stripeCustomerId: customer as string,
      customerName,
      clerkUserId: clerkUserID,
      email: customerEmail,
      currency: currency || 'usd',
      amountDiscount: total_details?.amount_discount
        ? total_details.amount_discount / 100 
        : 0,
      products: sanityProducts,
      totalPrice: amount_total ? amount_total / 100 : 0,
      status: "pending",
      orderDate: new Date().toISOString(),
      shippingAddress: {
        title: shippingTitle || "Default",
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zipCode: shippingZipCode,
        country: shippingCountry,
        phone: shippingPhone ? shippingPhone.toString() : ""
      }
    };
    
    // Create the order in sanity
    const order = await backenedClient.create(orderData);
    return order;
}

