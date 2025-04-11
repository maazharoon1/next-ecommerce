import BlackFridayBanner from "@/components/BlackFridayBanner";
import { ProductsView } from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = 'force-static'; // this is used to force the page to be dynamic
  export const revalidate = 60;  // every 60 seconds the page will be revalidated and the data will be updated

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  
  // console.log(
  //   crypto.randomUUID().slice(0, 5) + `Rendered the homepage cache with ${products.length} products and ${categories.length} categories`
  // )

  
  
  return (
    <>
    <BlackFridayBanner/>

     {/* render all product is */}
   <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
   <ProductsView products={products} categories={categories} />

   </div>

    </>
  );
}
