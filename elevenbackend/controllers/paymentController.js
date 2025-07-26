const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Offer = require('../models/Offer');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, offerId } = req.body; // amount in dollars

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be a positive number' });
    }

    if (!offerId) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    // Verify offer exists and is accepted
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.status !== 'accepted') {
      return res.status(400).json({ error: 'Only accepted offers can be paid for' });
    }

    if (offer.buyerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Unauthorized to pay for this offer' });
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        offerId: offerId,
        userId: req.user.id,
        propertyTitle: offer.propertyTitle,
        buyerEmail: offer.buyerEmail
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, offerId } = req.body;

    if (!paymentIntentId || !offerId) {
      return res.status(400).json({ error: 'Payment Intent ID and Offer ID are required' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update offer status to 'bought'
    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { 
        status: 'bought',
        transactionId: paymentIntentId,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Hide property from public listings after being sold
    // Update property status to sold/unavailable so it doesn't appear in general listings
    try {
      const Property = require('../models/Property');
      await Property.findByIdAndUpdate(
        offer.propertyId,
        { 
          status: 'sold',
          soldAt: new Date(),
          soldTo: offer.buyerEmail
        }
      );
    } catch (error) {
      console.error('Error updating property status after sale:', error);
      // Don't fail the payment confirmation if property update fails
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and offer updated',
      offer: offer
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
};