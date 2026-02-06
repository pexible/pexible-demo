import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

// Maximum upload limits
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const MAX_RESULTS = 500

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const searchId = formData.get('search_id') as string

    if (!file || !searchId) {
      return Response.json({ error: 'File and search_id required' }, { status: 400 })
    }

    if (typeof searchId !== 'string' || searchId.length > 50) {
      return Response.json({ error: 'Invalid search_id' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'File too large (max 2 MB)' }, { status: 400 })
    }

    // Validate file type
    if (file.type && file.type !== 'application/json' && !file.name?.endsWith('.json')) {
      return Response.json({ error: 'Only JSON files allowed' }, { status: 400 })
    }

    // Parse uploaded JSON
    const content = await file.text()
    let uploadedResults: unknown
    try {
      uploadedResults = JSON.parse(content)
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Validate structure: must be an array
    if (!Array.isArray(uploadedResults)) {
      return Response.json({ error: 'JSON must be an array' }, { status: 400 })
    }

    if (uploadedResults.length === 0 || uploadedResults.length > MAX_RESULTS) {
      return Response.json({ error: `Array must have 1-${MAX_RESULTS} items` }, { status: 400 })
    }

    // Validate each result item has required fields and proper types
    for (const item of uploadedResults) {
      if (
        typeof item !== 'object' || item === null ||
        typeof item.company_name !== 'string' || !item.company_name.trim() ||
        typeof item.job_title !== 'string' || !item.job_title.trim() ||
        typeof item.job_url !== 'string' || !item.job_url.trim() ||
        typeof item.description !== 'string'
      ) {
        return Response.json(
          { error: 'Each item must have company_name, job_title, job_url (non-empty strings), and description' },
          { status: 400 }
        )
      }

      // Validate URL format
      try {
        const url = new URL(item.job_url)
        if (!['http:', 'https:'].includes(url.protocol)) {
          return Response.json({ error: 'job_url must use http or https protocol' }, { status: 400 })
        }
      } catch {
        return Response.json({ error: `Invalid URL: ${item.job_url.substring(0, 50)}` }, { status: 400 })
      }
    }

    const validResults = uploadedResults as Array<{
      company_name: string
      job_title: string
      job_url: string
      description: string
    }>

    const admin = createAdminClient()

    // Validate search exists
    const { data: search, error: searchError } = await admin
      .from('searches')
      .select('id')
      .eq('id', searchId)
      .single()

    if (searchError || !search) {
      return Response.json({ error: 'Search not found' }, { status: 404 })
    }

    // Remove any existing results for this search before adding new ones
    await admin.from('results').delete().eq('search_id', searchId)

    // Build new result rows with truncated field values
    const newResults = validResults.map((result, index) => ({
      id: nanoid(),
      search_id: searchId,
      company_name: result.company_name.trim().substring(0, 200),
      job_title: result.job_title.trim().substring(0, 200),
      job_url: result.job_url.trim().substring(0, 500),
      description: result.description.trim().substring(0, 2000),
      rank: index + 1
    }))

    // Insert new results
    await admin.from('results').insert(newResults)

    // Update search status
    await admin
      .from('searches')
      .update({ status: 'completed', total_results: newResults.length })
      .eq('id', searchId)

    return Response.json({
      success: true,
      message: `${validResults.length} results uploaded`
    })
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
