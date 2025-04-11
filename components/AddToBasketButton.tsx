'use client'
import { Product } from '@/sanity.types'
import useBasketStore from '@/store/store'
import { useEffect, useState } from 'react'

interface AddToBasketButtonProps {
    product: Product
    disabled: boolean
}

function AddToBasketButton({ product, disabled }: AddToBasketButtonProps) {
    const { addItem, getItemCount, removeItem } = useBasketStore()
    const [isClient, setIsClient] = useState(false)
    const itemCount = getItemCount(product._id)
    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null

    return (
        <>
            <div className='flex items-center justify-center space-x-2'>
                <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center
     transition-colors duration-200 
     ${itemCount === 0 ? 'bg-gray-100 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => removeItem(product._id)} disabled={itemCount === 0}>

                    <span
                        className={`text-xl font-bold 
                     ${itemCount == 0 ? "text-gray-400"
                                : "text-gray-600"}`}>
                        -
                    </span>
                </button>
                <span className='text-sm font-medium'>
                    {
                    // disabled ? "0" :
                     itemCount}
                </span>
                <button
                    className={`w-8 h-8 rounded-full flex items-center
                                justify-center transition-colors duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'}`}
                    onClick={() => addItem(product)} disabled={disabled}>
                    <span className={`text-xl font-bold 
                        ${disabled ? "text-gray-400"
                            : "text-gray-600"}`}>
                        +
                    </span>

                </button>

            </div>
        </>
    )
}

export default AddToBasketButton
