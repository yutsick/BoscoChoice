import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

interface ImportRow {
  title: string
  content: string
  categorySlug: string
  subcategoryName: string
}

function textToLexical(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // Authenticate via cookie/token
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden: superadmin only' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const text = await file.text()
  let rows: ImportRow[]

  // Detect format by extension or content
  const isCSV = file.name.endsWith('.csv') || !text.trimStart().startsWith('[')

  if (isCSV) {
    const parsed = Papa.parse<ImportRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    })
    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parse errors', details: parsed.errors.slice(0, 5) },
        { status: 400 },
      )
    }
    rows = parsed.data
  } else {
    try {
      rows = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'JSON must be an array' }, { status: 400 })
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }

  // Cache for category/subcategory lookups
  const categoryCache = new Map<string, number>()
  const subcategoryCache = new Map<string, number>()

  const results: { index: number; title: string; status: 'created' | 'error'; error?: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const { title, content, categorySlug, subcategoryName } = row

    if (!title || !content || !categorySlug || !subcategoryName) {
      results.push({ index: i, title: title || '(empty)', status: 'error', error: 'Missing required fields' })
      continue
    }

    try {
      // Resolve category by slug
      let categoryId = categoryCache.get(categorySlug)
      if (!categoryId) {
        const cats = await payload.find({
          collection: 'categories',
          where: { slug: { equals: categorySlug } },
          limit: 1,
          overrideAccess: true,
        })
        if (cats.docs.length === 0) {
          results.push({ index: i, title, status: 'error', error: `Category not found: "${categorySlug}"` })
          continue
        }
        categoryId = cats.docs[0].id as number
        categoryCache.set(categorySlug, categoryId)
      }

      // Resolve subcategory by name within category
      const subKey = `${categorySlug}::${subcategoryName}`
      let subcategoryId = subcategoryCache.get(subKey)
      if (!subcategoryId) {
        const subs = await payload.find({
          collection: 'subcategories',
          where: {
            name: { equals: subcategoryName },
            category: { equals: categoryId },
          },
          limit: 1,
          overrideAccess: true,
        })
        if (subs.docs.length === 0) {
          results.push({ index: i, title, status: 'error', error: `Subcategory not found: "${subcategoryName}" in category "${categorySlug}"` })
          continue
        }
        subcategoryId = subs.docs[0].id as number
        subcategoryCache.set(subKey, subcategoryId)
      }

      await payload.create({
        collection: 'questions',
        overrideAccess: true,
        data: {
          title,
          content: textToLexical(content),
          category: categoryId,
          subcategory: subcategoryId,
        },
      })

      results.push({ index: i, title, status: 'created' })
    } catch (err: any) {
      results.push({ index: i, title, status: 'error', error: err.message || 'Unknown error' })
    }
  }

  const created = results.filter((r) => r.status === 'created').length
  const errors = results.filter((r) => r.status === 'error')

  return NextResponse.json({
    total: rows.length,
    created,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
