import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight } from 'lucide-react';
import AgentAvatar from './AgentAvatar';
import './CompactAgentCard.css';

const CompactAgentCard = ({ agent }) => {
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
        <Link to={`/agent/${agent.id}`} className="compact-agent-card">
            <div className="compact-image-area">
                <AgentAvatar image={agent.image} name={agent.name} size="100%" style={{ borderRadius: '0' }} />
                <div className="compact-overlay-icon">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            <div className="compact-details-area">
                <div className="compact-status-pill" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                    {agent.trustTier || 'RESTRICTED'} • {agent.trustScore || 10}
                </div>

                <div className="compact-main-info">
                    <h3 className="compact-agent-name">{agent.name}</h3>
                    <p className="compact-agent-desc">
                        {agent.description || "Autonomous agent optimized for specific high-level tasks and logic execution."}
                    </p>
                </div>

                <div className="compact-divider"></div>

                <div className="compact-footer-row">
                    <div className="compact-agent-price">
                        <Zap size={14} className="zap-icon-green" fill="currentColor" />
                        <span>{agent.price} {agent.currency || 'ETH'}</span>
                    </div>
                    <div className="compact-role-badge">
                        {agent.role}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CompactAgentCard;
