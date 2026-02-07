import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { retrieveToken } from '@/lib/cv-token-store'

export async function POST(req: Request) {
  // Rate limit: 5 checkout creations per minute per IP
  const ip = getClientIp(req)
  const { limited } = rateLimit(`cv-checkout:${ip}`, 5, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte kurz.' },
      { status: 429 }
    )
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Zahlungssystem ist nicht konfiguriert.' },
      { status: 500 }
    )
  }

  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Bitte melde dich an, um fortzufahren.' },
      { status: 401 }
    )
  }

  try {
    const { cv_text_token, original_score, tips } = await req.json()

    if (!cv_text_token || typeof cv_text_token !== 'string') {
      return NextResponse.json(
        { error: 'cv_text_token ist erforderlich.' },
        { status: 400 }
      )
    }

    // Verify token exists and hasn't expired
    const tokenEntry = await retrieveToken(cv_text_token)
    if (!tokenEntry) {
      return NextResponse.json(
        { error: 'Deine Sitzung ist abgelaufen. Bitte lade deinen Lebenslauf erneut hoch.' },
        { status: 410 }
      )
    }

    const stripe = new Stripe(secretKey)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 399, // 3.99 EUR in cents
      currency: 'eur',
      metadata: {
        type: 'cv_optimization',
        user_id: user.id,
        cv_text_token,
        original_score: String(original_score?.total ?? ''),
      },
      automatic_payment_methods: { enabled: true },
      description: 'pexible CV-Optimierung',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch {
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Zahlung.' },
      { status: 500 }
    )
  }
}
