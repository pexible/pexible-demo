import { NextRequest } from 'next/server'
import { getSearches, saveSearches, getResults, saveResults, type Result } from '@/lib/storage'
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

    // Validate search exists
    const searchesData = await getSearches()
    const searchIndex = searchesData.searches.findIndex(s => s.id === searchId)
    
    if (searchIndex === -1) {
      return Response.json({ error: 'Search not found' }, { status: 404 })
    }

    // Save results
    const resultsData = await getResults()
    
    uploadedResults.forEach((result, index) => {
      const newResult: Result = {
        id: nanoid(),
        search_id: searchId,
        company_name: result.company_name,
        job_title: result.job_title,
        job_url: result.job_url,
        description: result.description,
        rank: index + 1
      }
      resultsData.results.push(newResult)
    })

    await saveResults(resultsData)

    // Update search status
    searchesData.searches[searchIndex].status = 'completed'
    searchesData.searches[searchIndex].total_results = uploadedResults.length
    await saveSearches(searchesData)

    return Response.json({
      success: true,
      message: `${uploadedResults.length} results uploaded for search ${searchId}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
