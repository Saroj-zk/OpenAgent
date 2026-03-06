import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { User, ShieldCheck } from 'lucide-react';

const Identity = () => {
    const { isConnected, saveUsername, username } = useWallet();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Only redirect if username is ALREADY set
    useEffect(() => {
        if (isConnected && username) {
            console.log("Identity established, redirecting to home...");
            navigate('/', { replace: true });
        }
    }, [isConnected, username, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanName = name.trim().toLowerCase();

        if (cleanName.length < 3) {
            setError('Your name must be at least 3 characters long.');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
            setError('Only letters, numbers, and underscores are allowed.');
            return;
        }

        setIsSubmitting(true);
        console.log("Attempting to claim identity:", cleanName);

        const result = await saveUsername(cleanName);

        if (result.success) {
            // The useEffect will handle navigation when 'username' state updates in context
            console.log("Identity saved successfully.");
        } else {
            setError(result.error);
            setIsSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ padding: '160px 0', textAlign: 'center' }}>
                <h2 style={{ color: '#fff', marginBottom: '24px' }}>Identity Required</h2>
                <p style={{ color: '#666' }}>You must connect your wallet and register a unique identifier to proceed.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '32px' }}>Return to Home</button>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in-up" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '140px' }}>
            <div style={{
                maxWidth: '520px',
                width: '100%',
                background: '#080808',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '48px',
                padding: '60px',
                textAlign: 'center',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(30px)'
            }}>

                <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 40px',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)'
                }}>
                    <User size={40} color="#6366f1" />
                </div>

                <h1 style={{ fontSize: '38px', fontWeight: '950', marginBottom: '16px', letterSpacing: '-0.05em', color: '#fff', lineHeight: 1 }}>Claim Authority</h1>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', marginBottom: '48px', fontWeight: '500' }}>
                    Register your unique identifier within the global AI registry. Your identity is mathematically linked to your cryptographic wallet.
                </p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.25em', color: '#444', marginBottom: '16px' }}>
                            PROTO_IDENTITY_NAME
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontWeight: '950', fontSize: '18px' }}>@</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="independent_builder"
                                style={{
                                    width: '100%',
                                    background: '#000',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '20px',
                                    padding: '24px 24px 24px 48px',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    outline: 'none',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    fontFamily: 'var(--font-mono)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.boxShadow = 'none';
                                }}
                                autoFocus
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>• {error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            height: '72px',
                            borderRadius: '24px',
                            background: '#6366f1',
                            fontSize: '16px',
                            fontWeight: '950',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        {isSubmitting ? 'SECURE_REGISTRY...' : 'INITIALIZE IDENTITY'}
                    </button>
                </form>

                <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', color: '#333' }}>
                    <ShieldCheck size={16} color="#6366f1" />
                    <span style={{ fontSize: '10px', fontWeight: '950', letterSpacing: '0.15em', textTransform: 'uppercase' }}>DECENTRALIZED AUTHORITY VERIFIED</span>
                </div>
            </div>
        </div>
    );
};

export default Identity;
