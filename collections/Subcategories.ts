import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req: { user } }: any) => user?.role === 'superadmin'

export const Subcategories: CollectionConfig = {
  slug: 'subcategories',
  labels: {
    singular: 'Підкатегорія',
    plural: 'Підкатегорії',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      return { category: { equals: user.assignedCategory } }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'superadmin' || user.role === 'category_admin'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      return { category: { equals: user.assignedCategory } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      return { category: { equals: user.assignedCategory } }
    },
  },
  fields: [
    {
      name: 'name',
      label: 'Назва',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      label: 'Категорія',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Категорія, до якої належить ця підкатегорія',
      },
    },
  ],
}
