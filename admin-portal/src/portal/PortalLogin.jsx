import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import './Portal.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const PortalLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/portal/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('portalToken', data.token);
                localStorage.setItem('portalUser', JSON.stringify(data.user));
                setTimeout(() => navigate('/portal/dashboard'), 500);
            } else {
                let errorMsg = 'Invalid credentials provided';
                try {
                    const data = await res.json();
                    if (data.error) errorMsg = data.error;
                } catch (e) {
                    if (res.status === 404) errorMsg = 'API Route not found. Did you restart the backend server?';
                }
                setError(errorMsg);
            }
        } catch (err) {
            setError('Connection failed. Please verify the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-body">
            <div className="portal-login-container">
                <div className="portal-login-card animate-fade-in">
                    <div className="portal-logo-icon">
                        <ShieldCheck size={28} />
                    </div>
                    <h2>Admin Portal</h2>
                    <p>Enter your administrative credentials to continue.</p>

                    {error && (
                        <div style={{
                            color: '#ef4444',
                            backgroundColor: '#fef2f2',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: '1px solid #fee2e2',
                            fontWeight: '600'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="portal-input-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="portal-input"
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="admin@openagent.ai"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="portal-input-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    className="portal-input"
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="portal-btn-primary" disabled={loading}>
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>&copy; 2026 OpenAgent Collective</div>
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>Internal Use Only &bull; Secured with Protocol-Level Encryption</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalLogin;
