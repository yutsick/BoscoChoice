export interface QuizQuestion {
  id: string
  htmlContent: string
  subcategoryId: string
  categoryId: string
  categoryName: string
  categoryColor: string
}

/**
 * Builds a round-robin queue of questions cycling through categories.
 *
 * Example: categories [A, B, C] with questions →
 * result: [A1, B1, C1, A2, B2, C2, ...]
 *
 * Within each category the questions are shuffled randomly.
 * If startCategoryId is provided, rotation begins from that category.
 */
export function buildRoundRobinQueue(
  questions: QuizQuestion[],
  startCategoryId?: string,
): QuizQuestion[] {
  if (questions.length === 0) return []

  // Group questions by category
  const groupMap = new Map<string, QuizQuestion[]>()
  for (const q of questions) {
    const group = groupMap.get(q.categoryId) ?? []
    group.push(q)
    groupMap.set(q.categoryId, group)
  }

  // Sort category IDs for stable order
  let categoryIds = Array.from(groupMap.keys()).sort()

  // Rotate so the starting category comes first
  if (startCategoryId) {
    const idx = categoryIds.indexOf(startCategoryId)
    if (idx > 0) {
      categoryIds = [...categoryIds.slice(idx), ...categoryIds.slice(0, idx)]
    }
  }

  // Shuffle within each category group
  const groups = categoryIds.map((id) => shuffleArray([...groupMap.get(id)!]))

  // Round-robin interleave
  const result: QuizQuestion[] = []
  let i = 0

  while (groups.some((g) => g.length > 0)) {
    const group = groups[i % groups.length]
    if (group.length > 0) {
      result.push(group.shift()!)
    }
    i++
  }

  return result
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
