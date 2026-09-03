import { Media } from './src/app/(payload)/collections/Media'
import { Customers } from './src/app/(payload)/collections/Customers'
import { Orders } from './src/app/(payload)/collections/Orders'
import { Products } from './src/app/(payload)/collections/Products'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'

const generateFileURL = ({ filename, prefix }: { filename: string; prefix?: string }) => {
  const key = prefix ? `${prefix}/${filename}` : filename

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

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
    Customers,
    Orders,
    Products,
    Media
  ],

  plugins: [
    s3Storage({
      enabled: true,

      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL,
        },
      },

      bucket: process.env.R2_BUCKET!,

      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },

        region: 'auto',

        endpoint: process.env.R2_ENDPOINT,

        forcePathStyle: true
      }
    })
  ],
  secret: process.env.PAYLOAD_SECRET!,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
  }),
})
