import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

const colorMap: Record<string, { bg: string; hover: string; text: string; shadow: string }> = {
  rose:   { bg: 'bg-rose-500',   hover: 'hover:bg-rose-600',   text: 'text-white', shadow: 'shadow-rose-200' },
  orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-white', shadow: 'shadow-orange-200' },
  yellow: { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-gray-900', shadow: 'shadow-yellow-200' },
  green:  { bg: 'bg-green-500',  hover: 'hover:bg-green-600',  text: 'text-white', shadow: 'shadow-green-200' },
  blue:   { bg: 'bg-blue-500',   hover: 'hover:bg-blue-600',   text: 'text-white', shadow: 'shadow-blue-200' },
  indigo: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white', shadow: 'shadow-indigo-200' },
  violet: { bg: 'bg-violet-500', hover: 'hover:bg-violet-600', text: 'text-white', shadow: 'shadow-violet-200' },
  pink:   { bg: 'bg-pink-500',   hover: 'hover:bg-pink-600',   text: 'text-white', shadow: 'shadow-pink-200' },
}

export const dynamic = 'force-dynamic'

async function getCategories() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    limit: 50,
    overrideAccess: true,
  })
  return result.docs
}

export default async function HomePage() {
  const categories = await getCategories()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-3">
          Bosco Choice
        </h1>
        <p className="text-center text-gray-500 text-lg mb-12">
          Оберіть категорію, щоб почати вікторину
        </p>

        {categories.length === 0 ? (
          <p className="text-center text-gray-400">Категорії ще не додані.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => {
              const color = colorMap[cat.color as string] ?? colorMap.blue
              return (
                <Link
                  key={cat.id}
                  href={`/quiz/${cat.slug}`}
                  className={`
                    ${color.bg} ${color.hover} ${color.text}
                    rounded-2xl p-6 md:p-8
                    flex items-center justify-center text-center
                    font-bold text-xl md:text-2xl
                    shadow-lg ${color.shadow}
                    transition-all duration-200
                    hover:scale-105 hover:shadow-xl
                    active:scale-95
                    cursor-pointer
                  `}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
