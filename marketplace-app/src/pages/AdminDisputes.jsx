import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Search, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Link } from 'react-router-dom';
import './AdminDisputes.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const AdminDisputes = () => {
    const { isConnected, username, account } = useWallet();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!isConnected || !username) {
            setLoading(false);
            return;
        }

        fetchDisputes();
    }, [isConnected, username]);

    const fetchDisputes = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/disputes`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDisputes(data);
            }
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, actionStr) => {
        if (!window.confirm(`Are you sure you want to ${actionStr} this dispute? This action is irreversible and heavily impacts Trust Scores.`)) return;

        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/api/admin/disputes/${id}/${actionStr}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setDisputes(prev => prev.filter(d => d._id !== id));
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to execute arbitration action.');
        } finally {
            setActionLoading(null);
        }
    };

    const ADMIN_WALLET = '0x9527c9fd391ccd48f7278fe7c7c09b786a0bb832'.toLowerCase();
    const isAdmin = account && account.toLowerCase() === ADMIN_WALLET;

    if (!isConnected || !username || !isAdmin) {
        return (
            <div className="admin-disputes-container" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                <h2>ADMIN_ACCESS_REQUIRED</h2>
                <p style={{ color: '#888', marginTop: '12px' }}>Please connect your wallet and authenticate to access the arbitration panel.</p>
            </div>
        );
    }

    return (
        <div className="admin-disputes-container animate-fade-in-up">
            <header className="admin-header">
                <h1><ShieldAlert size={28} color="#ff4d4d" /> ARBITRATION_DASHBOARD</h1>
                <p>Review & resolve active marketplace escrow disputes. Your decisions permanently alter builder Trust Scores.</p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>LOADING_DISPUTE_LEDGER...</div>
            ) : disputes.length === 0 ? (
                <div className="empty-state">
                    <ShieldAlert size={48} color="#444" />
                    <h2>NO_ACTIVE_DISPUTES</h2>
                    <p>The marketplace network is currently operating nominally with 0 active escrow conflicts.</p>
                </div>
            ) : (
                <div className="disputes-grid">
                    {disputes.map(dispute => {
                        const date = new Date(dispute.disputeDate).toLocaleString();

                        return (
                            <div key={dispute._id} className="dispute-card">
                                <div className="dispute-card-header">
                                    <div className="dispute-meta">
                                        <div className="meta-item">
                                            <span className="label">TX_HASH</span>
                                            <span className="value">
                                                {dispute.txHash ? `${dispute.txHash.slice(0, 8)}...${dispute.txHash.slice(-6)}` : 'OFF_CHAIN_SEED'}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">AGENT_ID</span>
                                            <span className="value">
                                                <Link to={`/agent/${dispute.agentId}`} target="_blank" className="agent-name-tag">
                                                    {dispute.agentName} <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                                                </Link>
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">DATE_FLAGGED</span>
                                            <span className="value">{date}</span>
                                        </div>
                                    </div>
                                    <div className="dispute-card-actions">
                                        <button
                                            className={`action-btn btn-resolve ${actionLoading === dispute._id ? 'btn-disabled' : ''}`}
                                            onClick={() => handleAction(dispute._id, 'resolve')}
                                            disabled={actionLoading === dispute._id}
                                            title="Refund Buyer, Slash Seller"
                                        >
                                            <CheckCircle size={16} />
                                            APPROVE (BUYER WINS)
                                        </button>
                                        <button
                                            className={`action-btn btn-reject ${actionLoading === dispute._id ? 'btn-disabled' : ''}`}
                                            onClick={() => handleAction(dispute._id, 'reject')}
                                            disabled={actionLoading === dispute._id}
                                            title="Pay Seller, Slash Buyer"
                                        >
                                            <XCircle size={16} />
                                            REJECT (SELLER WINS)
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '40px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>DISPUTING_BUYER</span>
                                        <div style={{ padding: '8px 12px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '6px', color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}>
                                            @{dispute.disputedBy}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>ACCUSED_SELLER</span>
                                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}>
                                            @{dispute.seller}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminDisputes;
