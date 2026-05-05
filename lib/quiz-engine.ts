export interface QuizQuestion {
  id: string
  htmlContent: string
  subcategoryId: string
}

/**
 * Builds a round-robin queue of questions cycling through subcategories.
 *
 * Example: subcategories [a, b, c] with 2 questions each →
 * result: [a1, b1, c1, a2, b2, c2]
 *
 * Within each subcategory the questions are shuffled randomly.
 * If there's only one subcategory, returns its questions shuffled.
 */
export function buildRoundRobinQueue(questions: QuizQuestion[]): QuizQuestion[] {
  if (questions.length === 0) return []

  // Group questions by subcategory
  const groupMap = new Map<string, QuizQuestion[]>()
  for (const q of questions) {
    const group = groupMap.get(q.subcategoryId) ?? []
    group.push(q)
    groupMap.set(q.subcategoryId, group)
  }

  // Shuffle within each subcategory group
  const groups = Array.from(groupMap.values()).map((group) => shuffleArray([...group]))

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
