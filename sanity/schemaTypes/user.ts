import { UserIcon } from '@sanity/icons'

export default {  
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
  fields: [
    {
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        slugify: (input: string) => input.toLowerCase().replace(/ /g, '-'),
      },
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'addresses',
      title: 'Addresses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Address Title',
              type: 'string',
            },
            {
              name: 'street',
              title: 'Street Address',
              type: 'string',
            },
            {
              name: 'city',
              title: 'City',
              type: 'string',
            },
            {
              name: 'state',
              title: 'State',
              type: 'string',
            },
            {
              name: 'zipCode',
              title: 'ZIP Code',
              type: 'string',
            },
            {
              name: 'country',
              title: 'Country',
              type: 'string',
            },
            {
              name: 'phone',
              title: 'Phone',
              type: 'string',
            },
          
          ],
          preview: {
            select: {
              title: 'title',
              street: 'street',
              city: 'city',
            },
            prepare(select: any) {
              const {title, street, city} = select
              return {
                title: title,
                subtitle: `${street}, ${city}`
              }
            }
          },

        },
      ],
    },
  ],
} 