import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('portalToken', data.token);
                localStorage.setItem('portalUser', JSON.stringify(data.user));
                navigate('/portal/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-body">
            <div className="portal-login-container">
                <form className="portal-login-card" onSubmit={handleLogin}>
                    <h2>Admin Portal</h2>
                    <p>Enter your credentials to manage the platform.</p>

                    {error && <div style={{ color: 'red', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Email Address</label>
                    <input
                        type="email"
                        className="portal-input"
                        placeholder="admin@openagent.ai"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Password</label>
                    <input
                        type="password"
                        className="portal-input"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="portal-btn" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        &copy; 2026 OpenAgent Management Interface
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortalLogin;
