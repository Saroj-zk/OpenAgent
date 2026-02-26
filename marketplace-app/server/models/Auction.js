const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    bidder: String,
    amount: String,
    time: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    seller: String,
    highestBid: String,
    highestBidder: String,
    endTime: Date,
    active: { type: Boolean, default: true },
    settled: { type: Boolean, default: false },
    bids: [bidSchema]
}, { collection: 'auctions' });

module.exports = mongoose.model('Auction', auctionSchema);
