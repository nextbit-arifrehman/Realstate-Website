// controllers/offerController.js

const Offer = require('../models/Offer');
const Property = require('../models/Property');
const User = require('../models/User');

// User makes an offer for a property (User only)
exports.makeOffer = async (req, res) => {
  try {
    const {
      propertyId,
      offerAmount,
      buyingDate,
    } = req.body;

    const buyerUid = req.user.uid;
    const buyer = await User.findByUid(req.db, buyerUid);

    // Validation: only 'user' role can buy
    if (!buyer || buyer.role !== 'user') {
      return res.status(403).json({ error: 'Only users can make offers' });
    }

    const property = await Property.getPropertyById(req.db, propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check offerAmount within price range
    if (offerAmount < property.priceRange.min || offerAmount > property.priceRange.max) {
      return res.status(400).json({ error: 'Offer amount must be within the price range' });
    }

    const offer = await Offer.create(req.db, {
      propertyId,
      propertyTitle: property.title,
      propertyLocation: property.location,
      agentUid: property.agentUid,
      agentName: property.agentName,
      buyerUid,
      buyerEmail: buyer.email,
      buyerName: buyer.displayName,
      offerAmount,
      buyingDate,
      status: 'pending',
    });

    res.status(201).json({ message: 'Offer made successfully', offer });
  } catch (error) {
    console.error('Make offer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// User: get all offers made by logged-in user
exports.getMyOffers = async (req, res) => {
  try {
    const buyerUid = req.user.uid;
    const offers = await Offer.getOffersByBuyerUid(req.db, buyerUid);

    res.json(offers);
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Agent: get all offers made for agent's properties (requested/offered properties)
exports.getRequestedOffers = async (req, res) => {
  try {
    const agentUid = req.user.uid;
    const offers = await Offer.getOffersByAgentUid(req.db, agentUid);

    res.json(offers);
  } catch (error) {
    console.error('Get requested offers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Agent: get all sold properties by agent
exports.getSoldPropertiesByAgent = async (req, res) => {
  try {
    const agentUid = req.user.uid;
    const soldOffers = await Offer.getSoldOffersByAgentUid(req.db, agentUid);

    res.json(soldOffers);
  } catch (error) {
    console.error('Get sold properties by agent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Agent: get total sold amount by agent
exports.getTotalSoldAmountByAgent = async (req, res) => {
  try {
    const agentUid = req.user.uid;
    const totalSoldAmount = await Offer.getTotalSoldAmountByAgentUid(req.db, agentUid);

    res.json({ totalSoldAmount });
  } catch (error) {
    console.error('Get total sold amount by agent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Agent: accept or reject an offer
exports.respondToOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const { action } = req.body; // 'accept' or 'reject'

    console.log('Respond to offer - offerId:', offerId, 'action:', action);

    if (!offerId || offerId === 'undefined') {
      return res.status(400).json({ error: 'Invalid offer ID' });
    }

    const offer = await Offer.getOfferById(req.db, offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Only the agent who owns the property can respond
    if (offer.agentEmail !== req.user.email) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: 'Offer already responded' });
    }

    if (action === 'accept') {
      // Accept this offer
      await Offer.updateOfferStatus(req.db, offerId, 'accepted');

      // Reject all other offers for this property
      await Offer.updateManyOffers(
        req.db,
        { propertyId: offer.propertyId, _id: { $ne: offer._id } },
        { $set: { status: 'rejected' } }
      );

      const updatedOffer = await Offer.getOfferById(req.db, offerId);
      res.json({ message: 'Offer accepted', offer: updatedOffer });
    } else if (action === 'reject') {
      await Offer.updateOfferStatus(req.db, offerId, 'rejected');
      const updatedOffer = await Offer.getOfferById(req.db, offerId);
      res.json({ message: 'Offer rejected', offer: updatedOffer });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Respond to offer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// User: mark offer as paid (payment completed)
exports.markOfferAsBought = async (req, res) => {
  try {
    const offerId = req.params.id;
    const { transactionId } = req.body;

    const offer = await Offer.getOfferById(req.db, offerId);
    if (offer.buyerUid !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (offer.status !== 'accepted') {
      return res.status(400).json({ error: 'Offer not accepted yet' });
    }

    await Offer.updateOffer(req.db, offerId, { status: 'bought', transactionId });

    res.json({ message: 'Payment completed, offer marked as bought', offer });
  } catch (error) {
    console.error('Mark offer paid error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
