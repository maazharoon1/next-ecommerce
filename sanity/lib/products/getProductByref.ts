// now get started with getProductByref.ts
'use server'
import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live"

export const getProductByref = async (ref: string) => {
    
    const PRODUCT_BY_REF_QUERY = defineQuery(`
        *[_type == 'product' && _id == $ref][0]
    `)
    try {
        const product = await sanityFetch({ query: PRODUCT_BY_REF_QUERY, 
            params: { ref }
          })
        return product.data
    } catch (error) {
        console.error("Error fetching product by ref:" + error)
        return null
    }
}
