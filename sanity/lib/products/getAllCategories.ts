import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";


export const getAllCategories = async () => {
    const ALL_Categories_QUERY = defineQuery(`
        *[_type == 'category']  
         | order(title asc)
        `)
    try {
        
        const categories = await sanityFetch({
            query : ALL_Categories_QUERY
        })
        return categories.data || []
    } catch (error) {
        console.error("Error fetching all categories:" + error)
        return []
    }

}