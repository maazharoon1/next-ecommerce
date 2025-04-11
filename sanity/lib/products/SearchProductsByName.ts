import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live"

export const SearchProductByName = async (searchParam: string) =>{
    const PRODUCT_SEARCH_QUERY = defineQuery(`
  *[_type == 'product'  
    && product match $searchParam
     ]    | order(product asc)
        `)
    try {
        
        const products = await sanityFetch({
            query :  PRODUCT_SEARCH_QUERY,
            params :{
                searchParam : `${searchParam}*`  // Fixed param name to match query
            }
        })
        return products.data || []
    } catch (error) {
        console.error("Error fetching all products by name:" + error)
        return []
    }
}