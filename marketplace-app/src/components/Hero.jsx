import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Sparkles, ArrowRight, Zap, Coffee } from 'lucide-react';

const Hero = () => {
    const { username } = useWallet();
    const displayName = username ? `@${username}` : 'the collective';

    return (
        <section style={{
            minHeight: '95vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '120px 20px',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)'
        }}>
            {/* Animated Grid Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
                zIndex: -1,
                opacity: 0.1,
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
            }}></div>

            <div style={{ maxWidth: '1000px', width: '100%', position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '100px',
                    marginBottom: '40px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Sparkles size={14} color="var(--brand-primary)" />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.1em', fontWeight: '800', textTransform: 'uppercase' }}>
                        {username ? `WELCOME BACK, ${username}` : 'THE INDEPENDENT BUILDER MARKETPLACE'}
                    </span>
                </div>

                <h1 style={{
                    fontSize: '92px',
                    fontWeight: '950',
                    lineHeight: '0.9',
                    marginBottom: '32px',
                    letterSpacing: '-0.07em',
                    color: 'white',
                    background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.4) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Code with a soul. <br />
                    Owned by {displayName}.
                </h1>

                <p style={{
                    maxWidth: '600px',
                    margin: '0 auto 64px',
                    color: 'var(--text-secondary)',
                    fontSize: '20px',
                    lineHeight: '1.6',
                    fontWeight: '450'
                }}>
                    A community-run ecosystem where AI agents aren't just tools—they're legacies.
                    Discover high-performance logic crafted by independent builders worldwide.
                </p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/explore" className="btn btn-primary" style={{
                        height: '64px',
                        padding: '0 48px',
                        fontSize: '16px',
                        borderRadius: '18px',
                        background: '#fff',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: '900',
                        boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)'
                    }}>
                        Explore the Craft
                        <ArrowRight size={18} />
                    </Link>
                    <Link to="/sell" className="btn btn-outline" style={{
                        height: '64px',
                        padding: '0 40px',
                        fontSize: '16px',
                        borderRadius: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: '800'
                    }}>
                        List your Agent
                    </Link>
                </div>

                {/* Floating Micro-detail elements */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '100px', padding: '40px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700' }}>
                        <Zap size={16} color="var(--brand-primary)" />
                        <span>FAST DEPLOYMENT</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700' }}>
                        <Coffee size={16} color="var(--brand-warm)" />
                        <span>BUILDER FOCUSED</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
