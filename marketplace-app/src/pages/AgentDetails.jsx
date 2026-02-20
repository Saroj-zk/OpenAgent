import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ShieldCheck, Terminal, User, Star, FileCode, Github, Globe, Shield, Activity, Brackets, Bot, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import AgentAvatar from '../components/AgentAvatar';
import './AgentDetails.css';

const AgentDetails = () => {
    const { id } = useParams();
    const { marketplaceAgents: agents = [], isConnected, account, username, buyAgent, deleteAgent } = useWallet();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isDelisting, setIsDelisting] = useState(false);
    const [activeTab, setActiveTab] = useState('specs');
    const [hasRated, setHasRated] = useState(false);
    const navigate = useNavigate();

    const agent = agents.find(a => a.id.toString() === id.toString());

    // Check if the current user is the owner
    const isOwner = agent && (
        (agent.owner && username && agent.owner.toLowerCase() === username.toLowerCase()) ||
        (agent.owner && account && agent.owner.toLowerCase() === account.toLowerCase())
    );

    // Mock calculations for specialized dashboard
    const architectRating = useMemo(() => (4.5 + (agent?.id % 5) / 10).toFixed(1), [agent]);
    const reviewCount = useMemo(() => 12 + (agent?.id % 20), [agent]);
    const canRate = isConnected; // In a real app, check if owned

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!agent) {
        return (
            <div className="details-container" style={{ textAlign: 'center', paddingTop: '200px' }}>
                <h1 style={{ color: '#fff' }}>AGENT_NOT_FOUND</h1>
                <Link to="/explore" className="back-link" style={{ justifyContent: 'center', marginTop: '40px' }}>
                    <ArrowLeft size={16} /> RETURN TO REGISTRY
                </Link>
            </div>
        );
    }

    const similarAgents = agents.filter(a => a.id !== agent.id && a.role === agent.role).slice(0, 4);

    const handlePurchase = async () => {
        if (!isConnected) return alert('Please connect your wallet to initialize acquisition.');
        setIsPurchasing(true);
        const result = await buyAgent(agent);
        setIsPurchasing(false);
        if (result && result.success) {
            alert('Acquisition sequence complete. Agent initialized in your workspace.');
        } else {
            alert(result?.error || 'Acquisition failed.');
        }
    };

    const handleDelist = async () => {
        if (!window.confirm("Are you sure you want to delist this agent? This action cannot be entirely undone on-chain, but it will be removed from marketplace discovery.")) return;

        setIsDelisting(true);
        const result = await deleteAgent(agent.id);
        setIsDelisting(false);

        if (result && result.success) {
            alert('Agent successfully delisted.');
            navigate('/dashboard');
        } else {
            alert(result?.error || 'Delisting failed.');
        }
    };

    return (
        <div className="details-container animate-fade-in-up">
            <nav style={{ marginBottom: '48px' }}>
                <Link to="/explore" className="back-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', fontWeight: '700' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Registry</span>
                </Link>
            </nav>

            <header className="details-header-v5">
                <div className="header-left-v5">
                    <div className="id-tag-v5">#{(agent.id % 1000).toString().padStart(3, '0')} RECOGNIZED</div>
                    <h1 className="agent-title-v5">{agent.name}</h1>
                    <div className="arch-line-v5">
                        <User size={14} />
                        <span>MASTER_ARCHITECT: <strong>@{agent.owner || 'independent'}</strong></span>
                        <div className="trust-meter-v5">
                            <Star size={12} fill="var(--brand-warm)" color="var(--brand-warm)" />
                            <span>{architectRating} TRUST</span>
                        </div>
                    </div>
                </div>

                <div className="header-right-v5">
                    <div className="price-card-v5">
                        <span className="price-label-v5">LISTING_PRICE</span>
                        <div className="price-value-v5">
                            <Zap size={24} className="zap-glow" fill="currentColor" />
                            <span>{agent.price} {agent.currency || 'ETH'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="details-dashboard-v5">
                {/* Main Content Area */}
                <div className="dashboard-content-v5">
                    <div className="description-box-v5">
                        <div className="box-label-v5">ENTITY_ABSTRACT</div>
                        <p>{agent.description || "Autonomous logic engine optimized for specialized task execution and production-scale workspace integration."}</p>
                    </div>

                    <div className="tabs-container-v5">
                        <div className="tabs-list-v5">
                            <button className={`tab-trigger-v5 ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>TECHNICAL_SPECS</button>
                            <button className={`tab-trigger-v5 ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>CORE_DOCUMENTATION</button>
                        </div>

                        <div className="tab-panel-v5">
                            {activeTab === 'specs' ? (
                                <div className="specs-grid-v5">
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">ROLE</span>
                                        <span className="tile-val">{agent.role}</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">MODEL</span>
                                        <span className="tile-val">{agent.model || 'GPT-4o MINIFIED'}</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">CONTEXT</span>
                                        <span className="tile-val">128K TOKENS</span>
                                    </div>
                                    <div className="spec-tile-v5">
                                        <span className="tile-label">KERNEL</span>
                                        <span className="tile-val">{agent.framework || 'Custom-LangChain'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="docs-terminal-v5">
                                    <div className="terminal-top">
                                        <Terminal size={12} />
                                        <span>SHELL_DEPLOYMENT</span>
                                    </div>
                                    <div className="terminal-content">
                                        <code>$ npx openagent init --id {agent.id.toString().slice(-6)} --force</code>
                                        <button className="term-copy-btn" onClick={() => navigator.clipboard.writeText(`npx openagent init --id ${agent.id.toString().slice(-6)}`)}>COPY</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="security-module-v5">
                        <div className="box-label-v5">AUDIT_AND_SECURITY</div>
                        <div className="security-check-v5">
                            <ShieldCheck size={18} color="var(--brand-primary)" />
                            <div className="check-info-v5">
                                <span className="check-title-v5">SECURE_KERNEL_VERIFIED</span>
                                <span className="check-desc-v5">Registry compliance verified. Standard encryption signature present.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Action Hub */}
                <aside className="dashboard-sidebar-v5">
                    <div className="identity-module-v5">
                        <AgentAvatar image={agent.image} name={agent.name} size="80%" />
                    </div>

                    <div className="action-panel-v5">
                        {!isOwner ? (
                            <button
                                className="primary-buy-btn-v5"
                                disabled={isPurchasing || hasRated}
                                onClick={handlePurchase}
                            >
                                <Zap size={18} fill="currentColor" />
                                <span>{isPurchasing ? 'VERIFYING...' : (hasRated ? 'SECURED' : 'INITIALIZE ACQUISITION')}</span>
                            </button>
                        ) : (
                            <button
                                className="primary-buy-btn-v5"
                                style={{ background: 'var(--bg-card)', color: '#ff4d4d', border: '1px dashed #ff4d4d' }}
                                disabled={isDelisting}
                                onClick={handleDelist}
                            >
                                <Terminal size={18} />
                                <span>{isDelisting ? 'DELISTING...' : 'DELIST AGENT'}</span>
                            </button>
                        )}

                        <div className="utility-links-v5">
                            {agent.github && <a href={agent.github} target="_blank" rel="noreferrer" className="util-link-v5"><Github size={18} /> SOURCE</a>}
                            {agent.docs && <a href={agent.docs} target="_blank" rel="noreferrer" className="util-link-v5"><FileCode size={18} /> MANUAL</a>}
                        </div>

                        {canRate && !hasRated && (
                            <button className="secondary-action-v5" onClick={() => setHasRated(true)}>
                                <Star size={16} />
                                <span>CERTIFY ASSET</span>
                            </button>
                        )}

                        {hasRated && (
                            <div className="certified-msg-v5">
                                <ShieldCheck size={14} />
                                <span>ASSET CERTIFIED</span>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <div className="recommendations-container-v5">
                <div className="module-label-v5">PROPOSED_ALTERNATIVES</div>
                <div className="rec-grid-v5">
                    {similarAgents.map((rec) => (
                        <Link to={`/agent/${rec.id}`} key={rec.id} className="rec-card-v5">
                            <div className="rec-visual-v5">
                                <AgentAvatar image={rec.image} name={rec.name} size="60%" />
                            </div>
                            <div className="rec-info-v5">
                                <span className="rec-name-v5">{rec.name}</span>
                                <span className="rec-price-v5">{rec.price} {rec.currency || 'ETH'}</span>
                            </div>
                            <ArrowUpRight size={14} className="rec-arrow-v5" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentDetails;
