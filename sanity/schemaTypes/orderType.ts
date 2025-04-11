// create a order schema type
import { defineArrayMember, defineField, defineType, Preview } from 'sanity'
import { BasketIcon } from '@sanity/icons'
export const orderType = defineType({
  name: 'order',
    title: 'Order',
    type: 'document',
    icon: BasketIcon,
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'paymentMethod',
            title: 'Payment Method',
            type: 'string',
            options: {
                list: [
                    {title: 'Card Payment', value: 'card'},
                    {title: 'Cash on Delivery', value: 'cash'}
                ]
            },
            validation: Rule => Rule.required()
        }),
        defineField({
         name: 'stripeCheckoutSessionId',
            title: 'Stripe Checkout Session ID',
            type: 'string',
            hidden: ({document}) => document?.paymentMethod === 'cash'
        }),
        defineField({
            name:'stripeCustomerId',
            title:'Stripe Customer ID',
            type:'string',
            hidden: ({document}) => document?.paymentMethod === 'cash'
        }),
        defineField({
            name:'stripePaymentIntentId',
            title:'Stripe Payment Intent ID',
            type:'string',
            hidden: ({document}) => document?.paymentMethod === 'cash'
        }),
        defineField({
            name: 'clerkUserId',
            title: 'Clerk User ID',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'customerName',
            title: 'Customer Name',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'email',
            title: 'customer Email',
            type: 'string',
            validation: Rule => Rule.required().email()
        }),
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'object',
            fields: [
                defineField({
                    name: 'title',
                    title: 'Address Title',
                    type: 'string',
                }),
                defineField({
                    name: 'street',
                    title: 'Street Address',
                    type: 'string',
                    validation: Rule => Rule.required()
                }),
                defineField({
                    name: 'city',
                    title: 'City',
                    type: 'string',
                    validation: Rule => Rule.required()
                }),
                defineField({
                    name: 'state',
                    title: 'State',
                    type: 'string',
                    validation: Rule => Rule.required()
                }),
                defineField({
                    name: 'zipCode',
                    title: 'ZIP Code',
                    type: 'string',
                    validation: Rule => Rule.required()
                }),
                defineField({
                    name: 'country',
                    title: 'Country',
                    type: 'string',
                    validation: Rule => Rule.required()
                }),
                defineField({
                    name: 'phone',
                    title: 'Phone',
                    type: 'string',
                    validation: Rule => Rule.required()
                })
            ]
        }),
     
      defineField({
        name: 'products',
        title: 'Products',
        type: 'array',
        of: [ 
defineArrayMember({
  type: 'object',
    fields: [
        defineField({
        name: 'product',
        title: 'Product  Bought',
        type: 'reference',
        to: [{type: 'product'}],
        }),
        defineField({
        name: 'quantity',
        title: 'Quantity',
        type: 'number',
        validation: Rule => Rule.required().min(1)
        }),
      
    ],
    preview: {
        select: {
            product : 'product.product',
            quantity: 'quantity',
            image: 'product.image',
            price: 'product.price',
            currency : 'product.currency'
        },
        prepare(select: { product: string; quantity: number; image: any; price: number }) {
            return {
                title: ` ${select.product} ⚔︎ ${select.quantity}`,
                subtitle: ` ${select.quantity * select.price} `,
                media: select.image
            }
        }
    }
}),
]
        }),
       defineField({
        name: 'totalPrice',
        title: 'Total Price',
        type: 'number',
        validation: Rule => Rule.required().min(0)
    }),
        defineField({
        name: 'currency',
        title: 'Currency',
        type: 'string',
        validation: Rule => Rule.required()
    }),
        defineField({
            name : 'amountDiscount',
            title : 'Amount Discount',
            type : 'number',
            validation : Rule => Rule.min(0)
        }), 
        defineField({
            name : 'couponCode',
            title : 'Coupon Code',
            type : 'string',
        }), 
        defineField({
            name : "status",
            title : "Status",
            type : "string",
            options : {
                list : [
                    {title : "Pending", value : "pending"},
                    {title : "Shipped", value : "shipped"},
                    {title : "Delivered", value : "delivered"},
                    {title : "Cancelled", value : "cancelled"}
                ]
            },
            initialValue: 'pending'
        }),
        defineField({
            name:'orderDate',
            title:'Order Date',
            type:'datetime',
            validation: Rule => Rule.required()
        }),
],
      preview: {
            select: {
                name : 'customerName',
                amount : "totalPrice",
                currency: 'currency',
                orderID: 'orderNumber',
                email: 'email',
                paymentMethod: 'paymentMethod'
            },
            prepare(select) {
                const orderIdSnippet = select.orderID ? `${select.orderID.slice(0,5)}...${select.orderID.slice(-5)} ` : ''
                const paymentIcon = select.paymentMethod === 'cash' ? '💵' : '💳'
                return {
                    title: `${select.name} (${orderIdSnippet}) ${paymentIcon}`,
                    subtitle: `${select.amount} ${select.currency}, ${select.email}`,
                    media: BasketIcon
                }
            }
        }
})
