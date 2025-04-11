'use client'
import React from 'react'
import { Product } from '@/sanity.types'
import Link from 'next/link'
import Image from 'next/image'
import { imageUrl } from '@/lib/imageUrl'

const ProductThumb = ({ product }: { product: Product }) => {
  const isProductOutOfStock = product.stock != null && product.stock <= 0;

  return (<>
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group  flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isProductOutOfStock ? 'opacity-50' : ''}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {product.image && (
          <Image
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            src={imageUrl(product.image).url()}
            alt={product.product || 'Product Image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        )}
        {isProductOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.product}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description?.map((block) =>
            block._type === 'block' ? block.children?.map((child) => child.text).join('') : ''
          ).join(' ') || 'Product description not available.'}
        </p>
        <p className="text-lg font-bold text-gray-900">${product.price?.toFixed(2) || '0.00'}</p>
      </div>
    </Link>
    </>
  );
};

export default ProductThumb;
