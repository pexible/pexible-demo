'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@/lib/hooks/useUser'

// ─── Types ───

interface ConversationItem {
  id: string
  title: string
  status: 'active' | 'completed'
  search_id?: string
  message_count: number
  created_at: string
  updated_at: string
}

interface CvResultItem {
  id: string
  created_at: string
  original_score: number
  optimized_score: number
  status: string
  files_expire_at: string
  files_available: boolean
}

type Tab = 'all' | 'jobs' | 'cv'

// ─── Helpers ───

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Gerade eben'
  if (diffMin < 60) return `Vor ${diffMin} Min.`
  if (diffHr < 24) return `Vor ${diffHr} Std.`
  if (diffDay < 7) return `Vor ${diffDay} Tag${diffDay !== 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200'
  if (score >= 40) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

// ─── Main Page ───

export default function MeinPexPage() {
  const { user, isLoading: authLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mein-pex')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  return <DashboardView userName={user.firstName} />
}

// ─── Dashboard ───

function DashboardView({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [cvResults, setCvResults] = useState<CvResultItem[]>([])
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [loadingCv, setLoadingCv] = useState(true)
  const [canCreateNew, setCanCreateNew] = useState(true)

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations')
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
          setCanCreateNew(data.canCreateNew ?? true)
        }
      } catch { /* ignore */ }
      finally { setLoadingConvos(false) }
    }

    async function fetchCvResults() {
      try {
        const res = await fetch('/api/cv-check/results')
        if (res.ok) {
          const data = await res.json()
          setCvResults(data.results || [])
        }
      } catch { /* ignore */ }
      finally { setLoadingCv(false) }
    }

    fetchConversations()
    fetchCvResults()
  }, [])

  const isLoading = loadingConvos || loadingCv

  // Build unified activity feed for "all" tab, sorted by date
  const allItems: Array<{ type: 'conversation' | 'cv'; date: string; data: ConversationItem | CvResultItem }> = []
  for (const c of conversations) {
    allItems.push({ type: 'conversation', date: c.updated_at, data: c })
  }
  for (const r of cvResults) {
    allItems.push({ type: 'cv', date: r.created_at, data: r })
  }
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalConvos = conversations.length
  const totalCvChecks = cvResults.length
  const activeConvos = conversations.filter(c => c.status === 'active').length

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: 'all', label: 'Alle', count: totalConvos + totalCvChecks },
    { key: 'jobs', label: totalConvos === 1 ? 'Jobsuche' : 'Jobsuchen', count: totalConvos },
    { key: 'cv', label: 'Lebenslauf-Checks', count: totalCvChecks },
  ]

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">
            Hallo{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-[#4A5568] mt-1">
            Deine Aktivitäten auf einen Blick
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <StatCard
            icon={<ChatIcon />}
            label="Jobsuchen"
            value={isLoading ? '–' : String(totalConvos)}
            sublabel={activeConvos > 0 ? `${activeConvos} aktiv` : undefined}
          />
          <StatCard
            icon={<CvIcon />}
            label="Lebenslauf-Checks"
            value={isLoading ? '–' : String(totalCvChecks)}
          />
          <div className="col-span-2 sm:col-span-1">
            <QuickActions canCreateNewChat={canCreateNew} hasCvResults={totalCvChecks > 0} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-[#F5EFE3] rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#1A1A2E] shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1A1A2E]'
              }`}
            >
              {tab.label}
              {!isLoading && tab.count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-[#F5B731]' : 'text-[#9CA3AF]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === 'all' && (
              allItems.length === 0 ? (
                <EmptyState type="all" />
              ) : (
                <div className="space-y-3">
                  {allItems.map(item =>
                    item.type === 'conversation' ? (
                      <ConversationCard key={`conv-${(item.data as ConversationItem).id}`} conversation={item.data as ConversationItem} />
                    ) : (
                      <CvResultCard key={`cv-${(item.data as CvResultItem).id}`} result={item.data as CvResultItem} />
                    )
                  )}
                </div>
              )
            )}

            {activeTab === 'jobs' && (
              conversations.length === 0 ? (
                <EmptyState type="jobs" />
              ) : (
                <div className="space-y-3">
                  {conversations.map(c => (
                    <ConversationCard key={c.id} conversation={c} />
                  ))}
                </div>
              )
            )}

            {activeTab === 'cv' && (
              cvResults.length === 0 ? (
                <EmptyState type="cv" />
              ) : (
                <div className="space-y-3">
                  {cvResults.map(r => (
                    <CvResultCard key={r.id} result={r} />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

// ─── Cards ───

function ConversationCard({ conversation }: { conversation: ConversationItem }) {
  const isActive = conversation.status === 'active'

  return (
    <Link href={`/jobs/${conversation.id}`} className="block group">
      <div className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4 sm:p-5 hover:border-[#F5B731]/40 hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center">
            <ChatIcon className="w-5 h-5 text-[#1A1A2E]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-[#1A1A2E] truncate group-hover:text-[#F5B731] transition-colors">
                {conversation.title}
              </h3>
              <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#F5EFE3] text-[#4A5568] border border-[#E8E0D4]'
              }`}>
                {isActive ? 'Aktiv' : 'Abgeschlossen'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span>{timeAgo(conversation.updated_at)}</span>
              <span>{conversation.message_count} Nachricht{conversation.message_count !== 1 ? 'en' : ''}</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-[#D1C9BD] group-hover:text-[#F5B731] transition-colors flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function CvResultCard({ result }: { result: CvResultItem }) {
  const isOptimized = result.optimized_score > 0
  const displayScore = isOptimized ? result.optimized_score : result.original_score
  const dateStr = new Date(result.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Link href={`/cv-check/result/${result.id}`} className="block group">
      <div className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4 sm:p-5 hover:border-[#F5B731]/40 hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F5B731]/10 flex items-center justify-center">
            <CvIcon className="w-5 h-5 text-[#F5B731]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#F5B731] transition-colors">
                Lebenslauf-Check
              </h3>
              {isOptimized && (
                <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F5B731]/10 text-[#E8930C] border border-[#F5B731]/20">
                  Optimiert
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span>{dateStr}</span>
              {result.files_available && (
                <span className="text-emerald-600">Downloads verfügbar</span>
              )}
            </div>
          </div>
          {/* Score badge */}
          <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg border ${getScoreBg(displayScore)}`}>
            <span className={`text-lg font-bold ${getScoreColor(displayScore)}`}>
              {displayScore}
            </span>
            <span className="text-xs text-[#9CA3AF] ml-0.5">/100</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Stats & Quick Actions ───

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4">
      <div className="flex items-center gap-2 mb-2 text-[#9CA3AF]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#1A1A2E]">{value}</div>
      {sublabel && (
        <div className="text-xs text-emerald-600 mt-0.5">{sublabel}</div>
      )}
    </div>
  )
}

function QuickActions({ canCreateNewChat, hasCvResults }: { canCreateNewChat: boolean; hasCvResults: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4 flex flex-col gap-2">
      <span className="text-xs font-medium text-[#9CA3AF] mb-0.5">Schnellaktionen</span>
      <div className="flex gap-2">
        <Link
          href="/cv-check"
          className="flex-1 text-center text-xs font-semibold bg-[#F5B731] hover:bg-[#E8930C] text-white py-2.5 rounded-lg transition-colors"
        >
          Lebenslauf prüfen
        </Link>
        <Link
          href="/jobs"
          className={`flex-1 text-center text-xs font-semibold py-2.5 rounded-lg transition-colors ${
            canCreateNewChat
              ? 'bg-[#1A1A2E] hover:bg-[#2D2D44] text-white'
              : 'bg-[#F5EFE3] text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          Neue Jobsuche
        </Link>
      </div>
    </div>
  )
}

// ─── Empty States ───

function EmptyState({ type }: { type: 'all' | 'jobs' | 'cv' }) {
  const config = {
    all: {
      icon: <EmptyIcon />,
      title: 'Noch keine Aktivitäten',
      description: 'Starte jetzt deine erste Jobsuche oder prüfe deinen Lebenslauf.',
      cta: { label: 'Lebenslauf-Check starten', href: '/cv-check' },
    },
    jobs: {
      icon: <ChatIcon className="w-8 h-8 text-[#D1C9BD]" />,
      title: 'Noch keine Jobsuchen',
      description: 'Unser KI-Assistent hilft dir, den perfekten Job zu finden.',
      cta: { label: 'Jobsuche starten', href: '/jobs' },
    },
    cv: {
      icon: <CvIcon className="w-8 h-8 text-[#D1C9BD]" />,
      title: 'Noch keine Lebenslauf-Checks',
      description: 'Lass deinen Lebenslauf kostenlos analysieren und optimieren.',
      cta: { label: 'Lebenslauf-Check starten', href: '/cv-check' },
    },
  }

  const c = config[type]

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5EFE3] flex items-center justify-center">
        {c.icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A2E] mb-1">{c.title}</h3>
      <p className="text-sm text-[#4A5568] mb-6 max-w-xs mx-auto">{c.description}</p>
      <Link
        href={c.cta.href}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-[#F5B731] hover:bg-[#E8930C] text-white px-6 py-3 rounded-xl transition-colors"
      >
        {c.cta.label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

// ─── Loading Skeleton ───

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-[#E8E0D4]/80 p-5 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5EFE3]" />
            <div className="flex-1">
              <div className="h-4 bg-[#F5EFE3] rounded w-48 mb-2" />
              <div className="h-3 bg-[#F5EFE3] rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Icons ───

function ChatIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2z" />
    </svg>
  )
}

function CvIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg className="w-8 h-8 text-[#D1C9BD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 12.677a2.25 2.25 0 00-.1.661z" />
    </svg>
  )
}
