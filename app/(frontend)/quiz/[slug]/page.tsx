import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import QuizClient from '@/components/QuizClient'
import type { QuizQuestion } from '@/lib/quiz-engine'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCategoryWithQuestions(slug: string) {
  const payload = await getPayload({ config })

  // Find category by slug
  const catResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (catResult.docs.length === 0) return null

  const category = catResult.docs[0]

  // Fetch all questions for this category
  const qResult = await payload.find({
    collection: 'questions',
    where: { category: { equals: category.id } },
    limit: 1000,
    overrideAccess: true,
  })

  const questions: QuizQuestion[] = await Promise.all(
    qResult.docs.map(async (q) => ({
      id: String(q.id),
      htmlContent: q.content
        ? await convertLexicalToHTML({ data: q.content as any })
        : '',
      subcategoryId:
        typeof q.subcategory === 'object' ? String(q.subcategory.id) : String(q.subcategory),
    })),
  )

  return { category, questions }
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getCategoryWithQuestions(slug)

  if (!data) notFound()

  const { category, questions } = data

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">{category.name}</h1>
        <p className="text-gray-400">У цій категорії ще немає питань.</p>
        <a href="/" className="mt-8 text-blue-500 hover:underline">
          ← Назад до категорій
        </a>
      </main>
    )
  }

  return (
    <QuizClient
      questions={questions}
      categoryName={category.name}
      categoryColor={category.color as string}
    />
  )
}
