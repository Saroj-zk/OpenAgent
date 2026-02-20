import React, { useState } from 'react';
import { X, Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const LoginModal = ({ isOpen, onClose }) => {
    const { connectWallet } = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);

    if (!isOpen) return null;

    const handleConnect = async () => {
        setIsConnecting(true);
        const success = await connectWallet();
        if (success) onClose();
        setIsConnecting(false);
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

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Connect Wallet</h3>
                    <p style={{ color: '#555', fontSize: '13px' }}>Authenticate via Web3 provider.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '12px',
                            background: '#00ff88', color: '#000', fontWeight: '900',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '10px', fontSize: '14px'
                        }}
                    >
                        {isConnecting ? <Loader2 size={18} className="animate-spin" /> : (
                            <>
                                <Wallet size={18} />
                                Connect MetaMask
                            </>
                        )}
                    </button>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
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
