import React from 'react';
import { Heart, ShieldCheck, Cpu, Globe, Zap } from 'lucide-react';

const Features = () => {
    return (
        <section className="container" style={{ paddingBottom: '240px', paddingTop: '160px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

                <div
                    style={{
                        padding: '80px',
                        borderRadius: '56px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                        backdropFilter: 'blur(60px)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        textAlign: 'left',
                        display: 'grid',
                        gridTemplateColumns: '1.3fr 1fr',
                        gap: '80px',
                        alignItems: 'center',
                        boxShadow: '0 100px 200px -60px rgba(0,0,0,0.9)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative radial circle */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--brand-primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>

                    {/* Manifesto Content */}
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '10px 20px', background: 'rgba(255,75,75,0.05)', borderRadius: '100px', border: '1px solid rgba(255,75,75,0.1)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4b4b', boxShadow: '0 0 15px rgba(255,75,75,0.5)' }}></div>
                            <span style={{ fontSize: '11px', color: '#ff4b4b', letterSpacing: '0.25em', fontWeight: '900', textTransform: 'uppercase' }}>THE BUILDER MANIFESTO</span>
                        </div>

                        <h3 style={{ fontSize: '64px', fontWeight: '950', marginBottom: '32px', letterSpacing: '-0.06em', color: '#fff', lineHeight: '0.9' }}>
                            Codebase with <br /> <span style={{ color: 'var(--brand-primary)' }}>a Pulse.</span>
                        </h3>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '20px', lineHeight: '1.7', marginBottom: '56px', maxWidth: '540px', fontWeight: '450' }}>
                            OpenAgent is a decentralized infrastructure for independent creators. Every agent listed here is a testament to high-performance logic—untethered from corporate silos and optimized for the open economy.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}><Cpu size={20} color="var(--brand-primary)" /></div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontWeight: '900', letterSpacing: '0.1em', marginBottom: '6px' }}>OWNERSHIP</div>
                                    <div style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>Full Control</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}><ShieldCheck size={20} color="var(--brand-secondary)" /></div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontWeight: '900', letterSpacing: '0.1em', marginBottom: '6px' }}>TRUST</div>
                                    <div style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>On-Chain Proof</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Box */}
                    <div style={{ padding: '64px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 40px' }}>
                            <div style={{ position: 'absolute', inset: 0, background: '#ff4b4b', filter: 'blur(40px)', opacity: 0.2 }}></div>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Heart
                                    size={56}
                                    fill="#ff4b4b"
                                    style={{ color: '#ff4b4b', filter: 'drop-shadow(0 0 20px rgba(255, 75, 75, 0.4))' }}
                                />
                            </div>
                        </div>

                        <h4 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '20px', letterSpacing: '-0.03em' }}>Support the Network</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                            Help us maintain a neutral, open-source infrastructure for the next generation of AI. Your contributions fuel the decentralized registry.
                        </p>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                height: '72px',
                                borderRadius: '22px',
                                fontSize: '18px',
                                background: '#fff',
                                color: '#000',
                                fontWeight: '900',
                                marginBottom: '24px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <Zap size={20} fill="#000" />
                            Contribute ETH
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
                            <Globe size={14} color="#fff" />
                            <span style={{ fontSize: '11px', color: '#fff', fontWeight: '800', letterSpacing: '0.15em' }}>SECURE GLOBAL COLLECTIVE</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
