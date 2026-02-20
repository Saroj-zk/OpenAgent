import React from 'react';
import { Hammer, UploadCloud, Banknote } from 'lucide-react';

const CommunityStory = () => {
    return (
        <section className="container" style={{ padding: '80px 24px', position: 'relative' }}>

            {/* ARCHITECTURAL TRUST ENGINE: ANTI-SCAM PROTOCOL */}
            <div style={{ marginBottom: '160px', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '6px 16px', background: 'rgba(29, 155, 240, 0.05)', border: '1px solid rgba(29, 155, 240, 0.2)', borderRadius: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: '#1d9bf0', boxShadow: '0 0 10px #1d9bf0' }}></div>
                        <span style={{ fontSize: '11px', color: '#1d9bf0', fontFamily: 'monospace', fontWeight: '800', letterSpacing: '0.1em' }}>PROTOCOL // ANTI-FRAUD</span>
                    </div>
                    <h2 style={{ fontSize: '64px', fontWeight: '950', lineHeight: '1.05', marginBottom: '24px', letterSpacing: '-0.05em', color: '#fff' }}>
                        Zero-Trust <span style={{ color: '#1d9bf0' }}>Asset Validation.</span>
                    </h2>
                    <p style={{ color: '#888', maxWidth: '800px', margin: '0 auto', fontSize: '20px', lineHeight: '1.6' }}>
                        90% of AI marketplaces are flooded with copy-pasted wrappers and bot-farmed reviews.
                        We engineered a military-grade validation architecture that makes faking reputation computationally impossible.
                    </p>
                </div>

                {/* The Architectural Flow */}
                <div className="architecture-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(220px, 1fr) auto minmax(350px, 1fr) auto minmax(220px, 1fr)',
                    gap: '24px',
                    alignItems: 'stretch',
                    background: '#030303',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '60px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
                }}>
                    {/* Background grid */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(29, 155, 240, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 155, 240, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }}></div>

                    {/* COL 1: INGESTION */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>

                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>STAGE 01. INGEST</span>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: 0 }}>Raw Market Data</h4>
                        </div>

                        <div className="flow-node">
                            <span className="node-id" style={{ color: '#1d9bf0', fontWeight: '800' }}>0x1</span>
                            <span>Unknown Agent Build</span>
                        </div>
                        <div className="flow-node">
                            <span className="node-id" style={{ color: '#1d9bf0', fontWeight: '800' }}>0x2</span>
                            <span>Raw Engagement Logs</span>
                        </div>
                        <div className="flow-node">
                            <span className="node-id" style={{ color: '#1d9bf0', fontWeight: '800' }}>0x3</span>
                            <span>Wallet Trace History</span>
                        </div>

                        <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255, 50, 50, 0.05)', border: '1px dashed rgba(255, 50, 50, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#ff4444', fontFamily: 'monospace', fontWeight: '800', letterSpacing: '0.1em' }}>STATUS: POTENTIAL SCAM</span>
                        </div>
                    </div>

                    {/* CONNECTION 1 */}
                    <div className="connector" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, width: '40px' }}>
                        <div className="data-line"></div>
                    </div>

                    {/* COL 2: VALIDATION ENGINE */}
                    <div className="engine-core" style={{
                        position: 'relative',
                        zIndex: 1,
                        background: 'rgba(29, 155, 240, 0.03)',
                        border: '1px solid rgba(29, 155, 240, 0.3)',
                        borderRadius: '16px',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        boxShadow: 'inset 0 0 60px rgba(29, 155, 240, 0.05), 0 0 40px rgba(29,155,240,0.1)'
                    }}>
                        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(29, 155, 240, 0.2)', paddingBottom: '24px', marginBottom: '8px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#1d9bf0', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>STAGE 02. PROCESSING</span>
                            <h4 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Cryptographic Core</h4>
                            <div className="processing-bar"><div></div></div>
                        </div>

                        <div className="engine-module">
                            <div className="module-header">
                                <h5>Sybil Cluster Defense</h5>
                                <span className="badge">ANTI-FARM</span>
                            </div>
                            <p>Detects and eliminates bot-nets. Arbitrary upvotes are neutralized before they impact the ledger.</p>
                        </div>

                        <div className="engine-module">
                            <div className="module-header">
                                <h5>RPWV Graph Analysis</h5>
                                <span className="badge">AUTHENTICITY</span>
                            </div>
                            <p>Evaluates the evaluator. Fake engagement from dead wallets yields absolutely zero reputation.</p>
                        </div>

                        <div className="engine-module">
                            <div className="module-header">
                                <h5>Time-Decay Protocol</h5>
                                <span className="badge">LONGEVITY</span>
                            </div>
                            <p>Penalizes hit-and-run scams. Continuous organic utility is mathematically required to maintain score.</p>
                        </div>
                    </div>

                    {/* CONNECTION 2 */}
                    <div className="connector" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, width: '40px' }}>
                        <div className="data-line"></div>
                    </div>

                    {/* COL 3: VERIFIED OUTPUT */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 0' }}>

                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>STAGE 03. CLEARANCE</span>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: 0 }}>Immutable Proof</h4>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <div className="core-shield" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #1d9bf0, #0a4270)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(29, 155, 240, 0.4)', marginBottom: '24px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Verified Asset</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                Only authentic, high-quality agents survive the engine. You buy with absolute mathematical confidence.
                            </p>
                        </div>

                        <div style={{ padding: '20px', background: 'rgba(29, 155, 240, 0.05)', border: '1px solid rgba(29, 155, 240, 0.2)', borderRadius: '12px' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: '#1d9bf0', fontFamily: 'monospace', marginBottom: '8px', letterSpacing: '0.05em' }}>IMMUNITY_SCORE_GENERATED</span>
                            <div style={{ color: '#fff', fontSize: '28px', fontWeight: '900', fontFamily: 'monospace' }}>84.992 <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>/ 100</span></div>
                        </div>

                    </div>

                </div>

                <style>{`
                    .flow-node {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 16px;
                        background: rgba(255,255,255,0.02);
                        border: 1px solid rgba(255,255,255,0.05);
                        border-radius: 8px;
                        font-size: 13px;
                        color: #ccc;
                        font-family: monospace;
                        position: relative;
                    }
                    .flow-node::before {
                        content: '';
                        position: absolute;
                        left: 0; top: 0; bottom: 0; width: 2px;
                        background: rgba(255,255,255,0.1);
                    }
                    .engine-module {
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(29, 155, 240, 0.15);
                        padding: 20px;
                        border-radius: 8px;
                        position: relative;
                        overflow: hidden;
                    }
                    .engine-module::after {
                        content: '';
                        position: absolute;
                        left: 0; top: 0; bottom: 0; width: 3px;
                        background: #1d9bf0;
                    }
                    .module-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .module-header h5 {
                        color: #fff;
                        font-size: 15px;
                        font-weight: 800;
                        margin: 0;
                    }
                    .badge {
                        font-family: monospace;
                        font-size: 9px;
                        padding: 2px 6px;
                        background: rgba(29, 155, 240, 0.1);
                        color: #1d9bf0;
                        border: 1px solid rgba(29, 155, 240, 0.2);
                        border-radius: 4px;
                    }
                    .engine-module p {
                        margin: 0;
                        font-size: 13px;
                        color: rgba(255,255,255,0.4);
                        line-height: 1.5;
                    }
                    .processing-bar {
                        height: 2px;
                        width: 100%;
                        background: rgba(29, 155, 240, 0.1);
                        border-radius: 2px;
                        overflow: hidden;
                        margin: 16px auto 0 auto;
                        width: 60%;
                    }
                    .processing-bar div {
                        height: 100%;
                        width: 30%;
                        background: #1d9bf0;
                        animation: slide 2s infinite ease-in-out;
                    }
                    @keyframes slide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(350%); }
                    }
                    .data-line {
                        width: 100%;
                        height: 2px;
                        background: rgba(255,255,255,0.05);
                        position: relative;
                    }
                    .data-line::after {
                        content: '';
                        position: absolute;
                        left: 0; top: -1px; width: 20px; height: 4px;
                        background: #1d9bf0;
                        box-shadow: 0 0 10px #1d9bf0;
                        animation: datalink 1.5s infinite linear;
                    }
                    @keyframes datalink {
                        0% { left: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { left: 100%; opacity: 0; }
                    }
                    @media (max-width: 1100px) {
                        .architecture-grid {
                            grid-template-columns: 1fr;
                            gap: 40px;
                        }
                        .connector {
                            width: 2px !important;
                            height: 40px;
                            margin: 0 auto;
                        }
                        .data-line {
                            width: 2px;
                            height: 100%;
                        }
                        .data-line::after {
                            width: 4px; height: 20px;
                            top: 0; left: -1px;
                            animation: datadown 1.5s infinite linear;
                        }
                        @keyframes datadown {
                            0% { top: 0; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                    }
                `}</style>
            </div>

            {/* Header: The Vision (Promoted from Manifesto) */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '160px', textAlign: 'center', marginBottom: '80px' }}>
                <span className="section-label" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5em', fontSize: '11px' }}>THE MANIFESTO</span>
                <h2 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.05', marginBottom: '32px', letterSpacing: '-0.06em', color: '#fff' }}>
                    Software belongs to the <br /> people who build it.
                </h2>
                <div style={{ maxWidth: '600px', margin: '0 auto', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: '32px' }}></div>
                <p style={{ fontSize: '22px', color: '#888', lineHeight: '1.7', maxWidth: '780px', margin: '0 auto', fontWeight: '400' }}>
                    For too long, the value of code has been captured by platforms, not creators. We're changing that.
                    This is a marketplace where you own your work and thrive on your ingenuity.
                </p>
            </div>

            {/* Content Container */}
            <div style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
                    {/* Step 1 */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Hammer size={28} color="#fff" strokeWidth={1.5} />
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Craft it yourself</h4>
                        <p style={{ fontSize: '15px', color: '#777', lineHeight: '1.7' }}>
                            Whether it's a simple script or a complex autonomous agent, bring your best work. No corporate roadmap, just your vision.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <UploadCloud size={28} color="#fff" strokeWidth={1.5} />
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Share it freely</h4>
                        <p style={{ fontSize: '15px', color: '#777', lineHeight: '1.7' }}>
                            Publish to a global audience instantly. We don't gatekeep. We don't pick favorites. If it solves a problem, it belongs here.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Banknote size={28} color="#fff" strokeWidth={1.5} />
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Earn what you deserve</h4>
                        <p style={{ fontSize: '15px', color: '#777', lineHeight: '1.7' }}>
                            Set your own price. Get paid directly. We exist to make indie development a viable career, not just a hobby.
                        </p>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default CommunityStory;
