import React from 'react';
import { Link } from 'react-router-dom';
import { MoveRight, Star, TrendingUp, ArrowUpRight } from 'lucide-react';
import AgentAvatar from './AgentAvatar';

const TrendingSection = ({ agents }) => {
    const trending = agents.length > 0 ? agents.slice(0, 4) : [];
    if (trending.length === 0) return null;

    return (
        <section className="container" style={{ marginBottom: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '60px' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: '950', color: 'var(--brand-primary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>GLOBAL_REGISTRY_METRICS</div>
                    <h3 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.04em', color: '#fff', lineHeight: 1 }}>Top Market Assets</h3>
                </div>
                <Link to="/explore" style={{
                    fontSize: '11px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    padding: '14px 28px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s'
                }}>
                    EXPLORE ALL <MoveRight size={14} />
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trending.map((agent, i) => (
                    <Link key={agent.id} to={`/agent/${agent.id}`} style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 2.5fr 1.2fr 1fr 140px',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        padding: '24px 32px',
                        textDecoration: 'none',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateX(8px)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}>

                        <span style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.15)', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>0{i + 1}</span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <AgentAvatar image={agent.image} name={agent.name} size="64px" style={{ borderRadius: '16px' }} />
                                <div style={{ position: 'absolute', right: '4px', bottom: '4px', width: '12px', height: '12px', background: 'var(--brand-primary)', borderRadius: '50%', border: '3px solid #000' }}></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>{agent.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                    <Star size={12} fill="var(--brand-warm)" color="var(--brand-warm)" />
                                    <span>Verified Creator</span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>|</span>
                                    <span>{agent.model || 'GPT-4o'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.2)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Domain</span>
                            <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '700' }}>{agent.role}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.2)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trust</span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                {[...Array(5)].map((_, starIndex) => (
                                    <div key={starIndex} style={{ width: '14px', height: '4px', background: starIndex < 4 ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '2px' }}></div>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.2)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</span>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                                {agent.price} {agent.currency || 'ETH'}
                            </div>
                        </div>

                        <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.1 }}>
                            <ArrowUpRight size={32} />
                        </div>

                    </Link>
                ))}
            </div>
        </section>
    );
};

export default TrendingSection;
