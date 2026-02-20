import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Cpu, Shield, Zap, Activity, Terminal, Code, Database, ChevronRight, Github, FileCode, Globe, ShieldCheck, User } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import './Auctions.css';

const AuctionDetails = () => {
    const { id } = useParams();
    const { isConnected, placeBid, auctions, loading } = useWallet();
    const [isBidding, setIsBidding] = useState(false);
    const [activeTab, setActiveTab] = useState('specs');
    const [terminalLines, setTerminalLines] = useState([
        "> Initializing secure handshake...",
        "> Verifying ownership signature...",
        "> Connection established at 10:42:01",
        "> Monitoring neural activity patterns..."
    ]);

    const auction = auctions.find(a => a.id.toString() === id.toString());

    // Mock terminal activity
    useEffect(() => {
        const interval = setInterval(() => {
            const activities = [
                "> Processing block #928341...",
                "> Encrypting metadata storage...",
                "> Neural path optimized (0.22ms)",
                "> Status: Active and Monitoring",
                "> Incoming WebSocket frame received",
                "> Running validation check 7/7",
            ];
            const randomLine = activities[Math.floor(Math.random() * activities.length)];
            setTerminalLines(prev => [...prev.slice(-5), randomLine]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Mock Bid History
    const bidHistory = useMemo(() => {
        if (!auction) return [];
        return [
            { id: 1, bidder: "0x7a...4e21", amount: 14.50, time: "14:02 UTC" },
            { id: 2, bidder: "0x8b...9f12", amount: 14.10, time: "13:45 UTC" },
            { id: 3, bidder: "0x3c...2a55", amount: 13.80, time: "12:30 UTC" },
            { id: 4, bidder: "0x1d...8b99", amount: 12.50, time: "10:15 UTC" },
        ].map(b => ({
            ...b,
            amount: auction ? (parseFloat(auction.highestBid) - (b.id - 1) * (parseFloat(auction.highestBid) * 0.05)).toFixed(2) : b.amount
        }));
    }, [auction]);

    if (loading) return null;

    if (!auction) {
        return (
            <div className="container" style={{ padding: '200px 0', textAlign: 'center' }}>
                <h1 style={{ color: '#fff' }}>404: ASSET_MISSING</h1>
                <Link to="/auctions" className="btn btn-outline" style={{ marginTop: '20px' }}>RETURN</Link>
            </div>
        );
    }

    return (
        <div className="details-container animate-fade-in-up">
            <nav style={{ marginBottom: '48px' }}>
                <Link to="/auctions" className="back-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', fontWeight: '700' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Marketplace</span>
                </Link>
            </nav>

            <header className="details-header-v5">
                <div className="header-left-v5">
                    <div className="id-tag-v5">AUCTION_SESSION #{(auction.id % 1000).toString().padStart(3, '0')}</div>
                    <h1 className="agent-title-v5">{auction.name}</h1>
                    <div className="arch-line-v5">
                        <Clock size={14} color="#ff4d4d" />
                        <span style={{ color: '#ff4d4d' }}>ENDING_IN: <strong>{auction.timeLeft || '24:00:00'}</strong></span>
                        <div className="trust-meter-v5">
                            <Activity size={12} />
                            <span>LIVE_MONITORING</span>
                        </div>
                    </div>
                </div>

                <div className="header-right-v5">
                    <div className="price-card-v5">
                        <span className="price-label-v5">CURRENT_HIGH_BID</span>
                        <div className="price-value-v5">
                            <Zap size={24} className="zap-glow" fill="currentColor" />
                            <span>{auction.highestBid} {auction.currency || 'ETH'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="details-dashboard-v5">
                {/* Main Content Area */}
                <div className="dashboard-content-v5">
                    <div className="description-box-v5">
                        <div className="box-label-v5">ASSET_CLASSIFICATION</div>
                        <p>{auction.description || "High-performance autonomous logic engine optimized for high-frequency workspace navigation and neural data processing."}</p>
                    </div>

                    <div className="tabs-container-v5">
                        <div className="tabs-list-v5">
                            <button className={`tab-trigger-v5 ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>TECHNICAL_SPECS</button>
                            <button className={`tab-trigger-v5 ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>NODE_ARCHITECTURE</button>
                        </div>

                        <div className="tab-panel-v5">
                            {activeTab === 'specs' ? (
                                <div className="specs-grid-v5">
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">MODEL_KERNEL</span>
                                        <span className="tile-val">LLAMA-3 (STABLE)</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">LATENCY</span>
                                        <span className="tile-val">~240MS</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">PROTOCOL</span>
                                        <span className="tile-val">AES-256 E2E</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">AUTH_LEVEL</span>
                                        <span className="tile-val">FULL_OWNERSHIP</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="docs-terminal-v5">
                                    <div className="terminal-top">
                                        <Terminal size={12} />
                                        <span>NETWORK_LOGS_STREAM</span>
                                    </div>
                                    <div className="terminal-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                        {terminalLines.map((line, i) => (
                                            <code key={i} style={{ opacity: 0.5 + (i * 0.1) }}>{line}</code>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Market Activity Module */}
                    <div className="market-history-module">
                        <div className="module-label-v5">NETWORK_TRANSACTIONS</div>
                        <div className="bid-history-grid">
                            {bidHistory.map((bid, i) => (
                                <div key={i} className="bid-history-row">
                                    <div className="bidder-v5">
                                        <span className="bid-time-v5">{bid.time}</span>
                                        <span className="bid-addr-v5">{bid.bidder}</span>
                                    </div>
                                    <div className="bid-amt-v5">
                                        {bid.amount} {auction.currency || 'ETH'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Market Hub */}
                <aside className="dashboard-sidebar-v5">
                    <div className="identity-module-v5" style={{ background: 'rgba(0,0,0,0.4)', position: 'relative', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
                        <div className="visual-scan-line"></div>
                        <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    width: `${i * 120}px`,
                                    height: `${i * 120}px`,
                                    border: '1px dashed var(--brand-primary)',
                                    borderRadius: '50%',
                                    animation: `rotate ${20 + i * 10}s linear infinite`,
                                    animationDirection: i % 2 === 0 ? 'reverse' : 'normal'
                                }}></div>
                            ))}
                        </div>
                        <div className="visual-core-v5">
                            <Cpu size={64} className="zap-glow" />
                        </div>
                    </div>

                    <div className="action-panel-v5">
                        <button
                            className="primary-buy-btn-v5"
                            disabled={isBidding}
                            style={{ background: 'var(--brand-primary)', color: '#000' }}
                            onClick={async () => {
                                if (!isConnected) return alert('Registry Access: Please Sign In.');
                                setIsBidding(true);
                                const nextBid = (parseFloat(auction.highestBid) * 1.05).toFixed(2);
                                const res = await placeBid(auction.id, nextBid);
                                setIsBidding(false);
                                if (!res.success) alert(res.error || 'Transaction failed.');
                            }}
                        >
                            <Zap size={18} fill="currentColor" />
                            <span>{isBidding ? 'TRANSMITTING...' : 'PLACE NEXT BID'}</span>
                        </button>

                        <div className="bid-intel-v5">
                            <span>MIN_INCREMENT: 5.0%</span>
                            <span>VERIFIED_BLOCKCHAIN_ASSET</span>
                        </div>

                        <div className="utility-links-v5">
                            <Link to="/auctions" className="util-link-v5"><ArrowLeft size={16} /> EXIT MARKET</Link>
                            <div className="util-link-v5" style={{ cursor: 'help' }}><Shield size={16} /> SECURITY</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AuctionDetails;
