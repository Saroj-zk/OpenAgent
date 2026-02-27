import React, { useState, useEffect } from 'react';
import {
    Users,
    Bot,
    Activity,
    DollarSign,
    ShieldAlert,
    ArrowRight,
    Lock,
    Search,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const AdminDashboard = () => {
    const { isConnected, account, username } = useWallet();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalAgents: 0,
        totalUsers: 0,
        totalPurchases: 0,
        disputedPurchases: 0,
        totalVolume: '0.00 ETH'
    });
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Hardcoded Admin
    const ADMIN_WALLET = '0x9527c9fd391ccd48f7278fe7c7c09b786a0bb832'.toLowerCase();
    const isAdmin = account && account.toLowerCase() === ADMIN_WALLET;

    useEffect(() => {
        if (isConnected && isAdmin) {
            fetchData();
        } else if (!loading) {
            setLoading(false);
        }
    }, [isConnected, isAdmin]);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const token = localStorage.getItem('jwtToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, txRes, usersRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, { headers }),
                fetch(`${API_URL}/api/admin/transactions`, { headers }),
                fetch(`${API_URL}/api/admin/users`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (txRes.ok) setTransactions(await txRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());

        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (!isConnected || !isAdmin) {
        return (
            <div className="restricted-screen">
                <Lock size={64} color="#ff4d4d" style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '32px', fontWeight: '900' }}>TERMINAL_RESTRICTED</h1>
                <p style={{ color: '#666', marginTop: '12px', marginBottom: '32px' }}>Your identity does not match the master administrative protocol.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Eject to Site</button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container animate-fade-in">
            <header className="admin-dashboard-header">
                <div>
                    <h1 className="text-glow">CONTROL_CHAMBER.</h1>
                    <p>Aggregated network intelligence for the OpenAgent Collective.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="admin-nav-btn" onClick={() => navigate('/admin/disputes')}>
                        <ShieldAlert size={18} />
                        Arbitration Center
                    </button>
                    <button className={`btn btn-outline ${refreshing ? 'animate-spin' : ''}`} onClick={fetchData} style={{ borderRadius: '12px', width: '48px', padding: 0 }}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon-box"><Bot size={22} /></div>
                    <div className="label">Entities Listed</div>
                    <div className="value">{stats.totalAgents}</div>
                </div>
                <div className="stat-card">
                    <div className="icon-box"><Users size={22} /></div>
                    <div className="label">Registered Identities</div>
                    <div className="value">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <div className="icon-box"><Activity size={22} /></div>
                    <div className="label">Total Acquisition Txs</div>
                    <div className="value">{stats.totalPurchases}</div>
                </div>
                <div className="stat-card">
                    <div className="icon-box"><DollarSign size={22} /></div>
                    <div className="label">Registry Volume</div>
                    <div className="value">{stats.totalVolume}</div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2>Transaction Ledger</h2>
                        <span style={{ fontSize: '12px', color: '#444' }}>{transactions.length} total txs</span>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Buyer</th>
                                    <th>Agent Asset</th>
                                    <th>Price</th>
                                    <th>TX_HASH</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span className={`status-badge status-${tx.status}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td>@{tx.buyer ? (tx.buyer.length > 15 ? `${tx.buyer.slice(0, 10)}...` : tx.buyer) : 'anon'}</td>
                                        <td>
                                            <Link to={`/agent/${tx.agentId}`} className="text-glow" style={{ fontWeight: '700' }}>
                                                {tx.agentName}
                                            </Link>
                                        </td>
                                        <td style={{ fontWeight: '900' }}>{tx.price} ETH</td>
                                        <td>
                                            <span className="tx-hash-pill">
                                                {tx.txHash ? tx.txHash.slice(0, 10) + '...' : 'SECURE_INTERNAL'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2>Network Users</h2>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Trust pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="user-row">
                                                <div className="user-avatar" style={{ backgroundImage: `url(${user.avatar || '/placeholder.png'})`, backgroundSize: 'cover' }}></div>
                                                <div>
                                                    <div style={{ fontWeight: '800' }}>@{user.username || 'unclaimed'}</div>
                                                    <div style={{ fontSize: '10px', color: '#444', fontFamily: 'monospace' }}>{user.address.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ color: user.hidden_rating >= 10 ? '#00ff80' : '#ff4d4d', fontWeight: '900' }}>
                                                {user.hidden_rating}
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

export default AdminDashboard;
