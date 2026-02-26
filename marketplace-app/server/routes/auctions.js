const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const authenticateToken = require('../middleware/authMiddleware');
const trustEngine = require('../utils/trustEngine');

router.get('/', async (req, res) => {
    try {
        res.json(await Auction.find());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch auctions' });
    }
});

router.post('/bid', authenticateToken, async (req, res) => {
    const { auctionId, bidder, amount } = req.body;
    try {
        const auction = await Auction.findOne({ id: auctionId });
        if (auction) {
            auction.highestBid = amount;
            auction.highestBidder = bidder;
            auction.bids.push({ bidder, amount, time: new Date() });
            await auction.save();
            await trustEngine.updateTrustScore(bidder, 0.2, 'place_bid');
            return res.json({ success: true });
        }
        res.status(404).json({ error: 'Auction not found' });
    } catch (err) {
        res.status(500).json({ error: 'Bid failed' });
    }
});

module.exports = router;
