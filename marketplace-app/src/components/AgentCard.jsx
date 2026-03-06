import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Zap, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import AgentAvatar from './AgentAvatar';
import './AgentCard.css';

const AgentCard = ({ agent }) => {
    const { username, account } = useWallet();

    const isOwner = agent.owner === account || agent.owner === username;
    const ownerName = isOwner && username ? `@${username}` : (agent.owner ? `@${agent.owner.slice(0, 8)}` : '@builder');

    // Deterministic status colors
    const getStatusStyle = (tier) => {
        switch (tier) {
            case 'VERIFIED': return { bg: '#10b981', text: '#fff' };
            case 'REVIEWED': return { bg: '#3b82f6', text: '#fff' };
            default: return { bg: '#f59e0b', text: '#fff' };
        }
    };

    const statusStyle = getStatusStyle(agent.trustTier);

    return (
        <Link to={`/agent/${agent.id}`} className="agent-item-card">
            <div className="agent-image-container">
                <AgentAvatar image={agent.image} name={agent.name} size="100%" style={{ borderRadius: '0' }} />
                <div className="agent-card-overlay-icon">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            <div className="agent-content-area">
                <div className="agent-status-pill" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                    {agent.trustTier || 'RESTRICTED'} • {agent.trustScore || 10}
                </div>

                <div className="agent-main-info">
                    <h3 className="agent-display-name">{agent.name}</h3>
                    <p className="agent-brief-description">
                        {agent.description || "Autonomous agent optimized for specialized task execution and logic processing."}
                    </p>
                </div>

                <div className="agent-divider"></div>

                <div className="agent-pricing-footer">
                    <div className="price-amount">
                        <Zap size={14} className="zap-icon-green" fill="currentColor" />
                        <span>{agent.price} {agent.currency || 'ETH'}</span>
                    </div>
                    <div className="agent-role-text">{agent.role}</div>
                </div>
            </div>
        </Link>
    );
};

export default AgentCard;

