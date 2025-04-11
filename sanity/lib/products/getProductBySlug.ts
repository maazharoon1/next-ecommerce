import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live"

async function getProductBySlug( slug :  string) {
  const PRODUCT_BY_ID_QUERY =defineQuery(`
    *[
        _type == 'product' 
      && slug.current == $slug
  ] [0]
  `)
  try {
    const products = await sanityFetch({
        query :  PRODUCT_BY_ID_QUERY,
        params :{
           slug,  // Fixed param name to match query
        }
    })
    return products.data || null
  } catch (error) {
    console.error("Error fetching products By id:", error)
  }
}

export default getProductBySlug
