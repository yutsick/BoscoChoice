import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Questions } from './collections/Questions'
import { Subcategories } from './collections/Subcategories'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      graphics: {
        Logo: './components/AdminLogo',
        Icon: './components/AdminIcon',
      },
    },

    meta: {
      titleSuffix: '— Bosco Choice Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Categories, Subcategories, Questions, Users, Media],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) =>
      defaultFeatures.filter((f) => f.key !== 'code'),
  }),
  graphQL: {
    disable: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    },
  }),
  i18n: {
    supportedLanguages: { en },
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
})
