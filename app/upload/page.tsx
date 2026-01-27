'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [searchId, setSearchId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !searchId) return

    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('search_id', searchId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      
      if (res.ok) {
        setMessage(`✅ ${data.message}`)
        setFile(null)
        setSearchId('')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Upload fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Results Upload (Admin)</h1>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Search ID
              </label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="z.B. abc123xyz"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Results JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md"
            >
              {loading ? 'Uploading...' : 'Upload Results'}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
              {message}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h2 className="font-semibold mb-2">JSON Format:</h2>
            <pre className="text-xs overflow-x-auto">
{`[
  {
    "company_name": "Uniklinikum Leipzig",
    "job_title": "Controller (m/w/d)",
    "job_url": "https://...",
    "description": "Vollzeit, unbefristet"
  },
  ...
]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
