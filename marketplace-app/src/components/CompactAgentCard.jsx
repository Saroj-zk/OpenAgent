import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight } from 'lucide-react';
import AgentAvatar from './AgentAvatar';
import './CompactAgentCard.css';

const CompactAgentCard = ({ agent }) => {
    // Determine status tag based on ID or properties
    const isRecent = agent.id % 2 === 0;
    const isTop = agent.id % 3 === 0;

    return (
        <Link to={`/agent/${agent.id}`} className="compact-agent-card">
            <div className="compact-image-area">
                <AgentAvatar image={agent.image} name={agent.name} size="70%" />
                <div className="compact-status-overlay">
                    {isRecent && <div className="compact-status-tag recent">New</div>}
                    {isTop && <div className="compact-status-tag liked">Top</div>}
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'rgba(255,255,255,0.2)', zIndex: 3 }}>
                    <ArrowUpRight size={14} />
                </div>
            </div>

            <div className="compact-details-area">
                <div className="compact-header-row">
                    <h3 className="compact-agent-name">{agent.name}</h3>
                </div>

                <p className="compact-agent-desc">
                    {agent.description || "Autonomous agent optimized for specific high-level tasks and logic execution."}
                </p>

                <div className="compact-footer-row">
                    <div className="compact-agent-price">
                        <Zap size={12} className="zap-icon-mini" fill="currentColor" />
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
