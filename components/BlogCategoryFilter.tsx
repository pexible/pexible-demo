'use client'

import { useState } from 'react'

interface Article {
  slug: string
  category: string
  date: string
  readTime: string
  title: string
  excerpt: string
}

export default function BlogCategoryFilter({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Extract unique categories
  const categories = Array.from(new Set(articles.map(a => a.category)))

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category === activeCategory)
    : articles

  return (
    <>
      {/* Category filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs font-medium px-3.5 py-2 rounded-full transition-colors min-h-[36px] ${
            activeCategory === null
              ? 'bg-[#1A1A2E] text-white'
              : 'bg-white border border-[#E8E0D4]/80 text-[#4A5568] hover:border-[#F5B731]/40 hover:text-[#1A1A2E]'
          }`}
        >
          Alle
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-medium px-3.5 py-2 rounded-full transition-colors min-h-[36px] ${
              activeCategory === cat
                ? 'bg-[#F5B731] text-[#1A1A2E]'
                : 'bg-white border border-[#E8E0D4]/80 text-[#4A5568] hover:border-[#F5B731]/40 hover:text-[#1A1A2E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <article key={article.slug} id={article.slug} className="group bg-white rounded-2xl border border-[#E8E0D4]/60 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
              <div className="h-32 sm:h-40 bg-gradient-to-br from-[#FEF3D0] to-[#FDEDB8] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#E8930C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[#F5B731] bg-[#F5B731]/10 px-2.5 py-1 rounded-full">{article.category}</span>
                  <span className="text-xs text-[#9CA3AF]">{article.readTime}</span>
                </div>
                <h3 className="font-bold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors leading-snug mb-2">{article.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">{article.date}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors">
                    Lesen
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-[#9CA3AF]">Keine Artikel in dieser Kategorie.</p>
        </div>
      )}
    </>
  )
}
