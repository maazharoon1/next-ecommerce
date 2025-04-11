import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live"

async function getProductsByCategory(slug: string) {
  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[
    _type == 'product'
     && references(*[_type == 'category' && slug.current == $slug]._id)
     ] | order(product asc)`)
  try {
    const category = await sanityFetch({
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: { slug },
    })
    return category.data || null
  } catch (error) {
    console.error("Error fetching category by slug:", error)
  }
}

export default getProductsByCategory
