import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key'

export const stripePromise = loadStripe(stripePublishableKey)

// Mock Stripe checkout for demo — replace with real Stripe checkout session from your backend
export const redirectToCheckout = async (plan) => {
  const stripe = await stripePromise
  
  return { error: null }
}

export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    interval: 'month',
    savings: null,
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    price: 89.99,
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    interval: 'year',
    savings: '25%',
    monthlyEquiv: 7.50,
  }
}
