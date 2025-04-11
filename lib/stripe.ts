// CodeChange needed : if you doesn't use stripe as a payment gateway, you can remove this file
import Stripe from 'stripe'

if(!process.env.STRIPE_SECRET_KEY){
    throw new Error("Stripe secret key is not set")
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: "2025-03-31.basil",
})
export default stripe;