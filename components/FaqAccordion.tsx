'use client'

import { useState } from 'react'

interface FaqItem {
  q: string
  a: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#E8E0D4]/60 overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-black/5">
          <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left min-h-[44px]">
            <span className="font-semibold text-[#1A1A2E] text-sm sm:text-base pr-4">{item.q}</span>
            <svg className={`w-5 h-5 text-[#9CA3AF] flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 pb-5' : 'max-h-0'}`}>
            <p className="px-6 text-sm text-[#6B7280] leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
