import { Category, Product } from '@/sanity.types';
import ProductsGrid from './ProductsGrid';
import { CategorySelectorComponent } from './Category-Selector';

interface ProductsViewProps {
  products: Product[];
  categories: Category[]
}


export const ProductsView = ({products,categories}:ProductsViewProps ) => {
  return (
<>
<div className='flex flex-col'>
{/* Categories */}
<div className='w-full sm:w-[200px]'>
 <CategorySelectorComponent categories={categories}/>
</div>


{/* products */}
<div>
    <div className='flex-1'>
        <ProductsGrid products={products}/>

        <hr className='w-1/2 sm:w-3/4'/>
    </div>
</div>
</div>
</>
)
}
