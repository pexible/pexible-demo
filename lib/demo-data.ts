import { nanoid } from 'nanoid'

interface Result {
  id: string
  search_id: string
  company_name: string
  job_title: string
  job_url: string
  description: string
  rank: number
}

export const DEMO_COMPANIES = [
  { name: 'Siemens AG', domain: 'siemens.com' },
  { name: 'BMW Group', domain: 'bmw.com' },
  { name: 'SAP SE', domain: 'sap.com' },
  { name: 'Deutsche Bank', domain: 'deutsche-bank.de' },
  { name: 'Bosch', domain: 'bosch.com' },
  { name: 'Allianz', domain: 'allianz.com' },
  { name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
  { name: 'Volkswagen', domain: 'volkswagen.de' },
  { name: 'BASF', domain: 'basf.com' },
  { name: 'Bayer AG', domain: 'bayer.com' },
]

export function generateDemoResults(searchId: string, jobTitle: string, postalCode: string): Result[] {
  const shuffled = [...DEMO_COMPANIES].sort(() => Math.random() - 0.5)
  const count = 7 + Math.floor(Math.random() * 4)
  return shuffled.slice(0, count).map((company, index) => ({
    id: nanoid(),
    search_id: searchId,
    company_name: company.name,
    job_title: jobTitle,
    job_url: `https://careers.${company.domain}/jobs/${nanoid(8)}`,
    description: `${jobTitle} gesucht in ${postalCode}. ${company.name} bietet eine spannende Position mit attraktiven Konditionen.`,
    rank: index + 1
  }))
}
