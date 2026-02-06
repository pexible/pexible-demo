import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Rate limit: 5 payment intent creations per minute per IP
  const ip = getClientIp(req)
  const { limited } = rateLimit(`payment:${ip}`, 5, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte kurz.' },
      { status: 429 }
    )
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe ist nicht konfiguriert' },
      { status: 500 }
    )
  }

  // Require authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Nicht autorisiert' },
      { status: 401 }
    )
  }

  const stripe = new Stripe(secretKey)

  try {
    const { search_id } = await req.json()

    if (!search_id || typeof search_id !== 'string') {
      return NextResponse.json(
        { error: 'search_id ist erforderlich' },
        { status: 400 }
      )
    }

    // Verify the search belongs to the authenticated user
    const admin = createAdminClient()
    const { data: search } = await admin
      .from('searches')
      .select('id, user_id, paid')
      .eq('id', search_id)
      .single()

    if (!search || search.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Suche nicht gefunden' },
        { status: 404 }
      )
    }

    if (search.paid) {
      return NextResponse.json(
        { error: 'Diese Suche wurde bereits bezahlt' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4900, // 49.00 EUR in Cent
      currency: 'eur',
      metadata: { search_id, user_id: user.id },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Zahlung' },
      { status: 500 }
    )
  }
}
