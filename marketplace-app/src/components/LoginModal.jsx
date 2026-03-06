import React, { useState, useMemo } from 'react';
import { X, Wallet, Loader2, ChevronRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const LoginModal = ({ isOpen, onClose }) => {
    const { connectWallet } = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingTo, setConnectingTo] = useState('');

    const providerOptions = useMemo(() => {
        if (!window.ethereum) return [];
        const rawProviders = window.ethereum.providers ? window.ethereum.providers : [window.ethereum];
        const options = [];

        rawProviders.forEach((p, idx) => {
            if (p.isMetaMask) options.push({ name: 'MetaMask', provider: p, id: 'metamask' });
            else if (p.isCoinbaseWallet) options.push({ name: 'Coinbase Wallet', provider: p, id: 'coinbase' });
            else if (p.isBraveWallet) options.push({ name: 'Brave Wallet', provider: p, id: 'brave' });
            else if (p.isTrust) options.push({ name: 'Trust Wallet', provider: p, id: 'trust' });
            else options.push({ name: 'Browser Wallet', provider: p, id: `browser-${idx}` });
        });

        // Remove duplicates based on ID (sometimes providers re-register)
        const uniqueOptions = Array.from(new Map(options.map(item => [item.id, item])).values());
        return uniqueOptions;
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConnect = async (option) => {
        setIsConnecting(true);
        setConnectingTo(option.name);
        const success = await connectWallet(option.provider);
        if (success) onClose();
        setIsConnecting(false);
        setConnectingTo('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '40px',
            zIndex: 10000,
            animation: 'modalFadeIn 0.2s ease-out'
        }}>
            <div style={{
                width: '360px',
                background: '#0a0a0a',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                border: '1px solid #1a1a1a',
                position: 'relative',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'rgba(255,255,255,0.03)', border: 'none', color: '#666',
                        width: '28px', height: '28px', borderRadius: '50%',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <X size={16} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Connect Wallet</h3>
                    <p style={{ color: '#555', fontSize: '13px' }}>Select an available Web3 provider.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {providerOptions.length > 0 ? (
                        providerOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleConnect(option)}
                                disabled={isConnecting}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)', color: '#fff', fontWeight: '800',
                                    border: '1px solid rgba(255,255,255,0.05)', cursor: isConnecting ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { if (!isConnecting) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={(e) => { if (!isConnecting) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Wallet size={18} color="var(--brand-primary)" />
                                    {option.name}
                                </div>
                                {isConnecting && connectingTo === option.name ? (
                                    <Loader2 size={16} className="animate-spin" color="#666" />
                                ) : (
                                    <ChevronRight size={16} color="#444" />
                                )}
                            </button>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
                            <p style={{ color: '#666', fontSize: '13px' }}>No Ethereum provider detected.</p>
                            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', fontSize: '13px', fontWeight: '800', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
                                Install MetaMask
                            </a>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#333', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>
                        DECENTRALIZED • SECURE
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes modalFadeIn { 
                    from { opacity: 0; transform: translateY(-10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginModal;
