
import {TrolleyIcon} from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const productType = defineType({
    name: 'product',
    title: 'Products',
    type: 'document',
    icon:TrolleyIcon,
    fields: [
      defineField({
         name: 'product', 
         title: 'Product Name',
         type: 'string',
         validation: Rule => Rule.required()
        }),  
      defineField({
         name: 'slug', 
         title: 'slug',
         type: 'slug',
         options: {
          source: 'product',
            maxLength: 96 
         },
         validation: Rule => Rule.required()
        }),  
      defineField({
        name: 'image', 
         title: 'Product image',
         type: 'image',
          options: {
            hotspot: true
            }
        }),  
       defineField({
        name: 'description', 
         title: 'Description',
         type: 'blockContent'
        }),
      defineField({
        name: 'price', 
         title: 'Price',
         type: 'number',
         validation: Rule => Rule.required().min(0)
        }),  
      defineField({
        name: 'categories', 
         title: 'Categories',
         type: 'array',
         of: [{type: 'reference', to: [{type: 'category'}] }],
         validation: Rule => Rule.required()
        }),  
        defineField({
            name: 'stock', 
             title: 'Stock',
             type: 'number',
             validation: Rule => Rule.required().min(0)
            }),
    ],
    preview: {
        select: {
          title: 'product',
          media: 'image',
          price: 'price'
        },
     
        prepare(select) {
        return {
          title: select.title,
          subtitle: `$${select.price}`,
          media: select.media
        }
      }
    },
})
