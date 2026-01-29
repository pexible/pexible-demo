import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSearches, saveSearches } from '@/lib/storage'

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

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    if (paymentIntent.status === 'succeeded') {
      try {
        const searchesData = await getSearches()
        const idx = searchesData.searches.findIndex(s => s.id === search_id)
        if (idx !== -1) {
          searchesData.searches[idx].paid = true
          await saveSearches(searchesData)
        }
      } catch {
        // Storage may not be available on serverless
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, status: paymentIntent.status })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Zahlungsbestätigung' },
      { status: 500 }
    )
  }
}
