import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe ist nicht konfiguriert' },
      { status: 500 }
    )
  }

  const stripe = new Stripe(secretKey)

  try {
    const { payment_intent_id, search_id } = await req.json()

    if (!payment_intent_id || !search_id) {
      return NextResponse.json(
        { error: 'payment_intent_id und search_id sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate input format to prevent injection of unexpected values
    if (typeof payment_intent_id !== 'string' || typeof search_id !== 'string') {
      return NextResponse.json(
        { error: 'Ungültige Parameter' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    // Verify that the PaymentIntent's metadata matches the claimed search_id.
    // This prevents IDOR: an attacker cannot unlock an arbitrary search
    // by providing a valid payment_intent_id that belongs to a different search.
    if (paymentIntent.metadata?.search_id !== search_id) {
      return NextResponse.json(
        { error: 'Zahlungszuordnung ungültig' },
        { status: 403 }
      )
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        const admin = createAdminClient()
        await admin.from('searches').update({ paid: true }).eq('id', search_id)
      } catch {
        // Storage may not be available on serverless
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, status: paymentIntent.status })
  } catch {
    return NextResponse.json(
      { error: 'Fehler bei der Zahlungsbestätigung' },
      { status: 500 }
    )
  }
}
