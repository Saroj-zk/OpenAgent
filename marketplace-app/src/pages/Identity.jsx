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

    // If not connected, show a message instead of a black screen
    <div className="container" style={{ padding: '160px 0', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '24px' }}>Identity Required</h2>
        <p style={{ color: '#666' }}>You must connect your wallet and register a unique identifier to proceed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '32px' }}>Return to Home</button>
    </div>

    return (
        <div className="container animate-fade-in-up" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '48px', textAlign: 'center' }}>

                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                    <User size={32} color="#fff" />
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.04em' }}>Register Identity</h1>
                <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                    Every participant in the registry must claim a unique username. This record is immutable and stored on-chain.
                </p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#444', marginBottom: '12px' }}>
                            CHOOSE A UNIQUE USERNAME
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#333', fontWeight: '800' }}>@</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="independent_builder"
                                style={{
                                    width: '100%',
                                    background: '#000',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    padding: '16px 16px 16px 36px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#555'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                autoFocus
                            />
                        </div>
                        {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginTop: '12px', fontWeight: '600' }}>{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', height: '60px', borderRadius: '18px' }}
                    >
                        {isSubmitting ? 'Registering...' : 'Claim Identity'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#333' }}>
                    <ShieldCheck size={14} />
                    <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>VERIFIED REGISTRY IDENTITY</span>
                </div>
            </div>
        </div>
    );
};

export default Identity;
