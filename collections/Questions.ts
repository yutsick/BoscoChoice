import type { CollectionConfig } from 'payload'
import { getCategoryId } from './utils'

export const Questions: CollectionConfig = {
  slug: 'questions',
  labels: {
    singular: 'Питання',
    plural: 'Питання',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'subcategory', 'updatedAt'],
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
      name: 'title',
      label: 'Назва (для списку)',
      type: 'text',
      required: true,
      admin: {
        description: 'Коротка назва для пошуку в адмінці. Не відображається на сайті.',
      },
    },
    {
      name: 'content',
      label: 'Зміст питання',
      type: 'richText',
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
    {
      name: 'subcategory',
      label: 'Підкатегорія',
      type: 'relationship',
      relationTo: 'subcategories',
      required: true,
      filterOptions: ({ data, user }) => {
        const categoryId =
          data?.category ||
          (user?.role === 'category_admin' ? getCategoryId(user) : null)
        if (!categoryId) return true
        return {
          category: { equals: categoryId },
        }
      },
    },
  ],
}
