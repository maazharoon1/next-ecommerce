import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const salesType = defineType({
    name: 'sales',
    title: 'Sales',
    type: 'document',
    icon: TagIcon,
    fields: [
    defineField({
     name: 'title',
     title : 'sales Title',
     type:'string'
    }),
    defineField({
     name: 'description',
     title : 'Description',
     type:'text'
    }),
    defineField({
     name: 'discountAmount',
     title : 'Discount Amount',
     type:'number',
     description: 'Amount off in percentage or fixed value'
    }),
    defineField({
        name: 'couponCode',
        title : 'Coupon Code',
        type:'string',
        description: 'Coupon code to apply discount'
    }),
    defineField({
        name: 'validFrom',
        title : 'Valid From',
        type:'datetime',
        description: 'Start date of the sale'
    }),
    defineField({
        name: 'ValidUntil',
        title : 'Valid Until',
        type:'datetime',
        description: 'End date of the sale'
    }),
    defineField({
        name: 'isActive',
        title : 'Is Active',
        type:'boolean',
        description: 'toggle to activate or deactivate the sale',
        initialValue:true
    }),
    ],
preview: {
    select: {
        title: 'title',
        discountAmount: 'discountAmount',
        couponCode: 'couponCode',
        isActive : 'isActive'
        },
        prepare(select) {
            const {title, discountAmount, couponCode, isActive} = select
            return {
                title: title,
                subtitle: `${discountAmount}% off with code ${couponCode} - ${isActive ? 'Active' : 'Inactive'}`
            }
  }   
}
})