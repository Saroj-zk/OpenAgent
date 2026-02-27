import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Bot,
    ShoppingCart,
    DollarSign,
    LogOut,
    ExternalLink
} from 'lucide-react';
import './Portal.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const PortalDashboard = () => {
    const [stats, setStats] = useState({ agents: 0, users: 0, sales: 0, volume: '0 ETH' });
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
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
            console.error("Portal Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('portalToken');
        localStorage.removeItem('portalUser');
        navigate('/portal/login');
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Administrative Intelligence...</div>;

    const portalUser = JSON.parse(localStorage.getItem('portalUser') || '{}');

    return (
        <div className="portal-body">
            <nav className="portal-navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px' }}></div>
                    <span style={{ fontWeight: '800', fontSize: '18px', color: '#1e293b' }}>Management Console</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{portalUser.name || 'Admin'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{portalUser.email}</div>
                    </div>
                    <button onClick={handleLogout} className="portal-btn" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <div className="portal-container">
                {/* Simple Stats Card */}
                <div className="portal-stats">
                    <div className="portal-stat-card">
                        <div className="label">Total Bots</div>
                        <div className="value">{stats.agents}</div>
                    </div>
                    <div className="portal-stat-card">
                        <div className="label">Active Users</div>
                        <div className="value">{stats.users}</div>
                    </div>
                    <div className="portal-stat-card">
                        <div className="label">Total Purchases</div>
                        <div className="value">{stats.sales}</div>
                    </div>
                    <div className="portal-stat-card">
                        <div className="label">Protocol Volume</div>
                        <div style={{ ...{ fontSize: '28px', fontWeight: '700' }, color: '#10b981' }}>{stats.volume}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
                    {/* Recent Transactions */}
                    <div className="portal-card">
                        <div className="portal-card-header">
                            <span>Global Activity Log</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Buyer</th>
                                        <th>Asset</th>
                                        <th>Fee (ETH)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.slice(0, 15).map((p, i) => (
                                        <tr key={i}>
                                            <td>{new Date(p.timestamp).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: '500' }}>@{p.disputedBy || 'user'}</td>
                                            <td style={{ color: '#2563eb' }}>{p.agentName}</td>
                                            <td>{p.price}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    backgroundColor: p.status === 'completed' ? '#ecfdf5' : p.status === 'disputed' ? '#fef2f2' : '#fefce8',
                                                    color: p.status === 'completed' ? '#059669' : p.status === 'disputed' ? '#dc2626' : '#ca8a04'
                                                }}>
                                                    {p.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Network Residents */}
                    <div className="portal-card">
                        <div className="portal-card-header">
                            <span>User Distribution</span>
                        </div>
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.slice(0, 10).map((u, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>@{u.username || 'anon'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{u.address}</div>
                                        </td>
                                        <td>
                                            <span style={{ color: u.hidden_rating >= 10 ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
                                                {u.hidden_rating}pts
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
