import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout', async (req, res) => {
  const { amount, donationMessage } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount parameter is required' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number in cents' });
  }

  logger.info(`Creating Stripe Checkout Session for amount: ${amount} cents, message: "${donationMessage || 'No message'}"`)

  const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Family of the Quran Donation',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donation-cancel`,
  });

  res.json({ url: session.url });
});

router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  logger.info(`Retrieving Stripe session: ${sessionId}`);

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  res.json({
    id: session.id,
    status: session.payment_status,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email,
    createdAt: new Date(session.created * 1000).toISOString(),
  });
});

export default router;
