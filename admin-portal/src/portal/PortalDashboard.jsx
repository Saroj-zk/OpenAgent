import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Bot,
    ShoppingCart,
    Activity,
    LogOut,
    Search,
    RefreshCw,
    TrendingUp,
    Shield
} from 'lucide-react';
import './Portal.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const PortalDashboard = () => {
    const [stats, setStats] = useState({ agents: 0, users: 0, sales: 0, volume: '0 ETH' });
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('ledger');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('portalToken');
        if (!token) {
            navigate('/portal/login');
            return;
        }
        fetchData(token);
    }, []);

    const fetchData = async (token) => {
        setRefreshing(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [statsRes, usersRes, purchaseRes] = await Promise.all([
                fetch(`${API_URL}/api/portal/data/stats`, { headers }),
                fetch(`${API_URL}/api/portal/data/users`, { headers }),
                fetch(`${API_URL}/api/portal/data/purchases`, { headers })
            ]);

            if (statsRes.status === 401) {
                handleLogout();
                return;
            }

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (purchaseRes.ok) setPurchases(await purchaseRes.json());
        } catch (err) {
            console.error("Portal Data Sync Error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleResolve = async (id, action) => {
        try {
            await fetch(`${API_URL}/api/portal/data/disputes/${id}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('portalToken')}` }
            });
            fetchData(localStorage.getItem('portalToken'));
        } catch (e) { }
    };

    const handleLogout = () => {
        localStorage.removeItem('portalToken');
        localStorage.removeItem('portalUser');
        navigate('/portal/login');
    };

    if (loading) return (
        <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', position: 'fixed', top: 0, left: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                </div>
                <div style={{ fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#0f172a', fontSize: '20px' }}>Fetching Real-Time Ledger Data...</div>
                <div style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Syncing the administrative intelligence engine securely.</div>
            </div>
        </div>
    );

    const portalUser = JSON.parse(localStorage.getItem('portalUser') || '{}');

    return (
        <div className="portal-body">
            <nav className="portal-navbar">
                <div className="portal-nav-brand">
                    <div style={{ width: '36px', height: '36px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Shield size={20} />
                    </div>
                    <span>OpenAgent Admin</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="user-profile">
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800' }}>{portalUser.name || 'Admin'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Project Overseer</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#3b82f6' }}>
                            {portalUser.name ? portalUser.name[0] : 'A'}
                        </div>
                    </div>
                    <button onClick={handleLogout} className="portal-btn" style={{ background: '#fef2f2', color: '#ef4444', borderRadius: '10px', padding: '10px 14px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <div className="portal-container animate-fade-in">
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Outfit' }}>Network Intelligence</h2>
                        <p style={{ color: '#64748b', marginTop: '4px' }}>Snapshot of platform activity across the collective.</p>
                    </div>
                    <button
                        onClick={() => fetchData(localStorage.getItem('portalToken'))}
                        className="portal-btn"
                        style={{ background: '#fff', color: '#1e293b', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh Data
                    </button>
                </header>

                <div className="portal-stats-row">
                    <div className="portal-stat-card-v2">
                        <div className="stat-icon-wrap"><Bot size={22} /></div>
                        <div className="stat-label-v2">Active Entities</div>
                        <div className="stat-value-v2">{stats.agents}</div>
                    </div>
                    <div className="portal-stat-card-v2">
                        <div className="stat-icon-wrap" style={{ background: '#dcfce7', color: '#10b981' }}><Users size={22} /></div>
                        <div className="stat-label-v2">Protocol Residents</div>
                        <div className="stat-value-v2">{stats.users}</div>
                    </div>
                    <div className="portal-stat-card-v2">
                        <div className="stat-icon-wrap" style={{ background: '#fef9c3', color: '#eab308' }}><ShoppingCart size={22} /></div>
                        <div className="stat-label-v2">Total Exchanges</div>
                        <div className="stat-value-v2">{stats.sales}</div>
                    </div>
                    <div className="portal-stat-card-v2">
                        <div className="stat-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}><TrendingUp size={22} /></div>
                        <div className="stat-label-v2">Registry Volume</div>
                        <div className="stat-value-v2" style={{ color: '#059669' }}>{stats.volume}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>

                    {/* Main Content Area */}
                    <div className="portal-content-card" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Tab Headers */}
                        <div style={{ padding: '0 32px', background: '#fff', borderBottom: '1px solid var(--portal-border)', display: 'flex', gap: '32px' }}>
                            <button
                                onClick={() => setActiveTab('ledger')}
                                style={{ background: 'none', border: 'none', padding: '24px 0', fontSize: '15px', fontWeight: '700', color: activeTab === 'ledger' ? '#0f172a' : '#64748b', borderBottom: `3px solid ${activeTab === 'ledger' ? '#3b82f6' : 'transparent'}`, cursor: 'pointer' }}
                            >
                                Activity Ledger
                            </button>
                            <button
                                onClick={() => setActiveTab('identities')}
                                style={{ background: 'none', border: 'none', padding: '24px 0', fontSize: '15px', fontWeight: '700', color: activeTab === 'identities' ? '#0f172a' : '#64748b', borderBottom: `3px solid ${activeTab === 'identities' ? '#3b82f6' : 'transparent'}`, cursor: 'pointer' }}
                            >
                                Active Identities
                            </button>
                            <button
                                onClick={() => setActiveTab('arbitration')}
                                style={{ background: 'none', border: 'none', padding: '24px 0', fontSize: '15px', fontWeight: '600', color: activeTab === 'arbitration' ? '#0f172a' : '#64748b', borderBottom: `3px solid ${activeTab === 'arbitration' ? '#3b82f6' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                Dispute Arbitration
                                {purchases.filter(p => p.status === 'disputed').length > 0 &&
                                    <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                                        {purchases.filter(p => p.status === 'disputed').length}
                                    </span>
                                }
                            </button>
                        </div>

                        <div className="card-header-v2" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                            <h3>
                                {activeTab === 'ledger' && 'Real-Time Transactions'}
                                {activeTab === 'identities' && 'Active Protocol Identities'}
                                {activeTab === 'arbitration' && 'Pending Resolutions'}
                            </h3>
                            {activeTab === 'ledger' && <button className="portal-btn" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '12px' }}>Export CSV</button>}
                            {activeTab === 'identities' && <button className="portal-btn" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '12px' }}>Export CSV</button>}
                        </div>

                        <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
                            {activeTab === 'ledger' && (
                                <table className="portal-table-v2" style={{ whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>TX Hash</th>
                                            <th>Asset</th>
                                            <th>From (Seller)</th>
                                            <th>To (Buyer)</th>
                                            <th>Cost</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchases.slice(0, 15).map((p, i) => (
                                            <tr key={i}>
                                                <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(p.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                <td style={{ fontFamily: 'monospace', color: '#3b82f6', fontSize: '13px' }}>
                                                    {p.txHash ? `${p.txHash.slice(0, 6)}...${p.txHash.slice(-4)}` : 'On-Chain Pending'}
                                                </td>
                                                <td style={{ fontWeight: '700' }}>{p.agentName}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>
                                                    {p.seller && p.seller !== 'N/A' && p.seller !== 'Unknown' ? `${p.seller.slice(0, 6)}...${p.seller.slice(-4)}` : 'N/A'}
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>
                                                    {p.buyer && p.buyer.length > 10 ? `${p.buyer.slice(0, 6)}...${p.buyer.slice(-4)}` : `@${p.disputedBy || 'buyer'}`}
                                                </td>
                                                <td style={{ fontWeight: '800', fontFamily: 'Outfit' }}>{p.price} ETH</td>
                                                <td>
                                                    <span className={`status-pill pill-${(p.status || 'completed') === 'completed' ? 'success' : p.status === 'disputed' ? 'danger' : 'warning'}`}>
                                                        {p.status || 'completed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'identities' && (
                                <div style={{ padding: '0 32px' }}>
                                    <table className="portal-table-v2">
                                        <thead>
                                            <tr>
                                                <th>Identity (Username & Address)</th>
                                                <th style={{ textAlign: 'right' }}>Trust Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u, i) => (
                                                <tr key={i}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="avatar-initial" style={{ width: '40px', height: '40px', fontSize: '16px' }}>{u.username ? u.username[0].toUpperCase() : 'A'}</div>
                                                            <div>
                                                                <div style={{ fontWeight: '700', fontSize: '15px' }}>@{u.username || 'anon'}</div>
                                                                <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>{u.address}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '800', fontSize: '16px', color: u.hidden_rating >= 10 ? '#10b981' : '#f59e0b' }}>
                                                            {typeof u.hidden_rating === 'number' ? Math.round(u.hidden_rating * 10) / 10 : (u.hidden_rating || 0)}pts
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'arbitration' && (
                                <div style={{ padding: '24px 32px' }}>
                                    {purchases.filter(p => p.status === 'disputed').length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No active disputes requiring arbitration.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {purchases.filter(p => p.status === 'disputed').map((d, i) => (
                                                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Bot size={20} className="text-blue-500" />
                                                                {d.agentName}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                                                Flagged by <span style={{ fontWeight: '600', color: '#0f172a' }}>@{d.disputedBy}</span> on {new Date(d.disputeDate || d.timestamp).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: '800', color: '#ef4444', fontSize: '15px' }}>{d.price} ETH AT RISK</div>
                                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>TX: {d.txHash ? `${d.txHash.slice(0, 6)}...${d.txHash.slice(-4)}` : 'Pending'}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', borderLeft: '3px solid #f59e0b', marginBottom: '20px', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Provided Evidence / Reason</strong>
                                                        "{d.disputeReason || 'No reason provided.'}"
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                        <button
                                                            onClick={() => handleResolve(d._id, 'resolve')}
                                                            style={{ padding: '8px 24px', background: '#10b981', color: '#fff', border: '1px solid #059669', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.15)'; }}
                                                        >
                                                            Accept & Refund Buyer
                                                        </button>
                                                        <button
                                                            onClick={() => handleResolve(d._id, 'reject')}
                                                            style={{ padding: '8px 24px', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            Reject & Pay Seller
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
