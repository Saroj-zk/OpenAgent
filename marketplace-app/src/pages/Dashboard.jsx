import React, { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    Terminal, Package, ExternalLink, Shield,
    User, Settings, Grid, Activity, Award,
    Copy, CheckCircle2, Globe, Github, Twitter
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AgentAvatar from '../components/AgentAvatar';

const Dashboard = () => {
    const { isConnected, marketplaceAgents, purchasedAgents, username, account } = useWallet();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('deployments');
    const [copied, setCopied] = useState(false);

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
    }, [marketplaceAgents, purchasedAgents, isConnected, account, username]);

    const handleCopy = () => {
        navigator.clipboard.writeText(account);
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

            {/* Profile Banner */}
            <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
                position: 'relative',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }}></div>
            </div>

            <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                {/* User Info Branding */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', marginBottom: '48px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '40px',
                        background: '#050505',
                        border: '4px solid #000',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={64} color="rgba(255,255,255,0.1)" />
                    </div>

                    <div style={{ flex: 1, minWidth: '300px', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.04em' }}>
                                {username || 'Anonymous Spirit'}
                            </h1>
                            <div style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Award size={14} color="#ffaa00" />
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffaa00', textTransform: 'uppercase' }}>Builder Lvl 1</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    transition: 'color 0.2s'
                                }}
                                className="hover-white"
                            >
                                <span style={{ fontFamily: 'var(--font-mono)' }}>
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                                {copied ? <CheckCircle2 size={14} color="#4dff88" /> : <Copy size={14} />}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Globe size={16} color="#333" />
                                <Github size={16} color="#333" />
                                <Twitter size={16} color="#333" />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-outline" style={{ borderRadius: '14px', height: '48px', padding: '0 20px', gap: '8px' }}>
                            <Settings size={18} /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats Panel */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    marginBottom: '64px'
                }}>
                    {[
                        { label: 'Total Deployments', value: myAgents.length, icon: Package },
                        { label: 'Network Reputation', value: '740', icon: Shield },
                        { label: 'Protocol Revenue', value: '1.24 ETH', icon: Award },
                        { label: 'Days in Collective', value: '12', icon: Activity }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: '32px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '24px',
                            transition: 'all 0.3s ease'
                        }} className="hover-lift">
                            <stat.icon size={18} color="#444" style={{ marginBottom: '16px' }} />
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>{stat.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs Terminal */}
                <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '40px' }}>
                    {[
                        { id: 'deployments', label: 'My Deployments', icon: Grid },
                        { id: 'activity', label: 'Recent Activity', icon: Activity },
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                                {myAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className="hover-lift"
                                        style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '32px',
                                            padding: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '24px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <AgentAvatar image={agent.image} name={agent.name} size="100%" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>{agent.name}</div>
                                                <div style={{ fontSize: '12px', color: '#555', fontWeight: '700', textTransform: 'uppercase' }}>{agent.role}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#333', fontWeight: '800', marginBottom: '4px' }}>VALUE</div>
                                                <div style={{ fontWeight: '800', color: '#fff' }}>{agent.price} {agent.currency}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '10px', color: '#333', fontWeight: '800', marginBottom: '4px' }}>STATUS</div>
                                                <div style={{ fontWeight: '800', color: '#4dff88', fontSize: '12px' }}>VERIFIED LIVE</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {(purchasedAgents && purchasedAgents.some(pa => pa.id.toString() === agent.id.toString())) ? (
                                                <button
                                                    onClick={() => {
                                                        const url = `http://localhost:3001/api/agents/${agent.id}/download?buyer=${account}`;
                                                        const link = document.createElement("a");
                                                        link.href = url;
                                                        link.click();
                                                    }}
                                                    className="btn btn-primary"
                                                    style={{ flex: 1, height: '48px', borderRadius: '12px', gap: '8px', background: 'var(--brand-warm)', color: '#000' }}
                                                >
                                                    <Package size={16} /> Download Code
                                                </button>
                                            ) : null}
                                            <button
                                                onClick={() => navigate(`/agent/${agent.id}`)}
                                                className="btn btn-outline"
                                                style={{ flex: 1, height: '48px', borderRadius: '12px', gap: '8px' }}
                                            >
                                                <ExternalLink size={16} /> View Entity
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '32px' }}>
                                <Package size={40} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#333', marginBottom: '12px' }}>No Entities Discovered</h3>
                                <p style={{ color: '#555', marginBottom: '32px' }}>Your private registry is empty. Deploy your craft to the marketplace.</p>
                                <Link to="/sell" className="btn btn-primary" style={{ padding: '0 32px' }}>Deploy First Agent</Link>
                            </div>
                        )
                    )}

                    {activeTab === 'activity' && (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                            <Activity size={32} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <div style={{ color: '#444', fontWeight: '700' }}>Protocol activity stream appearing soon...</div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                            <Terminal size={32} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <div style={{ color: '#444', fontWeight: '700' }}>Secure shell access limited to verified builders.</div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
