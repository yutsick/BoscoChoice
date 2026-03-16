/** Extract ID from a Payload relationship value (can be a number or populated object) */
export function getCategoryId(user: any): number | null {
  const val = user?.assignedCategory
  if (!val) return null
  if (typeof val === 'object') return val.id ?? null
  return val
}
