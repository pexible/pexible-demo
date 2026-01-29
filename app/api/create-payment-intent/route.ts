import { NextResponse } from 'next/server'
import Stripe from 'stripe'

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
    const { search_id } = await req.json()

    if (!search_id) {
      return NextResponse.json(
        { error: 'search_id ist erforderlich' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4900, // €49.00 in Cent
      currency: 'eur',
      metadata: { search_id },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Zahlung' },
      { status: 500 }
    )
  }
}
