import { Media } from '@/app/(payload)/collections/Media'
import { Products } from '@/app/(payload)/collections/Products'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    Products,
    Media
  ],
  secret: process.env.PAYLOAD_SECRET || 'your-fallback-secret-key-12345',
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
  }),
})