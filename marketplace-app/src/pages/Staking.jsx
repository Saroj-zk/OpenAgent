import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Shield, TrendingUp, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import './Staking.css';
import './StakingSelect.css';

const Staking = () => {
    const { isConnected, connectWallet, stakeTokens, unstakeTokens, stakedAmount, username } = useWallet();
    const [stakeInput, setStakeInput] = useState('');
    const [lockPeriod, setLockPeriod] = useState(0);
    const [rewards, setRewards] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleStake = async (e) => {
        e.preventDefault();
        if (!stakeInput || isNaN(stakeInput) || !username) return;

        setIsProcessing(true);
        const res = await stakeTokens(parseFloat(stakeInput), parseInt(lockPeriod));
        setIsProcessing(false);

        if (res.success) {
            setStakeInput('');
            alert(`Successfully staked ${stakeInput} ETH`);
        } else {
            alert(`Error staking: ${res.error}`);
        }
    };

    const handleUnstake = async () => {
        if (!stakedAmount || stakedAmount <= 0 || !username) return;

        setIsProcessing(true);
        const res = await unstakeTokens(stakedAmount);
        setIsProcessing(false);

        if (res.success) {
            setRewards(0);
            alert('Successfully unstaked ETH.');
        } else {
            alert(`Error unstaking: ${res.error}`);
        }
    };

    const handleClaim = () => {
        if (rewards <= 0) return;
        setRewards(0);
        alert('Rewards claimed successfully!');
    };

    return (
        <div className="staking-container">
            <div className="staking-header">
                <div className="staking-label"><Shield size={14} /> Trust Score Engine</div>
                <h1 className="staking-title">Stake & Elevate.</h1>
                <p className="staking-description">
                    Secure the SAW network by staking your <strong>ETH</strong>. Staking directly boosts your <strong>Trust Score</strong>, granting higher-tier credibility and unlocking premium marketplace functionality.
                </p>
            </div>

            {!isConnected ? (
                <div className="wallet-prompt-box">
                    <Lock size={48} className="lock-icon" />
                    <h2>Connect Wallet to Stake</h2>
                    <p>You need to connect your wallet to view your staking portfolio and participate in the network.</p>
                    <button className="btn btn-primary connect-btn" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                </div>
            ) : (
                <div className="staking-dashboard">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Total Staked</div>
                            <div className="stat-value">{stakedAmount ? stakedAmount.toFixed(4) : '0.0000'} <span>ETH</span></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">Available Rewards</div>
                            <div className="stat-value text-accent">{rewards.toFixed(6)} <span>ETH</span></div>
                            <button className="btn btn-outline claim-btn" onClick={handleClaim} disabled={rewards <= 0}>
                                Claim Rewards
                            </button>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">Current APY</div>
                            <div className="stat-value highlighted">12.5%</div>
                        </div>
                    </div>

                    <div className="action-panels">
                        <div className="panel stake-panel">
                            <h3>Stake ETH</h3>
                            <p>Lock your ETH to boost your Trust Score. Longer lock periods maximize your credibility impact.</p>

                            {!username && (
                                <div style={{ background: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> <span>You must claim an identity (username) first to earn Trust Score.</span>
                                </div>
                            )}

                            <form onSubmit={handleStake} className="stake-form">
                                <div className="input-group">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={stakeInput}
                                        onChange={(e) => setStakeInput(e.target.value)}
                                        className="stake-input"
                                        disabled={!username || isProcessing}
                                    />
                                    <span className="token-symbol">ETH</span>
                                </div>

                                <div className="lock-period-wrapper">
                                    <label>Lock Period (Boosts Trust Multiplier)</label>
                                    <select
                                        className="lock-select"
                                        value={lockPeriod}
                                        onChange={(e) => setLockPeriod(e.target.value)}
                                        disabled={!username || isProcessing}
                                    >
                                        <option value={0}>No Lock (Flexible)</option>
                                        <option value={7}>7 Days (1.5x Boost)</option>
                                        <option value={30}>30 Days (2x Boost)</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary action-btn" disabled={!stakeInput || stakeInput <= 0 || !username || isProcessing}>
                                    {isProcessing ? <RefreshCw size={18} className="spin" /> : 'Stake Now'}
                                </button>
                            </form>
                        </div>

                        <div className="panel unstake-panel">
                            <h3>Unstake Tokens</h3>
                            <p>Withdraw your staked tokens. <strong>Warning:</strong> Unstaking will significantly lower your Trust Score and may drop your Tier.</p>
                            <div className="unstake-info">
                                <div className="info-row">
                                    <span>Available to Unstake</span>
                                    <strong>{stakedAmount ? stakedAmount.toFixed(4) : '0.0000'} ETH</strong>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline action-btn"
                                onClick={handleUnstake}
                                disabled={!stakedAmount || stakedAmount <= 0 || isProcessing || !username}
                            >
                                {isProcessing ? <RefreshCw size={16} className="spin" /> : <><RefreshCw size={16} /> Unstake All</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staking;
