import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    ChevronRight,
    Box,
    Activity,
    ShieldCheck,
    Database,
    Cpu,
    Target,
    TrendingUp,
    Zap,
    Users,
    Terminal,
    BarChart3,
    Globe,
    Lock,
    Search,
    BookOpen,
    PieChart
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    const handleExplore = () => navigate('/');
    const handlePublish = () => navigate('/sell');

    return (
        <div className="welcome-page">
            {/* Custom Light Header (Standalone) */}
            <header style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '30px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
                    <div style={{ background: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                        <Terminal size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '18px' }}>SAW</span>
                </div>
                <button onClick={handleExplore} className="btn-teal" style={{ background: '#0f172a', color: '#fff', borderRadius: '10px' }}>
                    Explore Application
                </button>
            </header>

            <div className="welcome-container">
                {/* 01 — HERO */}
                <section className="hero-light">
                    <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        <span className="section-marker">01 — HERO</span>
                        <h1 className="section-title" style={{ fontSize: '72px', color: '#0f172a' }}>
                            The Marketplace for AI Agents
                        </h1>
                        <p className="section-subtitle" style={{ margin: '0 auto 40px' }}>
                            Discover and deploy intelligent agents built by developers around the world.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
                            <button onClick={handleExplore} className="btn-teal">
                                Explore Agents <ArrowRight size={18} />
                            </button>
                            <button onClick={handlePublish} className="btn-outline-teal">
                                Publish an Agent
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual-center">
                        <img
                            src="/blueprint_agent_city_1772905057390.png"
                            alt="City Hub"
                            className="hero-art-img"
                        />
                    </div>

                    <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                        <p className="section-text" style={{ fontSize: '18px', color: '#0f172a', fontWeight: '500' }}>
                            SAW provides the infrastructure for publishing and distributing autonomous agents through a trusted marketplace.
                        </p>
                        <p className="section-text">
                            Every listing includes verifiable artifacts, escrow-protected transactions, and creator reputation signals. From workflow automation to market analysis agents, SAW enables builders to distribute intelligent systems globally.
                        </p>
                    </div>
                </section>

                {/* 02 — PLATFORM VISION */}
                <section className="section-split-light">
                    <div className="sketch-card">
                        <img
                            src="/sketch_ai_future_vision_1772905075487.png"
                            className="sketch-card-img"
                            alt="Future Vision"
                        />
                    </div>
                    <div>
                        <span className="section-marker">02 — PLATFORM VISION</span>
                        <h2 className="section-title">A New Layer of Digital Infrastructure</h2>
                        <p className="section-text" style={{ color: '#0f172a', fontWeight: '600' }}>
                            AI agents are becoming a fundamental layer of modern computing.
                        </p>
                        <p className="section-text">
                            These intelligent systems monitor environments, analyze data, coordinate actions, and automate complex processes across digital ecosystems.
                        </p>
                        <p className="section-text">
                            Despite their rapid growth, there is still no structured environment where these agents can be reliably distributed and discovered. SAW introduces a marketplace designed specifically for autonomous agents.
                        </p>
                        <p className="section-text">
                            Developers can publish their agents, while users can discover trusted systems capable of performing real tasks across automation, research, and analytics.
                        </p>
                        <button onClick={handleExplore} className="btn-teal" style={{ marginTop: '20px' }}>Get Started</button>
                    </div>
                </section>

                {/* 03 — THE AGENT ECONOMY */}
                <section className="section-full">
                    <span className="section-marker">03 — THE AGENT ECONOMY</span>
                    <h2 className="section-title">Autonomous Systems as Digital Assets</h2>

                    <div className="agent-grid-light">
                        <div className="agent-card-light">
                            <div className="agent-icon-box"><Target size={24} /></div>
                            <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Market Monitoring</h4>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Analyze financial signals and execute trades continuously.</p>
                        </div>
                        <div className="agent-card-light">
                            <div className="agent-icon-box"><Zap size={24} /></div>
                            <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Workflow Automation</h4>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Coordinate APIs and automate complex business processes.</p>
                        </div>
                        <div className="agent-card-light">
                            <div className="agent-icon-box"><Search size={24} /></div>
                            <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Research Assistants</h4>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Summarize massive datasets and generate actionable insights.</p>
                        </div>
                        <div className="agent-card-light">
                            <div className="agent-icon-box"><Cpu size={24} /></div>
                            <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Intelligent Systems</h4>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Observe environments and perform tasks independently.</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <p className="section-text" style={{ fontSize: '18px', color: '#0f172a', marginBottom: 0 }}>
                            As these systems become more powerful, they form an emerging digital economy of autonomous agents. SAW provides the infrastructure that allows these agents to be published, evaluated, and transacted through a trusted marketplace.
                        </p>
                    </div>
                </section>

                {/* 04 — PLATFORM FOUNDATIONS */}
                <section className="section-split-light">
                    <div>
                        <span className="section-marker">04 — PLATFORM FOUNDATIONS</span>
                        <h2 className="section-title">Core Systems Behind SAW</h2>
                        <p className="section-subtitle">
                            The marketplace operates through four primary systems that ensure reliable distribution of AI agents.
                        </p>

                        <div className="foundation-item">
                            <span className="foundation-number">01</span>
                            <h4 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Agent Distribution Protocol</h4>
                            <p className="section-text" style={{ fontSize: '14px' }}>A framework that standardizes how AI agents are published, documented, and distributed.</p>
                        </div>
                        <div className="foundation-item">
                            <span className="foundation-number">02</span>
                            <h4 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Reputation Engine</h4>
                            <p className="section-text" style={{ fontSize: '14px' }}>A dynamic scoring engine that evaluates creator reliability based on marketplace activity.</p>
                        </div>
                        <div className="foundation-item">
                            <span className="foundation-number">03</span>
                            <h4 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Economic Infrastructure</h4>
                            <p className="section-text" style={{ fontSize: '14px' }}>Developers can monetize agents through multiple pricing models including subscriptions.</p>
                        </div>
                        <div className="foundation-item">
                            <span className="foundation-number">04</span>
                            <h4 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Automation Ecosystem</h4>
                            <p className="section-text" style={{ fontSize: '14px' }}>Hosting agents across multiple domains including analytics and developer infrastructure.</p>
                        </div>
                    </div>
                    <div className="sketch-card" style={{ padding: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                                <Box size={40} color="#0d9488" style={{ marginBottom: '20px' }} />
                                <div style={{ height: '4px', width: '60%', background: '#0d9488', margin: '0 auto 10px', borderRadius: '2px' }}></div>
                                <div style={{ height: '4px', width: '40%', background: '#e2e8f0', margin: '0 auto', borderRadius: '2px' }}></div>
                            </div>
                            <div style={{ height: '40px', width: '2px', borderLeft: '2px dashed #cbd5e1', margin: '0 auto' }}></div>
                            <div style={{ border: '2px solid #0d9488', padding: '20px', borderRadius: '15px', color: '#0d9488', fontSize: '12px', fontWeight: '800' }}>
                                SECURE PROTOCOL V1.0
                            </div>
                        </div>
                    </div>
                </section>

                {/* 05 — AGENT DISTRIBUTION PROTOCOL */}
                <section className="section-full">
                    <span className="section-marker">05 — AGENT DISTRIBUTION PROTOCOL</span>
                    <h2 className="section-title">Infrastructure for Publishing AI Agents</h2>
                    <p className="section-text" style={{ maxWidth: '800px' }}>
                        SAW provides developers with the tools required to distribute autonomous agents securely. Creators upload agent packages containing the architecture, configuration, and metadata.
                    </p>

                    <div className="metrics-row">
                        <div className="metric-tile">
                            <h5>Agents Listed</h5>
                            <div className="big-val">429,239 <TrendingUp size={24} color="#0d9488" /></div>
                            <div className="sparkline"></div>
                        </div>
                        <div className="metric-tile">
                            <h5>Transactions</h5>
                            <div className="big-val">12,504 <Globe size={20} color="#6366f1" /></div>
                            <div className="sparkline" style={{ borderColor: '#6366f1' }}></div>
                        </div>
                        <div className="metric-tile">
                            <h5>Active Developers</h5>
                            <div className="big-val">3,149 <Users size={20} color="#0d9488" /></div>
                            <div className="sparkline"></div>
                        </div>
                        <div className="metric-tile">
                            <h5>Market Cap</h5>
                            <div className="big-val">$21M <BarChart3 size={20} color="#0d9488" /></div>
                            <div className="sparkline"></div>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', gap: '40px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <p className="section-text" style={{ fontSize: '14px' }}>
                                A cryptographic artifact hash is generated to ensure integrity. When a user acquires an agent, payment is held in escrow while the buyer verifies the system. This ensures trusted transactions between creators and users.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleExplore} className="btn-teal">Explore the Registry</button>
                            <button onClick={handlePublish} className="btn-outline-teal">Publish an Agent</button>
                        </div>
                    </div>
                </section>

                {/* 06 — REPUTATION ENGINE */}
                <section className="section-split-light">
                    <div className="sketch-card">
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '64px', fontWeight: '900', color: '#0d9488', letterSpacing: '-0.05em' }}>300</div>
                            <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.2em', color: '#64748b', marginTop: '10px' }}>TRUST SCORE CEILING</div>
                            <div style={{ marginTop: '40px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '85%', height: '100%', background: '#0d9488' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' }}>
                                <span>STARTER</span>
                                <span>BUILDER</span>
                                <span>EXPERT</span>
                                <span>MASTER</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className="section-marker">06 — REPUTATION ENGINE</span>
                        <h2 className="section-title">Trust Signals for Autonomous Agents</h2>
                        <p className="section-text">
                            SAW maintains marketplace reliability through a dynamic reputation engine. Each creator receives a trust score between 0 and 300 based on their marketplace activity.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                            <div style={{ borderLeft: '2px solid #0d9488', paddingLeft: '16px' }}>
                                <h5 style={{ fontWeight: '700', fontSize: '14px' }}>Success Rate</h5>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Analyzed transaction history and resolution.</p>
                            </div>
                            <div style={{ borderLeft: '2px solid #0d9488', paddingLeft: '16px' }}>
                                <h5 style={{ fontWeight: '700', fontSize: '14px' }}>Listing Bonds</h5>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Economic commitment to the ecosystem.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 07 — MONETIZATION FRAMEWORK */}
                <section className="section-full">
                    <span className="section-marker">07 — MONETIZATION FRAMEWORK</span>
                    <h2 className="section-title">Revenue Models for AI Agents</h2>
                    <div className="agent-grid-light">
                        <div className="agent-card-light">
                            <div className="agent-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}><Box size={24} /></div>
                            <h4 style={{ fontWeight: '700' }}>Direct Purchase</h4>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>Acquire package and deploy locally within your environment.</p>
                        </div>
                        <div className="agent-card-light">
                            <div className="agent-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}><Activity size={24} /></div>
                            <h4 style={{ fontWeight: '700' }}>Subscription</h4>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>Access to hosted agents or continuously updated automation systems.</p>
                        </div>
                        <div className="agent-card-light">
                            <div className="agent-icon-box" style={{ background: '#f0fdf4', color: '#22c55e' }}><Zap size={24} /></div>
                            <h4 style={{ fontWeight: '700' }}>Hybrid Models</h4>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>Combine downloadable agents with ongoing API access.</p>
                        </div>
                    </div>
                </section>

                {/* 08 — REAL-WORLD APPLICATIONS */}
                <section className="section-split-light">
                    <div>
                        <span className="section-marker">08 — REAL-WORLD APPLICATIONS</span>
                        <h2 className="section-title">Intelligent Agents in Production</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'start' }}>
                                <CheckCircle size={20} color="#0d9488" style={{ marginTop: '2px' }} />
                                <div><b style={{ color: '#0f172a' }}>Market monitoring</b> analyzed financial signals.</div>
                            </li>
                            <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'start' }}>
                                <CheckCircle size={20} color="#0d9488" style={{ marginTop: '2px' }} />
                                <div><b style={{ color: '#0f172a' }}>Research agents</b> summarizing complex datasets.</div>
                            </li>
                            <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'start' }}>
                                <CheckCircle size={20} color="#0d9488" style={{ marginTop: '2px' }} />
                                <div><b style={{ color: '#0f172a' }}>Automation agents</b> coordinating workflows across APIs.</div>
                            </li>
                        </ul>
                    </div>
                    <div className="sketch-card">
                        <img src="https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=800" className="sketch-card-img" alt="Data" />
                    </div>
                </section>

                {/* 09 — FEATURED AGENTS */}
                <section className="section-full">
                    <span className="section-marker">09 — FEATURED AGENTS</span>
                    <h2 className="section-title">Emerging Agents in the Ecosystem</h2>
                    <div className="agent-grid-light" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="agent-card-light" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ height: '140px', background: '#f1f5f9', position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: '#0d9488' }}>FEATURED</div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h5 style={{ fontWeight: '800' }}>Agent 0X-{i}24</h5>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 12px' }}>Autonomous Researcher</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700' }}>$149.00</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 10 — RESEARCH & INSIGHTS */}
                <section className="section-full" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
                        <div>
                            <span className="section-marker">10 — RESEARCH & INSIGHTS</span>
                            <h2 className="section-title" style={{ marginBottom: 0 }}>Understanding Autonomous Systems</h2>
                        </div>
                        <button className="btn-outline-teal" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>View all research</button>
                    </div>

                    <div className="research-grid">
                        {[
                            { title: "Autonomous Financial Systems", icon: <BarChart3 /> },
                            { title: "AI-driven Workflow Automation", icon: <Zap /> },
                            { title: "Reputation Infrastructure", icon: <ShieldCheck /> },
                            { title: "Economic Models for Agents", icon: <TrendingUp /> }
                        ].map((item, idx) => (
                            <div key={idx} className="agent-card-light">
                                <div className="agent-icon-box">{item.icon}</div>
                                <h5 style={{ fontWeight: '700', lineHeight: '1.4' }}>{item.title}</h5>
                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0d9488', fontWeight: '800' }}>
                                    READ PAPER <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sketch-card" style={{ marginTop: '60px', height: '300px' }}>
                        <img
                            src="/sketch_data_nodes_research_1772905092030.png"
                            className="sketch-card-img"
                            alt="Research Diagram"
                        />
                    </div>
                </section>

                {/* 11 — FINAL CTA */}
                <section className="section-full" style={{ textAlign: 'center', background: '#f8fafc', margin: '80px -40px 0', padding: '120px 40px' }}>
                    <span className="section-marker">11 — FINAL CTA</span>
                    <h2 className="section-title" style={{ fontSize: '56px' }}>Discover the Next Generation of AI Agents</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto 48px' }}>
                        Participate in a growing marketplace built for intelligent automation. Explore agents or publish your own systems today.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button onClick={handleExplore} className="btn-teal" style={{ padding: '16px 40px', fontSize: '16px' }}>Explore Agents</button>
                        <button onClick={handlePublish} className="btn-outline-teal" style={{ padding: '16px 40px', fontSize: '16px' }}>Publish Your Agent</button>
                    </div>
                </section>
            </div>

            {/* LIGHT FOOTER */}
            <footer className="welcome-footer-light">
                <div className="footer-column">
                    <div className="footer-logo">
                        <Terminal size={24} color="#0d9488" />
                        <span>SAW</span>
                    </div>
                    <p className="section-text" style={{ fontSize: '14px' }}>
                        Marketplace for discovering, publishing, and monetizing AI agents.
                    </p>
                    <div style={{ marginTop: '40px', fontSize: '11px', color: '#cbd5e1', fontWeight: '700', letterSpacing: '0.05em' }}>
                        OPEN SOURCE • DECENTRALIZED PROTOCOL
                    </div>
                </div>
                <div className="footer-column">
                    <h6>Marketplace</h6>
                    <a href="#" className="footer-link">Browse Agents</a>
                    <a href="#" className="footer-link">Publish Agent</a>
                </div>
                <div className="footer-column">
                    <h6>Resources</h6>
                    <a href="#" className="footer-link">Documentation</a>
                    <a href="#" className="footer-link">How It Works</a>
                    <a href="#" className="footer-link">Dispute Resolution</a>
                </div>
                <div className="footer-column">
                    <h6>Community</h6>
                    <a href="#" className="footer-link">Forum</a>
                    <a href="#" className="footer-link">Updates</a>
                    <a href="#" className="footer-link">Support</a>
                </div>
            </footer>
        </div>
    );
};

// Internal icon for bullet points
const CheckCircle = ({ size, color, style }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        style={style}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const Shield = ({ size, color }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default Landing;
