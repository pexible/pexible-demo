'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { getScoreColor, getScoreLabel } from '@/lib/cv-score-utils'

// --- Types ---

interface ScoreCategory {
  score: number
  max: number
  reasoning: string
}

interface DimensionScore {
  total: number
  categories: Record<string, ScoreCategory>
}

interface AnalysisResult {
  language: string
  ats_score: DimensionScore
  content_score: DimensionScore
  tips: Array<{
    title: string
    description: string
    dimension: string
    category: string
    impact: string
  }>
  cv_text_token: string
  optimization_recommended: boolean
}

type AnalysisPhase = 'idle' | 'uploading' | 'reading' | 'analyzing' | 'scoring' | 'done' | 'error'

// --- Helpers ---

const ATS_CATEGORY_LABELS: Record<string, string> = {
  section_recognition: 'Sektionserkennung',
  structure_order: 'Struktur & Reihenfolge',
  formatting_consistency: 'Formatierung & Konsistenz',
  keywords_terminology: 'Keywords & Terminologie',
}

const CONTENT_CATEGORY_LABELS: Record<string, string> = {
  content_quality: 'Inhaltliche Qualität',
  completeness: 'Vollständigkeit',
  formal_quality: 'Formale Qualität',
  coherence_career: 'Kohärenz & Karrierestory',
}

// getScoreColor and getScoreLabel imported from @/lib/cv-score-utils

// --- Score Ring Component ---

function ScoreRing({ score, label, size = 140 }: { score: number; label: string; size?: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const color = getScoreColor(score)

  useEffect(() => {
    let frame: number
    const duration = 2000
    const start = performance.now()

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const offset = circumference - (displayScore / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8E0D4"
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-extrabold" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-[10px] sm:text-xs text-[#4A5568] font-medium mt-0.5">
            von 100
          </span>
        </div>
      </div>
      <p className="text-center mt-2 text-sm font-semibold" style={{ color }}>
        {getScoreLabel(score)}
      </p>
      <p className="text-center text-xs text-[#9CA3AF] mt-0.5">{label}</p>
    </div>
  )
}

// --- Category Bar Component ---

function CategoryBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = getScoreColor(pct)

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#1A1A2E] truncate">{label}</span>
          <span className="text-xs font-semibold text-[#4A5568] ml-2 shrink-0">{score}/{max}</span>
        </div>
        <div className="h-2 bg-[#E8E0D4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}

// --- Tip Card Component ---

function TipCard({ tip, index }: { tip: AnalysisResult['tips'][0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const impactColor = tip.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
  const dimensionLabel = tip.dimension === 'ats' ? 'ATS' : 'Inhalt'
  const dimensionColor = tip.dimension === 'ats' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-white rounded-xl border border-[#E8E0D4]/80 p-4 sm:p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#F5B731]/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-sm font-bold text-[#F5B731]">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-[#1A1A2E]">{tip.title}</h4>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${dimensionColor}`}>
              {dimensionLabel}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${impactColor}`}>
              {tip.impact === 'high' ? 'Hohe Wirkung' : 'Mittlere Wirkung'}
            </span>
          </div>
          {expanded && (
            <p className="mt-2 text-sm text-[#4A5568] leading-relaxed">{tip.description}</p>
          )}
          <span className="text-xs text-[#9CA3AF] mt-1 inline-block">
            {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-[#9CA3AF] shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )
}

// --- Loading Phase Component ---

function LoadingPhase({ phase }: { phase: AnalysisPhase }) {
  const phases = [
    { key: 'reading', label: 'PDF wird gelesen...' },
    { key: 'analyzing', label: 'Lebenslauf wird analysiert...' },
    { key: 'scoring', label: 'Bewertung wird erstellt...' },
  ]

  const currentIndex = phases.findIndex((p) => p.key === phase)

  return (
    <div className="flex flex-col items-center py-12">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#E8E0D4]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F5B731] animate-spin" />
      </div>

      {/* Phase steps */}
      <div className="space-y-3 w-full max-w-xs">
        {phases.map((p, i) => {
          const isActive = p.key === phase
          const isDone = currentIndex > i

          return (
            <div key={p.key} className="flex items-center gap-3">
              {isDone ? (
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5B731] animate-pulse" />
                </div>
              ) : (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D1C9BD]" />
                </div>
              )}
              <span className={`text-sm ${isActive ? 'text-[#1A1A2E] font-medium' : isDone ? 'text-[#9CA3AF]' : 'text-[#D1C9BD]'}`}>
                {p.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Main Page ---

export default function CvCheckPage() {
  const [phase, setPhase] = useState<AnalysisPhase>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Client-side validation
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Bitte lade eine PDF-Datei hoch.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Die Datei ist zu groß. Maximale Größe: 5 MB.')
      return
    }

    setErrorMessage(null)
    setResult(null)
    setPhase('uploading')

    // Simulate phases with timers while the request is in progress
    const phaseTimers: NodeJS.Timeout[] = []
    phaseTimers.push(setTimeout(() => setPhase('reading'), 300))
    phaseTimers.push(setTimeout(() => setPhase('analyzing'), 2500))
    phaseTimers.push(setTimeout(() => setPhase('scoring'), 7000))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/cv-check/analyze', {
        method: 'POST',
        body: formData,
      })

      phaseTimers.forEach(clearTimeout)

      if (!response.ok) {
        const data = await response.json()
        setErrorMessage(data.error || 'Ein Fehler ist aufgetreten.')
        setPhase('error')
        return
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
      setPhase('done')
    } catch {
      phaseTimers.forEach(clearTimeout)
      setErrorMessage('Ein Netzwerkfehler ist aufgetreten. Bitte versuche es erneut.')
      setPhase('error')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }, [handleFile])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setResult(null)
    setErrorMessage(null)
  }, [])

  const isLoading = phase !== 'idle' && phase !== 'done' && phase !== 'error'

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      <Navbar />
      <Breadcrumbs />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Kostenloser Lebenslauf-Check
          </h1>
          <p className="text-[#4A5568] text-base sm:text-lg max-w-2xl mx-auto">
            Lade deinen Lebenslauf hoch und erhalte sofort eine ATS- und Inhalts-Bewertung
            mit konkreten Verbesserungstipps.
          </p>
        </div>

        {/* Upload Area (visible when idle or error) */}
        {(phase === 'idle' || phase === 'error') && (
          <div className="max-w-xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-10 sm:p-14
                flex flex-col items-center justify-center text-center transition-all
                ${isDragging
                  ? 'border-[#F5B731] bg-[#F5B731]/5'
                  : 'border-[#D1C9BD] hover:border-[#F5B731] hover:bg-[#FEFCF8]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              <svg className="w-12 h-12 text-[#D1C9BD] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <p className="text-sm sm:text-base font-medium text-[#1A1A2E] mb-1">
                PDF hierher ziehen oder klicken
              </p>
              <p className="text-xs text-[#9CA3AF]">
                Maximale Dateigröße: 5 MB
              </p>

              <button
                type="button"
                className="mt-5 bg-[#F5B731] hover:bg-[#E8930C] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
              >
                PDF hochladen
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="mt-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL-verschlüsselt
              </span>
              <span>•</span>
              <span>Daten werden sofort gelöscht</span>
              <span>•</span>
              <span>DSGVO-konform</span>
            </div>

            {/* Privacy notice */}
            <p className="mt-4 text-center text-xs text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
              Dein Lebenslauf wird verschlüsselt übertragen. Zur Analyse wird der anonymisierte
              Text (ohne Name, E-Mail, Telefon, Adresse) an unseren KI-Partner übermittelt. Deine
              Kontaktdaten verlassen dabei nicht unseren Server. Nach der Analyse werden alle Daten
              sofort gelöscht.{' '}
              <Link href="/datenschutz" className="text-[#F5B731] hover:text-[#E8930C] transition-colors">
                Mehr erfahren
              </Link>
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
              <LoadingPhase phase={phase} />
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'done' && result && (
          <div className="space-y-6 animate-fade-in">
            {/* Score Card — Two Dimensions */}
            <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
              {/* Score Rings */}
              <div className="flex items-start justify-center gap-8 sm:gap-16 mb-8">
                <ScoreRing score={result.ats_score.total} label="ATS-Score" />
                <ScoreRing score={result.content_score.total} label="Inhalts-Score" />
              </div>

              {/* Category Breakdown — Two Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                {/* ATS Categories */}
                <div>
                  <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                    ATS-Kompatibilität
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(result.ats_score.categories).map(([key, cat]) => (
                      <CategoryBar
                        key={key}
                        label={ATS_CATEGORY_LABELS[key] || key}
                        score={cat.score}
                        max={cat.max}
                      />
                    ))}
                  </div>
                </div>

                {/* Content Categories */}
                <div>
                  <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                    Inhaltliche Qualität
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(result.content_score.categories).map(([key, cat]) => (
                      <CategoryBar
                        key={key}
                        label={CONTENT_CATEGORY_LABELS[key] || key}
                        score={cat.score}
                        max={cat.max}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Success Banner (only when optimization not recommended) */}
            {!result.optimization_recommended && (
              <div className="rounded-2xl border border-[#E5C46D]/40 bg-gradient-to-br from-[#FDF6E3] to-[#FBF0D1] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5B731]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-[#D4960B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1A2E] mb-1.5">
                      {result.language === 'en'
                        ? 'Excellent \u2013 your CV is already in great shape.'
                        : 'Hervorragend \u2013 dein Lebenslauf ist bereits stark aufgestellt.'}
                    </h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">
                      {result.language === 'en'
                        ? 'Our AI analysis shows that your CV scores above average for both ATS compatibility and content quality. We don\u2019t recommend a paid optimization in this case, as the added value would be minimal.'
                        : 'Unsere KI-Analyse zeigt, dass dein CV sowohl f\u00FCr ATS-Systeme als auch inhaltlich \u00FCberdurchschnittlich gut ist. Wir empfehlen in diesem Fall keine kostenpflichtige Optimierung, weil der Mehrwert zu gering w\u00E4re.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">
                Top 3 Verbesserungstipps
              </h2>
              <div className="space-y-3">
                {result.tips.map((tip, i) => (
                  <TipCard key={i} tip={tip} index={i} />
                ))}
              </div>
            </div>

            {result.optimization_recommended ? (
              <>
                {/* CTA: Optimize (standard flow) */}
                <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] rounded-2xl p-6 sm:p-8 text-white text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {result.language === 'en' ? 'Optimize your CV now' : 'CV jetzt optimieren lassen'}
                  </h3>
                  <p className="text-sm text-white/70 mb-5 max-w-md mx-auto">
                    {result.language === 'en'
                      ? 'Our AI optimizer rewrites your entire CV for maximum ATS compatibility and stronger content impact. You\u2019ll receive a professional PDF and Word document.'
                      : 'Unser KI-Optimierer \u00FCberarbeitet deinen gesamten Lebenslauf f\u00FCr maximale ATS-Kompatibilit\u00E4t und bessere inhaltliche Wirkung. Du erh\u00E4ltst ein professionelles PDF und Word-Dokument.'}
                  </p>
                  <Link
                    href={`/cv-check/optimize?token=${result.cv_text_token}&ats=${result.ats_score.total}&content=${result.content_score.total}`}
                    className="inline-block bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
                  >
                    {result.language === 'en' ? 'Optimize CV \u2013 just \u20AC3.99' : 'CV optimieren lassen \u2013 nur 3,99 \u20AC'}
                  </Link>
                  <p className="text-xs text-white/40 mt-3">
                    {result.language === 'en' ? 'One-time payment, no subscription' : 'Einmalzahlung, kein Abo'}
                  </p>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] px-5 py-2.5 rounded-xl border border-[#E8E0D4] hover:border-[#D1C9BD] transition-colors"
                  >
                    {result.language === 'en' ? 'Check another CV' : 'Neuen Lebenslauf pr\u00FCfen'}
                  </button>
                  <Link
                    href="/chat"
                    className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] px-5 py-2.5 transition-colors"
                  >
                    {result.language === 'en' ? 'Find matching jobs \u2192' : 'Passende Jobs finden \u2192'}
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Primary CTA: Job search (no upsell for excellent CVs) */}
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/chat"
                    className="inline-block bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
                  >
                    {result.language === 'en' ? 'Find matching jobs \u2192' : 'Passende Jobs finden \u2192'}
                  </Link>
                  <button
                    onClick={handleReset}
                    className="text-sm font-medium text-[#4A5568] hover:text-[#1A1A2E] px-5 py-2.5 rounded-xl border border-[#E8E0D4] hover:border-[#D1C9BD] transition-colors"
                  >
                    {result.language === 'en' ? 'Check another CV' : 'Neuen Lebenslauf pr\u00FCfen'}
                  </button>
                </div>

                {/* Subtle opt-in link for users who still want optimization */}
                <p className="text-center text-xs text-[#9CA3AF]">
                  {result.language === 'en' ? (
                    <>
                      Want to optimize your CV anyway?{' '}
                      <Link
                        href={`/cv-check/optimize?token=${result.cv_text_token}&ats=${result.ats_score.total}&content=${result.content_score.total}`}
                        className="text-[#9CA3AF] hover:text-[#4A5568] underline underline-offset-2 transition-colors"
                      >
                        Start paid optimization &rarr;
                      </Link>
                    </>
                  ) : (
                    <>
                      Du m\u00F6chtest deinen CV trotzdem optimieren lassen?{' '}
                      <Link
                        href={`/cv-check/optimize?token=${result.cv_text_token}&ats=${result.ats_score.total}&content=${result.content_score.total}`}
                        className="text-[#9CA3AF] hover:text-[#4A5568] underline underline-offset-2 transition-colors"
                      >
                        Kostenpflichtige Optimierung starten &rarr;
                      </Link>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
