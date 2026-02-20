import React from 'react';
import { Clock, ArrowRight, Terminal, Cpu } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import './Auctions.css';

const Auctions = () => {
    const navigate = useNavigate();
    const { auctions, loading } = useWallet();

    // Mock Live Activity Data
    const marketEvents = [
        { id: 1, text: "New bid: 15.20 ETH on <strong>Quant-X</strong>", time: "2m ago" },
        { id: 2, text: "<strong>Cyber-Scribe</strong> listing updated", time: "5m ago" },
        { id: 3, text: "Sale confirmed: <strong>Alpha-01</strong> for 42.5 ETH", time: "12m ago" },
        { id: 4, text: "New listing: <strong>Neural-Link</strong> by @vault", time: "18m ago" },
        { id: 5, text: "Auction closing: <strong>Data-Stream</strong> in 45m", time: "24m ago" },
    ];

    const soldItems = [
        { name: "Nova-Tech", price: "24.5 ETH" },
        { name: "Ghost-Protocol", price: "12.2 ETH" },
        { name: "Satoshi-Bot", price: "88.0 ETH" },
        { name: "Iron-Forge", price: "15.7 ETH" },
        { name: "Neon-Pulse", price: "31.4 ETH" },
    ];

    if (loading) {
        return (
            <div className="container" style={{ padding: '200px 0', textAlign: 'center' }}>
                <Terminal size={32} className="animate-pulse" style={{ margin: '0 auto 24px', opacity: 0.1 }} />
                <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#666', letterSpacing: '0.1em' }}>INITIALIZING MARKET FEED...</h2>
            </div>
        );
    }

    return (
        <>
            {/* Top Scrolling Sold Ticker */}
            <div className="sold-ticker-wrapper">
                <div className="sold-ticker">
                    {[...soldItems, ...soldItems].map((item, i) => (
                        <div key={i} className="sold-item">
                            <span>Recently Sold:</span>
                            <strong>{item.name}</strong>
                            <span>{item.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container auctions-container animate-fade-in-up">

                {/* Auction Header */}
                <div className="auctions-header">
                    <div className="market-status-bar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-dot"></span>
                            <span>Live Auctions</span>
                        </div>
                        <span style={{ margin: '0 8px', opacity: 0.2 }}>|</span>
                        <span>Total Volume: 1.4k Units</span>
                        <span style={{ margin: '0 8px', opacity: 0.2 }}>|</span>
                        <span>Average Sale: 12.4 ETH</span>
                        <span style={{ margin: '0 8px', opacity: 0.2 }}>|</span>
                        <span>Active Auctions: 42</span>
                    </div>

                    <h1 className="auctions-title">Premium Digital Auctions.</h1>
                    <p className="auctions-subtitle">
                        Bid on exclusive verified digital assets.
                        Each item is unique, secure, and ready for transfer.
                    </p>
                </div>

                <div className="market-layout">
                    {/* Main Ticker List */}
                    <div className="auctions-list">
                        {auctions.map((auction) => (
                            <div
                                key={auction.id}
                                onClick={() => navigate(`/auction/${auction.id}`)}
                                className="ticker-item"
                            >
                                <div className="live-badge">
                                    <span className="status-dot"></span>
                                    LIVE
                                </div>

                                <div className="ticker-icon">
                                    <Cpu size={20} style={{ opacity: 0.6 }} />
                                </div>

                                <div className="ticker-main">
                                    <h3 className="ticker-name">{auction.name}</h3>
                                    <span className="ticker-meta">{auction.role}</span>
                                </div>

                                <div className="ticker-tag">
                                    <Clock size={12} />
                                    Ending in {auction.timeLeft || '24h'}
                                </div>

                                <div className="ticker-price">
                                    <div className="price-header">
                                        <span className="price-lbl">Current High Bid</span>
                                    </div>
                                    <span className="price-current">{auction.highestBid} {auction.currency}</span>
                                </div>

                                <div className="ticker-action">
                                    <div className="ticker-arrow">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {auctions.length === 0 && (
                            <div style={{ padding: '80px 0', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <p style={{ color: '#666', fontSize: '14px' }}>No active auctions found at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Activity Feed */}
                    <aside className="activity-feed">
                        <div className="feed-header">
                            <span className="feed-title">Recent Happenings</span>
                            <div className="live-indicator">
                                <span className="status-dot" style={{ background: '#ff4d4d', border: 'none', boxShadow: 'none' }}></span>
                                UPDATING
                            </div>
                        </div>
                        <div className="event-list">
                            {marketEvents.map((event) => (
                                <div key={event.id} className="event-item">
                                    <div className="event-text" dangerouslySetInnerHTML={{ __html: event.text.replace('bid:', 'offer:').replace('Sale confirmed:', 'Purchase complete:') }}></div>
                                    <div className="event-time">{event.time}</div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default Auctions;
