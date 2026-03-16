import type { CollectionConfig } from 'payload'
import { getCategoryId } from './utils'

const isSuperAdmin = ({ req: { user } }: any) => user?.role === 'superadmin'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Категорія',
    plural: 'Категорії',
  },
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role !== 'superadmin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      const catId = getCategoryId(user)
      if (!catId) return false
      return { id: { equals: catId } }
    },
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'Назва',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Латинські літери, цифри, дефіс. Наприклад: history, science-2',
      },
    },
    {
      name: 'color',
      label: 'Колір (Tailwind клас)',
      type: 'select',
      required: true,
      defaultValue: 'rose',
      options: [
        { label: 'Червоний', value: 'rose' },
        { label: 'Помаранчевий', value: 'orange' },
        { label: 'Жовтий', value: 'yellow' },
        { label: 'Зелений', value: 'green' },
        { label: 'Синій', value: 'blue' },
        { label: 'Індиго', value: 'indigo' },
        { label: 'Фіолетовий', value: 'violet' },
        { label: 'Рожевий', value: 'pink' },
      ],
    },
  ],
}
