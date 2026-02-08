import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HilfePage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-2">Hilfe & Feedback</h1>
        <p className="text-[#4A5568] mb-8">Wir helfen dir gerne weiter.</p>

        <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5EFE3] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#D1C9BD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">Kommt bald</h2>
          <p className="text-sm text-[#4A5568] max-w-xs mx-auto">
            Hier findest du bald Antworten auf häufige Fragen und kannst uns direkt kontaktieren.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
