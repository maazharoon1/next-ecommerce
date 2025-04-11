import { Product } from '@/sanity.types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BasketItem {
  product: Product
  quantity: number
}

interface BasketState {
  items: BasketItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearBasket: () => void
  getTotalPrice: () => number
  getItemCount: (productId: string) => number
  getGroupedItems: () => BasketItem[]
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const existingItem = get().items.find((item) => item.product._id === product._id)
        if (existingItem) {
          set((state) => ({ items: state.items.map((item) => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item) }))
        }
        else {
          set((state) => ({ items: [...state.items, { product, quantity: 1 }] }))
        }
      },
      removeItem: (productId: string) => {
        set((state) => {
          // Get the current item
          const item = state.items.find(item => item.product._id === productId);
          
          // If item doesn't exist or quantity is already 0, do nothing
          if (!item || item.quantity <= 0) return state;
          
          // If quantity is 1, remove the item completely
          if (item.quantity === 1) {
            return { 
              items: state.items.filter(item => item.product._id !== productId) 
            };
          }
          
          // Otherwise, decrease the quantity
          return { 
            items: state.items.map(item => 
              item.product._id === productId 
                ? { ...item, quantity: item.quantity - 1 } 
                : item
            ) 
          };
        });
      },
      clearBasket: () => {
        set({ items: [] })
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0)
      }, 
      getItemCount: (productId: string) => {
        return get().items.reduce((count, item) => count + (item.product._id === productId ? item.quantity : 0), 0)
      },
      getGroupedItems: () => get().items,
    }),
   
    {
      name: 'basket-store',
    }
  )
)

export default useBasketStore


