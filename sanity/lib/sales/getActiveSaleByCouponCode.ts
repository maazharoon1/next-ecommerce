import { defineQuery } from "next-sanity";
import { CouponCode } from "./CouponCode";
import { sanityFetch } from "../live";

export const getActiveSaleByCouponCode = async(couponCode : CouponCode  ) => {
    const ACTIVE_SALE_BY_COUPON_CODE = defineQuery(`
    *[
        _type == 'sales' 
     && isActive == true 
     && couponCode == $couponCode   // Fixed case to match schema
   ] | order(validFrom desc)[0]
         `)

         try {
            const activeSale = await sanityFetch({
                query: ACTIVE_SALE_BY_COUPON_CODE,
                params: {
                    couponCode,
                }
            })
            return activeSale?.data ?? null
         } catch (error) {
            console.error("Error Fetching active sale by Coupon Code:", error)
            return null
         }
}