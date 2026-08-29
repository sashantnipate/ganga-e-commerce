import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',  
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing & Apparel', value: 'clothing' },
        { label: 'Home & Kitchen', value: 'home-kitchen' },
        { label: 'Books', value: 'books' },
        { label: 'Accessories', value: 'accessories' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}