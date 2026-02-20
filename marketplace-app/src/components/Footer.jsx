import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '60px 0 32px', background: 'var(--bg-primary)', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '60px' }}>

                    {/* Brand */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                            OpenAgent
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                            A decentralized marketplace for autonomous AI agents. Built by independent developers for the next generation of software.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '14px', fontWeight: '700', color: '#fff' }}>Marketplace</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <Link to="/explore" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Browse agents</Link>
                            <Link to="/" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Live listings</Link>
                            <Link to="/sell" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Sell an agent</Link>
                        </div>
                    </div>

                    {/* Links 2 - Support */}
                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '14px', fontWeight: '700', color: '#fff' }}>Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>How listing works</a>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Platform Fees</a>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Dispute Resolution</a>
                        </div>
                    </div>

                    {/* Links 3 - Community */}
                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '14px', fontWeight: '700', color: '#fff' }}>Community</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Docs</a>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Discord</a>
                            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none' }}>Updates</a>
                        </div>
                    </div>

                </div>

                <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#666', textAlign: 'left' }}>
                    <span>Open Source • Decentralized Protocol</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
