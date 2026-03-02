import type { CollectionConfig } from 'payload'

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
    },
    {
      name: 'subcategory',
      label: 'Підкатегорія',
      type: 'relationship',
      relationTo: 'subcategories',
      required: true,
      filterOptions: ({ data }) => {
        // Filter subcategories to match selected category
        if (!data?.category) return true
        return {
          category: { equals: data.category },
        }
      },
    },
  ],
}
