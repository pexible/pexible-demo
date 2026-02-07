// CV text anonymization: removes personal contact data before sending to LLM.
// Replaces name, email, phone, and address with placeholders.

export interface ContactData {
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
}

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

// Phone regex: international formats, German formats, with optional +, spaces, dashes, parens
const PHONE_REGEX = /(?:\+?\d{1,4}[\s\-./]?)?(?:\(?\d{2,5}\)?[\s\-./]?)?\d{3,4}[\s\-./]?\d{2,6}/g

// German postal code + city pattern (5 digits followed by a city name)
const ADDRESS_REGEX = /\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*/g

// Filter phone matches to avoid false positives (must be 7+ digits total)
function isLikelyPhone(match: string): boolean {
  const digitsOnly = match.replace(/\D/g, '')
  return digitsOnly.length >= 7 && digitsOnly.length <= 15
}

export function anonymizeCvText(text: string): {
  anonymizedText: string
  contactData: ContactData
} {
  const contactData: ContactData = {
    name: null,
    email: null,
    phone: null,
    address: null,
  }

  let anonymized = text

  // 1. Extract and replace email
  const emailMatch = anonymized.match(EMAIL_REGEX)
  if (emailMatch) {
    contactData.email = emailMatch[0]
    anonymized = anonymized.replace(EMAIL_REGEX, '[EMAIL]')
  }

  // 2. Extract and replace phone numbers
  const phoneMatches = anonymized.match(PHONE_REGEX)
  if (phoneMatches) {
    const likelyPhones = phoneMatches.filter(isLikelyPhone)
    if (likelyPhones.length > 0) {
      contactData.phone = likelyPhones[0]
      for (const phone of likelyPhones) {
        anonymized = anonymized.replace(phone, '[PHONE]')
      }
    }
  }

  // 3. Extract and replace address (PLZ + Ort)
  const addressMatch = anonymized.match(ADDRESS_REGEX)
  if (addressMatch) {
    contactData.address = addressMatch[0]
    for (const addr of addressMatch) {
      anonymized = anonymized.replace(addr, '[ADDRESS]')
    }
  }

  // 4. Extract name from the first non-empty line (common CV convention)
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length > 0) {
    const firstLine = lines[0]
    // Heuristic: first line is likely the name if it's short and doesn't contain
    // typical section headers or dates
    const isSectionHeader = /^(lebenslauf|curriculum|cv|resume|profil|kontakt|beruf|personal)/i.test(firstLine)
    const hasDate = /\d{4}/.test(firstLine)
    if (!isSectionHeader && !hasDate && firstLine.length <= 60) {
      contactData.name = firstLine
      anonymized = anonymized.replace(firstLine, '[NAME]')
      // Also replace just the last name if it appears elsewhere
      const nameParts = firstLine.split(/\s+/)
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1]
        if (lastName.length >= 3) {
          // Replace standalone occurrences of the last name (word boundary)
          const lastNameRegex = new RegExp(`\\b${escapeRegex(lastName)}\\b`, 'g')
          anonymized = anonymized.replace(lastNameRegex, '[NAME]')
        }
      }
    }
  }

  return { anonymizedText: anonymized, contactData }
}

export function reinsertContactData(text: string, contactData: ContactData): string {
  let result = text
  if (contactData.name) {
    result = result.replace(/\[NAME\]/g, contactData.name)
  }
  if (contactData.email) {
    result = result.replace(/\[EMAIL\]/g, contactData.email)
  }
  if (contactData.phone) {
    result = result.replace(/\[PHONE\]/g, contactData.phone)
  }
  if (contactData.address) {
    result = result.replace(/\[ADDRESS\]/g, contactData.address)
  }
  return result
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
