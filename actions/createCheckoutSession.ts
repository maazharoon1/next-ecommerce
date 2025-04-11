"use server"

import { imageUrl } from "@/lib/imageUrl"
import stripe from "@/lib/stripe"
import { BasketItem } from "@/store/store"
import { metadata } from "next-sanity/studio"

export type Metadata = {
    orderNumber : string,
    customerName: string,
    customerEmail : string,
    clerkUserID : string,
    shippingStreet: string,
    shippingCity: string,
    shippingState: string,
    shippingZipCode: string,
    shippingCountry: string,
    shippingTitle: string,
    shippingPhone: number,
  }

export type GroupedBasketItem = {
    product : BasketItem["product"],
    quantity : number
}

// First, create a helper function to extract plain text from Sanity block content
function sanityBlockToPlainText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks
    .map(block => {
      if (!block.children || !Array.isArray(block.children)) return '';
      
      return block.children
        .map((child: any) => child.text || '')
        .join('');
    })
    .join('\n\n');
}

export async function createCheckOutSession(
    items: GroupedBasketItem[],
    metadata : Metadata
) {
    try {
        const isItemsWithOutPrice = items.filter((item) => !item.product.price || item.product.price === 0)
        if(isItemsWithOutPrice.length > 0){
            throw new Error("Price is missing for product: " + isItemsWithOutPrice.map((item) => item.product._id).join(", "))
        }
        // CodeChange needed : if you doesn't use stripe   
        const customers = await stripe.customers.list({
            email: metadata.customerEmail,
            limit:1
        })   

        let customerID :string | undefined
        if(customers.data.length > 0){
            customerID =customers.data[0].id
        }
        
        const baseUrl = process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}` 
        : `${process.env.NEXT_PUBLIC_BASE_URL}`
        const successUrl = `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${encodeURIComponent(metadata.orderNumber)}`
        const cancelUrl = `${baseUrl}/basket`


     
        const session = await stripe.checkout.sessions.create({
            customer : customerID,
            customer_creation : customerID ? undefined : "always",
            customer_email : !customerID ? metadata.customerEmail : undefined,
            metadata,
            mode:"payment",
            allow_promotion_codes:true,
            success_url : successUrl,
            cancel_url : cancelUrl,
            line_items : items.map((item) => {
                if (!item.product.price) {
                    throw new Error(`Price is missing for product: ${item.product._id}`);
                }
                
                // Convert the description from Sanity block content to plain text
                const plainTextDescription = Array.isArray(item.product.description) 
                    ? sanityBlockToPlainText(item.product.description)
                    : typeof item.product.description === 'string' 
                        ? item.product.description 
                        : undefined;
                
                return {
                    price_data : {
                        currency : "usd",
                        unit_amount : Math.round(item.product.price! * 100),
                        product_data : {
                            metadata : {
                                productID : item.product._id,
                            },
                            name : item.product.product || "Product",
                            images : item.product.image ? 
                                [imageUrl(item.product.image).url()]
                            : [],
                            description : plainTextDescription
                        },
                    },
                    quantity : item.quantity
                }
            })
        })

        if (!session.url) {
            throw new Error('Failed to create checkout session URL');
        }
    

        return session.url
    } catch (error) {
        console.error("Stripe session creation failed:", error)
        throw error
    }
}