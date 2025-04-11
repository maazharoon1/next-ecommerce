'use client'

import AddToBasketButton from '@/components/AddToBasketButton'
import Loader from '@/components/Loader'
import { imageUrl } from '@/lib/imageUrl'
import useBasketStore from '@/store/store'
import { SignInButton, useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

function BasketPage() {
  const groupedItems = useBasketStore((state) => state.getGroupedItems())
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  
  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Early return for non-client rendering
  if(!isClient){
    return <Loader/>
  }
  
  // Early return for empty basket
  if(groupedItems.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className='text-2xl font-bold mb-6 text-gray-800'>Your Basket</h1>
        <p className='text-gray-600 text-lg'>Your Basket is empty</p>
      </div>
    )
  }

  // Filter items with quantity > 0 for display
  const filteredItems = groupedItems.filter((item) => item.quantity > 0)

  return (
    <div className='container mx-auto p-4 max-w-7xl'>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Basket</h1>
      
      <div className='flex flex-col lg:flex-row gap-6 relative pb-[100px] lg:pb-0'>
        {/* Products List */}
        <div className="w-full lg:w-2/3">
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div 
                key={item.product._id}
                className='p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white'
              >
                <div className='flex items-center justify-between flex-wrap gap-4'>
                  <div 
                    className='flex items-center flex-1 min-w-0 cursor-pointer'
                    onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                  >
                    {item.product.image && (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <Image
                          src={imageUrl(item.product.image).url()}
                          alt={item.product.product || 'Product Image'}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="ml-4 flex-1 min-w-0">
                      <h2 className="text-lg font-semibold truncate">
                        {item.product.product}
                      </h2>
                      <p className='text-gray-600'>
                        ${((item.product.price ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <AddToBasketButton product={item.product} disabled={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg border shadow-sm lg:sticky lg:top-4">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Items ({filteredItems.reduce((total, item) => total + item.quantity, 0)})</span>
                <span>{filteredItems.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span>${filteredItems.reduce((total, item) => total + ((item.product.price ?? 0) * item.quantity), 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              {isSignedIn ? (
                <Link href="/checkout">
                <Button 
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors hover:bg-blue-600"
                >
                  Proceed to Checkout
                </Button>
                </Link>
              ) : (
                <SignInButton mode='modal'>
                  <Button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                    Sign In to Checkout
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasketPage
