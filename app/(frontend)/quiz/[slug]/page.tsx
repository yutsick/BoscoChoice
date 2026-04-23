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

async function getAllQuestionsWithCategories(startSlug: string) {
  const payload = await getPayload({ config })

  // Fetch all categories
  const catResult = await payload.find({
    collection: 'categories',
    limit: 100,
    overrideAccess: true,
  })

  if (catResult.docs.length === 0) return null

  const startCategory = catResult.docs.find((c) => c.slug === startSlug)
  if (!startCategory) return null

  // Map category id → info
  const categoryMap = new Map(
    catResult.docs.map((c) => [
      String(c.id),
      { name: c.name, color: c.color as string },
    ]),
  )

  // Fetch ALL questions across all categories
  const qResult = await payload.find({
    collection: 'questions',
    limit: 10000,
    overrideAccess: true,
  })

  const questions: QuizQuestion[] = await Promise.all(
    qResult.docs.map(async (q) => {
      const catId =
        typeof q.category === 'object' ? String(q.category.id) : String(q.category)
      const cat = categoryMap.get(catId)
      return {
        id: String(q.id),
        htmlContent: q.content
          ? await convertLexicalToHTML({ data: q.content as any })
          : '',
        subcategoryId:
          typeof q.subcategory === 'object'
            ? String(q.subcategory.id)
            : String(q.subcategory),
        categoryId: catId,
        categoryName: cat?.name ?? '',
        categoryColor: cat?.color ?? 'blue',
      }
    }),
  )

  return {
    startCategoryId: String(startCategory.id),
    startCategoryName: startCategory.name,
    questions,
  }
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getAllQuestionsWithCategories(slug)

  if (!data) notFound()

  const { startCategoryId, startCategoryName, questions } = data

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">{startCategoryName}</h1>
        <p className="text-gray-400">Ще немає питань.</p>
        <a href="/" className="mt-8 text-blue-500 hover:underline">
          ← Назад до категорій
        </a>
      </main>
    )
  }

  return (
    <QuizClient
      questions={questions}
      startCategoryId={startCategoryId}
    />
  )
}
