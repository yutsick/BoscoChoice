import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Користувач',
    plural: 'Користувачі',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'assignedCategory'],
  },
  access: {
    // Only superadmin can manage users
    read: ({ req: { user } }) => user?.role === 'superadmin',
    create: ({ req: { user } }) => user?.role === 'superadmin',
    update: ({ req: { user } }) => user?.role === 'superadmin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
  fields: [
    // Email and password are provided by auth: true
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      required: true,
      defaultValue: 'category_admin',
      options: [
        { label: 'Суперадмін', value: 'superadmin' },
        { label: 'Адмін категорії', value: 'category_admin' },
      ],
    },
    {
      name: 'assignedCategory',
      label: 'Категорія',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (data) => data?.role === 'category_admin',
        description: 'Обов\'язково для ролі "Адмін категорії"',
      },
    },
  ],
}
