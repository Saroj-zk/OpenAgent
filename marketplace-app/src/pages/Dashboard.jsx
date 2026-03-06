
import React, { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    Terminal, Package, ExternalLink, Shield, Circle,
    Copy, CheckCircle2, Globe, Github, Twitter, FileCode, AlertTriangle,
    Lock, Unlock, TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, Info, Zap,
    User, Award, Activity, Settings, Grid, History
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AgentAvatar from '../components/AgentAvatar';
import { API_URL } from '../config';

const Dashboard = () => {
    const {
        user, isConnected, account, username,
        marketplaceAgents, trustScore, purchasedAgents,
        rawPurchases, rawSales,
        disconnectWallet, stake, unstake
    } = useWallet();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('vault');
    const [copied, setCopied] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);

    React.useEffect(() => {
        if (isConnected && account) {
            fetch(`${API_URL}/api/users/${account}/subscriptions`)
                .then(res => res.json())
                .then(data => setSubscriptions(data))
                .catch(() => { });
        }
    }, [isConnected, account]);

    const myAgents = useMemo(() => {
        if (!isConnected || !account) return [];
        const lowerAccount = account.toLowerCase();

        // Agents created/owned entirely
        const listed = marketplaceAgents.filter(agent => {
            const agentOwner = agent.owner ? agent.owner.toLowerCase() : '';
            return (agentOwner === lowerAccount) ||
                (username && agent.owner === username) ||
                (agent.creator === username);
        });

        // Merge with purchased software licenses
        const allSet = new Set(listed.map(a => a.id.toString()));
        const merged = [...listed];

        if (purchasedAgents) {
            purchasedAgents.forEach(pa => {
                if (!allSet.has(pa.id.toString())) merged.push(pa);
            });
        }

        return merged;
    }, [isConnected, account, marketplaceAgents, purchasedAgents, username]);

    const historyEvents = useMemo(() => {
        let events = [];
        if (rawPurchases && rawPurchases.length > 0) {
            events = events.concat(rawPurchases.map(p => ({
                id: `purchase_${p.agentId}_${p.timestamp}`,
                type: 'PURCHASE',
                label: 'Purchased access to',
                agentId: p.agentId,
                timestamp: p.timestamp,
                txHash: p.txHash,
                date: new Date(p.timestamp),
                status: p.status
            })));
        }

        if (rawSales && rawSales.length > 0) {
            events = events.concat(rawSales.map(p => ({
                id: `sale_${p.agentId}_${p.timestamp}_${p.buyer}`,
                type: 'SALE',
                label: 'New sale for',
                agentId: p.agentId,
                timestamp: p.timestamp,
                txHash: p.txHash,
                date: new Date(p.timestamp),
                status: p.status
            })));
        }

        if (marketplaceAgents && account) {
            const lowerAccount = account.toLowerCase();
            const listed = marketplaceAgents.filter(agent => {
                const agentOwner = agent.owner ? agent.owner.toLowerCase() : '';
                return (agentOwner === lowerAccount) ||
                    (username && agent.owner === username) ||
                    (agent.creator === username);
            });
            events = events.concat(listed.map(a => ({
                id: `list_${a.id}_${a.dateCreated}`,
                type: 'LISTING',
                label: 'Deployed entity',
                agentId: a.id,
                timestamp: a.dateCreated,
                txHash: a.txHash,
                date: new Date(a.dateCreated || Date.now())
            })));
        }

        return events.sort((a, b) => b.date - a.date);
    }, [rawPurchases, rawSales, marketplaceAgents, account, username]);

    const UnstakeForm = () => {
        const [amount, setAmount] = useState('');
        const [loading, setLoading] = useState(false);

        const handleUnstake = async (e) => {
            e.preventDefault();
            if (!amount || isNaN(amount)) return;
            if (!window.confirm(`Warning: Unstaking ${amount} ETH will result in a trust score slash. Do you wish to proceed?`)) return;

            setLoading(true);
            const res = await unstake(parseFloat(amount));
            if (res.success) {
                setAmount('');
                alert("Unstaking successful. Your reputation score has been updated.");
            } else {
                alert(res.error || "Unstaking failed");
            }
            setLoading(false);
        };

        return (
            <form onSubmit={handleUnstake} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '14px', fontWeight: '800' }}>
                    <ArrowDownCircle size={16} color="#ef4444" />
                    Withdraw Stake
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%', background: '#000', border: '1px solid #222', borderRadius: '14px', padding: '16px', color: '#fff', fontSize: '16px', outline: 'none' }}
                    />
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '12px', fontWeight: '800' }}>ETH</div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !amount}
                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '14px', padding: '16px', fontWeight: '800', cursor: 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                >
                    {loading ? 'Processing...' : 'Unstake Assets'}
                </button>
            </form>
        );
    };

    const StakeForm = () => {
        const [amount, setAmount] = useState('');
        const [lockDays, setLockDays] = useState(0);
        const [loading, setLoading] = useState(false);

        const handleStake = async (e) => {
            e.preventDefault();
            if (!amount || isNaN(amount)) return;

            setLoading(true);
            const res = await stake(parseFloat(amount), parseInt(lockDays));
            if (res.success) {
                setAmount('');
                setLockDays(0);
                alert("Stake successful! Your trust boost is being calculated.");
            } else {
                alert(res.error || "Staking failed");
            }
            setLoading(false);
        };

        return (
            <form onSubmit={handleStake} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '14px', fontWeight: '800' }}>
                    <ArrowUpCircle size={16} color="var(--brand-primary)" />
                    Add Reputation Stake
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%', background: '#000', border: '1px solid #222', borderRadius: '14px', padding: '16px', color: '#fff', fontSize: '16px', outline: 'none' }}
                    />
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '12px', fontWeight: '800' }}>ETH</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[0, 30, 90, 180].map(days => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => setLockDays(days)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: lockDays === days ? 'var(--brand-primary)' : 'rgba(255,255,255,0.03)',
                                color: lockDays === days ? '#000' : '#888',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {days === 0 ? 'No Lock' : `${days}d Lock`}
                        </button>
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={loading || !amount}
                    style={{ background: 'var(--brand-primary)', border: 'none', color: '#000', borderRadius: '14px', padding: '16px', fontWeight: '900', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                >
                    {loading ? 'Processing...' : 'Confirm Stake'}
                </button>
            </form>
        );
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ padding: '200px 0', textAlign: 'center' }}>
                <Terminal size={48} style={{ opacity: 0.1, margin: '0 auto 24px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Terminal Locked</h2>
                <p style={{ color: '#666', marginBottom: '32px' }}>Please connect your wallet to access your private profile.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Access Point</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ paddingTop: '80px', paddingBottom: '140px' }}>

            {/* Dashboard Hero: Identity & Authority Profile */}
            <div className="container" style={{ paddingTop: '40px', marginBottom: '48px' }}>
                <div style={{
                    background: 'linear-gradient(165deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '48px',
                    padding: '60px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '60px',
                    flexWrap: 'wrap',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
                }}>
                    {/* Background Ambient Glows */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        zIndex: 0
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        zIndex: 0
                    }}></div>

                    {/* Avatar Card - Highly Visual */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '220px',
                            height: '220px',
                            borderRadius: '56px',
                            background: '#020202',
                            border: `2px solid rgba(255,255,255,0.1)`,
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '44px',
                                background: 'linear-gradient(135deg, #111 0%, #050505 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <User size={100} color="rgba(255,255,255,0.05)" />
                            </div>

                            {/* Verification Badge Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-10px',
                                right: '-10px',
                                background: user?.trustTier === 'VERIFIED' ? '#6366f1' : '#1a1a1a',
                                borderRadius: '24px',
                                padding: '10px 20px',
                                border: '4px solid #000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                            }}>
                                <Shield size={16} color="#fff" />
                                <span style={{ fontSize: '11px', fontWeight: '900', color: '#fff' }}>
                                    {user?.trustTier || 'RESTRICTED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div style={{ flex: '1', minWidth: '400px', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                <div style={{ fontSize: '32px', fontWeight: '950', color: '#fff', letterSpacing: '-0.05em' }}>@{username || account?.slice(0, 8)}</div>
                                {user?.trustTier === 'VERIFIED' && (
                                    <div style={{ background: '#6366f1', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
                                        <Shield size={14} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            <div style={{
                                padding: '10px 18px',
                                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#fff',
                                marginBottom: '8px'
                            }}>
                                <Zap size={14} fill="#fff" />
                                <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Pioneer</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', fontWeight: '600' }}>
                                <Globe size={14} />
                                Connected via Base Sepolia
                            </div>
                            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <button
                                onClick={() => copyToClipboard(account)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontFamily: 'var(--font-mono)'
                                }}
                            >
                                {account ? `${account.slice(0, 10)}...${account.slice(-8)}` : '0x00...0000'}
                                {copied ? <CheckCircle2 size={14} color="#6366f1" /> : <Copy size={14} />}
                            </button>
                        </div>

                        {/* Network Statistics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '32px' }}>
                            {[
                                { label: 'Trust Score', value: trustScore || 10, trend: 'Authority' },
                                { label: 'Total Revenue', value: '1.24 ETH', trend: 'Market' },
                                { label: 'Active Builds', value: myAgents.length, trend: 'Assets' },
                                { label: 'Staked Power', value: `${user?.staked_amount || 0} ETH`, trend: 'Security' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#444', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.15em' }}>{stat.label}</div>
                                    <div style={{ fontSize: '28px', fontWeight: '950', color: '#fff', marginBottom: '4px' }}>{stat.value}</div>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#333' }}>{stat.trend} Nominal</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            className="hover-lift"
                            style={{
                                padding: '20px 40px',
                                background: '#fff',
                                color: '#000',
                                borderRadius: '20px',
                                fontWeight: '950',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '15px',
                                boxShadow: '0 20px 40px rgba(255,255,255,0.1)'
                            }}
                            onClick={() => setActiveTab('vault')}
                        >
                            Boost Authority
                        </button>
                        <button
                            className="hover-lift"
                            style={{
                                padding: '20px 40px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                borderRadius: '20px',
                                fontWeight: '950',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                fontSize: '15px'
                            }}
                            onClick={() => setActiveTab('settings')}
                        >
                            Edit Identity
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">

                {/* Tabs Terminal */}
                <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '40px', overflowX: 'auto' }}>
                    {[
                        { id: 'vault', label: 'Verification Center', icon: Shield },
                        { id: 'deployments', label: 'My Deployments', icon: Grid },
                        { id: 'subscriptions', label: 'Active Subscriptions', icon: Package },
                        { id: 'activity', label: 'Recent Activity', icon: Activity },
                        { id: 'history', label: 'History', icon: History },
                        { id: 'settings', label: 'Access Keys', icon: Terminal }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '16px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
                                color: activeTab === tab.id ? '#fff' : '#444',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'deployments' && (
                        myAgents.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                                {myAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className="hover-lift"
                                        style={{
                                            background: '#080808',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '32px',
                                            padding: '32px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '24px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '72px', height: '72px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
                                                <AgentAvatar image={agent.image} name={agent.name} size="100%" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '20px', fontWeight: '950', color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em' }}>{agent.name}</div>
                                                <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent.role}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#444', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>Current Value</div>
                                                <div style={{ fontSize: '18px', fontWeight: '950', color: '#fff' }}>{agent.price} {agent.currency}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '10px', color: '#444', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>Protocol Status</div>
                                                <div style={{ fontWeight: '900', color: '#6366f1', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <CheckCircle2 size={12} /> VERIFIED
                                                </div>
                                            </div>
                                        </div>

                                        {agent.txHash && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                                                <div style={{ fontSize: '10px', color: '#333', fontWeight: '800' }}>REGISTRY TX</div>
                                                <a
                                                    href={`https://sepolia.basescan.org/tx/${agent.txHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ fontSize: '11px', color: '#555', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                                                >
                                                    {agent.txHash.slice(0, 8)}...{agent.txHash.slice(-6)}
                                                    <ExternalLink size={10} />
                                                </a>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {(purchasedAgents && purchasedAgents.some(pa => pa.id.toString() === agent.id.toString())) ? (
                                                <button
                                                    onClick={() => {
                                                        const url = `${API_URL}/api/agents/${agent.id}/download?buyer=${account}`;
                                                        const link = document.createElement("a");
                                                        link.href = url;
                                                        link.click();
                                                    }}
                                                    className="btn"
                                                    style={{ height: '48px', borderRadius: '16px', gap: '10px', background: '#fff', color: '#000', fontSize: '13px', border: 'none' }}
                                                >
                                                    <Package size={16} /> Download
                                                </button>
                                            ) : null}
                                            <button
                                                onClick={() => navigate(`/agent/${agent.id}`)}
                                                className="btn"
                                                style={{ height: '48px', borderRadius: '16px', gap: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <ExternalLink size={16} /> View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '120px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '48px' }}>
                                <Package size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', marginBottom: '16px' }}>No Entities Discovered</h3>
                                <p style={{ color: '#666', marginBottom: '40px', fontSize: '16px' }}>Your private registry is empty. Deploy your craft to the globally verified marketplace.</p>
                                <Link to="/sell" className="btn btn-primary" style={{ padding: '0 40px', height: '56px', borderRadius: '14px' }}>Deploy First Agent</Link>
                            </div>
                        )
                    )}

                    {activeTab === 'subscriptions' && (
                        <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '48px', padding: '60px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                                <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Package size={32} color="#6366f1" />
                                    Active Subscriptions
                                </h3>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {subscriptions?.length || 0} Managed Assets
                                </div>
                            </div>

                            {subscriptions && subscriptions.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                                    {subscriptions.map(sub => {
                                        const agent = marketplaceAgents.find(a => a.id.toString() === sub.agentId.toString());
                                        const daysRemaining = Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
                                        return (
                                            <div key={sub._id} style={{
                                                padding: '32px',
                                                background: '#0a0a0a',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '24px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '950', fontSize: '20px', color: '#fff', marginBottom: '4px' }}>
                                                            {agent ? agent.name : `Agent #${sub.agentId}`}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#444', fontWeight: '800' }}>
                                                            REGISTRY EXPIRES: {new Date(sub.expiresAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        padding: '10px 16px',
                                                        background: daysRemaining > 5 ? 'rgba(99, 102, 241, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                        borderRadius: '12px',
                                                        color: daysRemaining > 5 ? '#6366f1' : '#ef4444',
                                                        fontSize: '14px',
                                                        fontWeight: '950'
                                                    }}>
                                                        {daysRemaining} DAYS
                                                    </div>
                                                </div>

                                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${Math.min(100, (daysRemaining / 30) * 100)}%`,
                                                        height: '100%',
                                                        background: daysRemaining > 5 ? '#6366f1' : '#ef4444',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                </div>

                                                <Link to={`/agent/${sub.agentId}`} className="btn btn-outline" style={{ height: '48px', borderRadius: '16px', fontSize: '13px', fontWeight: '900' }}>
                                                    Manage Authority
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                    <Package size={48} style={{ marginBottom: '24px', opacity: 0.1 }} />
                                    <h4 style={{ color: '#444', fontWeight: '900', fontSize: '18px' }}>No Active Commitments</h4>
                                    <p style={{ color: '#333', marginTop: '12px' }}>Explore the marketplace to acquire verified AI agents.</p>
                                </div>
                            )
                            }
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                            <Activity size={32} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <div style={{ color: '#444', fontWeight: '700' }}>Protocol activity stream appearing soon...</div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '32px' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <AlertTriangle size={20} color="#ef4444" />
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', letterSpacing: '0.05em' }}>SECURITY WARNING</div>
                                        <div style={{ fontSize: '13px', color: '#fca5a5' }}>Never share your seed phrase or private keys with ANYONE, including verified agents.</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <Shield size={20} color="#f59e0b" />
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.05em' }}>ASSET SAFETY</div>
                                        <div style={{ fontSize: '13px', color: '#fcd34d' }}>Always verify token approvals before confirming smart contract transactions.</div>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <History size={20} color="var(--brand-primary)" />
                                Transaction History
                            </h3>

                            {historyEvents && historyEvents.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {historyEvents.map((event, index) => {
                                        const agent = marketplaceAgents.find(a => a.id.toString() === event.agentId.toString());
                                        return (
                                            <div key={event.id} style={{ padding: '20px', background: '#000', border: '1px solid #1a1a1a', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Activity size={18} color="#444" />
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#fff', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                                                            {event.label} {agent ? `'${agent.name}'` : `#${event.agentId}`}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ color: '#555', fontSize: '12px', fontWeight: '600' }}>
                                                                {event.date.toLocaleString()}
                                                            </div>
                                                            {event.status && (
                                                                <div style={{
                                                                    fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                                    background: event.status === 'CREATED' ? 'rgba(56, 189, 248, 0.2)' : event.status === 'DISPUTED' ? 'rgba(239, 68, 68, 0.2)' : event.status === 'FINALIZED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                                    color: event.status === 'CREATED' ? '#38bdf8' : event.status === 'DISPUTED' ? '#ef4444' : event.status === 'FINALIZED' ? '#10b981' : '#aaa'
                                                                }}>
                                                                    {event.status}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', minWidth: '300px' }}>
                                                    <div style={{ fontSize: '10px', color: '#666', fontWeight: '800', letterSpacing: '0.1em' }}>TRANSACTION HASH</div>
                                                    {event.txHash ? (
                                                        <a
                                                            href={`https://sepolia.basescan.org/tx/${event.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#4dff88', fontSize: '12px', fontFamily: 'monospace', textDecoration: 'none', wordBreak: 'break-all' }}
                                                        >
                                                            {event.txHash} <ExternalLink size={10} style={{ display: 'inline', marginLeft: '4px' }} />
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>Mocked / Seeded via Database</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                                    <FileCode size={32} style={{ marginBottom: '16px' }} />
                                    <div style={{ fontWeight: '700' }}>No transactions recorded yet.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

                            {/* Verification Dashboard Header */}
                            <div style={{
                                padding: '60px',
                                background: '#080808',
                                borderRadius: '48px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 340px',
                                gap: '60px',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1',
                                            boxShadow: '0 0 10px #6366f1'
                                        }}></div>
                                        <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                            Trust Infrastructure v1.2
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: '56px', fontWeight: '950', color: '#fff', marginBottom: '20px', letterSpacing: '-0.04em' }}>
                                        Verification Authority
                                    </h2>
                                    <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.6', maxWidth: '600px', marginBottom: '40px' }}>
                                        Establish yourself as a trusted builder in the marketplace. Secure your identity through stake commitment to unlock premium verification badges and buyer confidence.
                                    </p>

                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Commitment</div>
                                            <div style={{ fontSize: '32px', fontWeight: '950', color: '#fff' }}>{user?.staked_amount || 0} ETH</div>
                                        </div>
                                        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Buyer Assurance</div>
                                            <div style={{ fontSize: '32px', fontWeight: '950', color: '#6366f1' }}>99.2%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Unified Gauge */}
                                <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="280" height="280" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="6"
                                            strokeDasharray={`${(trustScore / 200) * 289} 289`}
                                            strokeDashoffset="0"
                                            transform="rotate(-90 50 50)"
                                            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)', filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.3))' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#444', letterSpacing: '0.2em' }}>AUTHORITY</div>
                                        <div style={{ fontSize: '72px', fontWeight: '950', color: '#fff', margin: '-10px 0', letterSpacing: '-0.05em' }}>{trustScore}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.trustTier}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier Selection - Redesigned as Subscription Tiers */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                {[
                                    { tier: 'RESTRICTED', price: '0.00', score: '0+', color: '#333', perks: ['Basic Search', 'Limited Builds', 'Base Fees'] },
                                    { tier: 'EXPERIMENTAL', price: '0.05', score: '30+', color: '#f59e0b', perks: ['Apprentice Badge', '3 Active Builds', 'Lower Bond'] },
                                    { tier: 'REVIEWED', price: '0.20', score: '60+', color: '#38bdf8', perks: ['Expert Badge', 'Verified Logic', '1.5x Bond'] },
                                    { tier: 'VERIFIED', price: '0.50', score: '150+', color: '#6366f1', perks: ['Protocol Pioneer', 'Priority Marketplace', '1.0x Bond'] }
                                ].map((t, i) => (
                                    <div key={i} style={{
                                        padding: '40px',
                                        background: user?.trustTier === t.tier ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255,255,255,0.01)',
                                        borderRadius: '32px',
                                        border: `1px solid ${user?.trustTier === t.tier ? '#6366f1' : 'rgba(255,255,255,0.05)'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '24px',
                                        position: 'relative'
                                    }}>
                                        {user?.trustTier === t.tier && (
                                            <div style={{ position: 'absolute', top: '24px', right: '24px', background: '#6366f1', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>ACTIVE</div>
                                        )}
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>{t.tier}</h3>
                                            <div style={{ fontSize: '12px', color: '#444', fontWeight: '800' }}>Tier Requirement</div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span style={{ fontSize: '32px', fontWeight: '950', color: '#fff' }}>{t.price}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#444' }}>ETH</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                            {t.perks.map((perk, j) => (
                                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666', fontWeight: '600' }}>
                                                    <CheckCircle2 size={14} color={user?.trustTier === t.tier ? '#6366f1' : '#222'} />
                                                    {perk}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            style={{
                                                marginTop: 'auto',
                                                padding: '16px',
                                                background: user?.trustTier === t.tier ? '#111' : 'transparent',
                                                border: `1px solid ${user?.trustTier === t.tier ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)'}`,
                                                color: user?.trustTier === t.tier ? '#fff' : '#666',
                                                borderRadius: '16px',
                                                fontSize: '13px',
                                                fontWeight: '900',
                                                cursor: 'pointer'
                                            }}
                                            disabled={user?.trustTier === t.tier}
                                        >
                                            {user?.trustTier === t.tier ? 'Current Tier' : 'Upgrade Req'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Commitment Controls */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>

                                {/* Left: Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                        <div style={{
                                            padding: '40px',
                                            background: '#080808',
                                            borderRadius: '32px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                        }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: '950', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <ArrowUpCircle size={20} color="#6366f1" /> Upgrade Verification
                                            </h4>
                                            <StakeForm />
                                        </div>
                                        <div style={{
                                            padding: '40px',
                                            background: '#080808',
                                            borderRadius: '32px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            opacity: (user?.staked_amount || 0) > 0 ? 1 : 0.4
                                        }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: '950', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <ArrowDownCircle size={20} color="#ef4444" /> Protocol Withdrawal
                                            </h4>
                                            <UnstakeForm />
                                        </div>
                                    </div>

                                    {/* Confidence Indicators */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{ padding: '32px', background: 'rgba(99, 102, 241, 0.03)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <Shield size={20} color="#6366f1" />
                                                <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>Escrow Underwriting</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                                Your staked assets act as collateral for buyer disputes. Higher stakes directly translate to lower bond requirements for new builds.
                                            </p>
                                        </div>
                                        <div style={{ padding: '32px', background: 'rgba(168, 85, 247, 0.03)', borderRadius: '24px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <Award size={20} color="#a855f7" />
                                                <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>Reputation Maturation</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                                Stakes mature over 7 days. Early withdrawal results in a permanent 8% authority slash to maintain protocol integrity.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Benefits Visualizer */}
                                <div style={{
                                    padding: '48px',
                                    background: '#080808',
                                    borderRadius: '32px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '40px'
                                }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: '950', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Protocol Privileges</h4>

                                    {[
                                        { label: 'Market Access', icon: Grid, value: Math.min(100, (trustScore / 150) * 100), color: '#6366f1' },
                                        { label: 'Governance Weight', icon: Globe, value: Math.min(100, (user?.staked_amount || 0) * 20), color: '#a855f7' },
                                        { label: 'Bot Shield Strength', icon: Shield, value: Math.min(100, (trustScore / 300) * 100 + 40), color: '#f59e0b' }
                                    ].map((benefit, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <benefit.icon size={16} color={benefit.color} />
                                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{benefit.label}</span>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: '950', color: benefit.color }}>{Math.floor(benefit.value)}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${benefit.value}%`, height: '100%', background: benefit.color, borderRadius: '3px', transition: 'width 1s' }}></div>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', fontSize: '12px', color: '#555', lineHeight: '1.6', textAlign: 'center' }}>
                                        <Info size={16} style={{ marginBottom: '8px', opacity: 0.3 }} />
                                        <br />
                                        Your buyer confidence ranking is currently in the <strong>Top 15%</strong> of the network. Stake more to reach <strong>VERIFIED</strong>.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '48px', padding: '60px' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Activity size={32} color="#6366f1" />
                                Protocol Activity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {[
                                    { event: 'Shield Activation', desc: 'Trust Score increased to 150 PTS', time: '2 hours ago', icon: Shield, color: '#6366f1' },
                                    { event: 'Registry Update', desc: 'New agent "Neural Sentinel" deployed', time: '5 hours ago', icon: Grid, color: '#a855f7' },
                                    { event: 'Commitment Verified', desc: 'Stake of 0.5 ETH confirmed on-chain', time: '1 day ago', icon: ArrowUpCircle, color: '#f59e0b' },
                                    { event: 'Identity Maturation', desc: 'Verified badge granted by Protocol Admin', time: '2 days ago', icon: Award, color: '#6366f1' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '30px',
                                        background: 'rgba(255,255,255,0.01)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '32px',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)'
                                    }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '18px', background: `${item.color}10`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${item.color}20`
                                        }}>
                                            <item.icon size={24} color={item.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>{item.event}</div>
                                            <div style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>{item.desc}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#333', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '48px', padding: '60px' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <History size={32} color="#6366f1" />
                                Transaction Ledger
                            </h3>
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            {['TYPE', 'ENTITY', 'AMOUNT', 'DATE', 'STATUS'].map(h => (
                                                <th key={h} style={{ textAlign: 'left', padding: '20px', fontSize: '11px', fontWeight: '900', color: '#444', letterSpacing: '0.2em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { type: 'Acquisition', entity: 'Neural Sentinel', amt: '-0.12 ETH', date: '2024-03-01', status: 'SUCCESS' },
                                            { type: 'Stake', entity: 'Protocol Root', amt: '+0.50 ETH', date: '2024-02-28', status: 'SUCCESS' },
                                            { type: 'Revenue', entity: 'Code Whisperer', amt: '+0.05 ETH', date: '2024-02-25', status: 'SUCCESS' }
                                        ].map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '24px', fontSize: '14px', fontWeight: '800', color: '#fff' }}>{row.type}</td>
                                                <td style={{ padding: '24px', fontSize: '14px', color: '#666', fontWeight: '600' }}>{row.entity}</td>
                                                <td style={{ padding: '24px', fontSize: '14px', fontWeight: '950', color: row.amt.startsWith('+') ? '#6366f1' : '#fff' }}>{row.amt}</td>
                                                <td style={{ padding: '24px', fontSize: '14px', color: '#444' }}>{row.date}</td>
                                                <td style={{ padding: '24px' }}>
                                                    <span style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', fontSize: '11px', fontWeight: '900', color: '#6366f1' }}>{row.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '48px', padding: '60px' }}>
                            <div style={{ maxWidth: '800px' }}>
                                <h3 style={{ fontSize: '32px', fontWeight: '950', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Terminal size={32} color="#6366f1" />
                                    Security & Access
                                </h3>
                                <p style={{ color: '#666', fontSize: '16px', marginBottom: '48px' }}>
                                    Manage your deployment keys and protocol identity. Keep your private keys secure and never share them with third parties.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity Profile</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#444', marginBottom: '12px', textTransform: 'uppercase' }}>Username</label>
                                                <input readOnly value={username} style={{ width: '100%', padding: '16px', background: '#000', border: '1px solid #111', borderRadius: '12px', color: '#fff', fontSize: '15px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#444', marginBottom: '12px', textTransform: 'uppercase' }}>Connected Wallet</label>
                                                <div style={{ padding: '16px', background: '#000', border: '1px solid #111', borderRadius: '12px', color: '#555', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                                                    {account?.slice(0, 12)}...{account?.slice(-10)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '40px', background: 'rgba(99, 102, 241, 0.02)', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>API Access Keys</h4>
                                            <button className="btn" style={{ height: '36px', padding: '0 16px', fontSize: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '100px' }}>Generate New Key</button>
                                        </div>
                                        <div style={{ padding: '24px', background: '#000', borderRadius: '16px', border: '1px solid #111', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ flex: 1, color: '#444', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                                                oa_live_••••••••••••••••••••••••••••••••
                                            </div>
                                            <button style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>REVEAL</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
