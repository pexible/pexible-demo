import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const searchId = formData.get('search_id') as string

    if (!file || !searchId) {
      return Response.json({ error: 'File and search_id required' }, { status: 400 })
    }

    // Parse uploaded JSON
    const content = await file.text()
    const uploadedResults = JSON.parse(content) as Array<{
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

    // Build new result rows
    const newResults = uploadedResults.map((result, index) => ({
      id: nanoid(),
      search_id: searchId,
      company_name: result.company_name,
      job_title: result.job_title,
      job_url: result.job_url,
      description: result.description,
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
      message: `${uploadedResults.length} results uploaded for search ${searchId}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
