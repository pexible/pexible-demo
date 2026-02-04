'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Registration is now handled via the OTP login flow.
// /register redirects to /login since login and registration are the same.
export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 bg-[#F5B731] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  )
}
