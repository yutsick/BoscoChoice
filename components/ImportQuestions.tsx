'use client'

import { useAuth } from '@payloadcms/ui'
import { useState, useRef } from 'react'

export default function ImportQuestions() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if ((user as any)?.role !== 'superadmin') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import-questions', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
        Import Questions (JSON / CSV)
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ flex: '1 1 auto', minWidth: '200px' }}
        />
        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: '8px 20px',
            background: !file || loading ? 'var(--theme-elevation-150)' : 'var(--theme-success-500)',
            color: !file || loading ? 'var(--theme-elevation-500)' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: !file || loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Importing...' : 'Upload & Import'}
        </button>
        {result && (
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '8px 16px',
              background: 'var(--theme-elevation-150)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </form>

      {result && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '4px',
            background: result.error
              ? 'var(--theme-error-100)'
              : 'var(--theme-elevation-100)',
          }}
        >
          {result.error && !result.total ? (
            <p style={{ margin: 0, color: 'var(--theme-error-500)' }}>
              Error: {result.error}
            </p>
          ) : (
            <>
              <p style={{ margin: '0 0 4px' }}>
                <strong>Total:</strong> {result.total} | <strong>Created:</strong> {result.created} | <strong>Failed:</strong> {result.failed}
              </p>
              {result.errors?.map((err: any, i: number) => (
                <p key={i} style={{ margin: '2px 0', color: 'var(--theme-error-500)', fontSize: '13px' }}>
                  Row {err.index + 1} &quot;{err.title}&quot;: {err.error}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
