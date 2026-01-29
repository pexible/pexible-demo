'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'

interface RegistrationData {
  email: string
  first_name: string
  job_title: string
  postal_code: string
}

interface RegistrationModalProps {
  isOpen: boolean
  data: RegistrationData | null
  onClose: () => void
  onSuccess: (result: { search_id: string; first_name: string; total_results: number; results: Array<{ company_name: string; job_title: string; job_url: string; description: string }> }) => void
}

function RegistrationModal({ isOpen, data, onClose, onSuccess }: RegistrationModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    if (!data) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          password
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Fehler bei der Registrierung')
        setIsLoading(false)
        return
      }

      onSuccess({ search_id: result.search_id, first_name: result.first_name, total_results: result.total_results, results: result.results })
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !data) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sichere Registrierung</h2>
          <p className="text-sm text-gray-600 mt-1">
            Erstelle dein Passwort, um deine Jobsuche zu starten
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Deine Suchdaten:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Stelle:</span> {data.job_title}</p>
            <p><span className="font-medium">PLZ:</span> {data.postal_code}</p>
            <p><span className="font-medium">Name:</span> {data.first_name}</p>
            <p><span className="font-medium">Email:</span> {data.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Passwort wiederholen"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Wird erstellt...' : 'Account erstellen & Suche starten'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Mit der Registrierung akzeptierst du unsere AGB und Datenschutzrichtlinien.
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check for registration modal trigger in tool invocations
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
      for (const invocation of lastMessage.toolInvocations) {
        if (
          invocation.toolName === 'request_registration' &&
          invocation.state === 'result' &&
          invocation.result?.action === 'show_registration_modal'
        ) {
          setRegistrationData(invocation.result.data)
          setShowModal(true)
        }
      }
    }
  }, [messages])

  const handleRegistrationSuccess = async (result: { search_id: string; first_name: string; total_results: number; results: Array<{ company_name: string; job_title: string; job_url: string; description: string }> }) => {
    setShowModal(false)
    setRegistrationData(null)

    const freemium = result.results.slice(0, 3)
    const locked = result.results.slice(3)

    const freemiumText = freemium.map((r, i) =>
      `${i + 1}. ${r.company_name} - ${r.job_title} (${r.job_url})`
    ).join('\n')

    const lockedText = locked.map((r, i) =>
      `${i + 4}. ${r.company_name} - ${r.job_title} (${r.job_url}) - ${r.description}`
    ).join('\n')

    // The marker separates the user-visible part from AI-only data
    await append({
      role: 'user',
      content: `Meine Registrierung war erfolgreich! Bitte zeige mir meine Ergebnisse.\n<!--RESULTS_DATA\nSearch-ID: ${result.search_id}\nSUCHERGEBNISSE (${result.total_results} Treffer gefunden):\n\nKostenlose Vorschau (3 von ${result.total_results}):\n${freemiumText}\n\nGESPERRTE ERGEBNISSE (nur nach Zahlung anzeigen):\n${lockedText}\n\nZeige die 3 kostenlosen Ergebnisse und biete an, die restlichen ${locked.length} Treffer für 49€ freizuschalten. Zeige die gesperrten Ergebnisse ERST nach erfolgreicher Zahlung über create_payment.\nRESULTS_DATA-->`
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">pexible</h1>
        <p className="text-sm text-gray-600">Dein persönlicher Job-Makler</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <div className="text-6xl mb-4">👋</div>
              <p className="text-lg">Willkommen bei pexible!</p>
              <p className="text-sm mt-2">Dein Job-Makler hilft dir, passende Stellen zu finden.</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content.includes('<!--RESULTS_DATA')
                    ? message.content.split('<!--RESULTS_DATA')[0].trim()
                    : message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Schreibe eine Nachricht..."
              className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-full transition-colors"
            >
              Senden
            </button>
          </div>
        </form>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showModal}
        data={registrationData}
        onClose={() => {
          setShowModal(false)
          setRegistrationData(null)
        }}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
