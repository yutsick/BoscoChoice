import type { CollectionConfig } from 'payload'
import { getCategoryId } from './utils'

export const Subcategories: CollectionConfig = {
  slug: 'subcategories',
  labels: {
    singular: 'Підкатегорія',
    plural: 'Підкатегорії',
  },
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    beforeValidate: [
      ({ req, data }) => {
        if (req.user?.role === 'category_admin') {
          const catId = getCategoryId(req.user)
          if (catId) data!.category = catId
        }
        return data
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      const catId = getCategoryId(user)
      if (!catId) return false
      return { category: { equals: catId } }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'superadmin' || user.role === 'category_admin'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      const catId = getCategoryId(user)
      if (!catId) return false
      return { category: { equals: catId } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      const catId = getCategoryId(user)
      if (!catId) return false
      return { category: { equals: catId } }
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
        condition: (_data, _siblingData, { user }) => user?.role !== 'category_admin',
      },
    },
  ],
}
