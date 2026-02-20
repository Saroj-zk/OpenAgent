import React, { useState, useMemo } from 'react';
import AgentCard from '../components/AgentCard';
import { useWallet } from '../context/WalletContext';
import { Search, Sparkles, Filter } from 'lucide-react';
import './Explore.css';

const Explore = () => {
    const { marketplaceAgents } = useWallet();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Recently Listed');

    const categories = useMemo(() => {
        const cats = marketplaceAgents.map(a => a.role);
        return ['All', ...new Set(cats)];
    }, [marketplaceAgents]);

    const filteredAgents = useMemo(() => {
        let filtered = marketplaceAgents.filter(a => {
            const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || a.role === activeCategory;
            return matchesSearch && matchesCategory;
        });

        const sorted = [...filtered];

        if (sortBy === 'Price: Low to High') {
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'Price: High to Low') {
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else {
            // Recently Listed (mocked by ID logic since we don't have timestamps, assuming higher ID is newer)
            sorted.sort((a, b) => b.id - a.id);
        }

        return sorted;
    }, [marketplaceAgents, searchQuery, activeCategory, sortBy]);

    const getCategoryCount = (cat) => {
        if (cat === 'All') return marketplaceAgents.length;
        return marketplaceAgents.filter(a => a.role === cat).length;
    };

    return (
        <div className="explore-container animate-fade-in-up">
            <header className="explore-header">
                <div className="explore-label">
                    <Sparkles size={14} />
                    <span>Verified Agents</span>
                </div>
                <h1 className="explore-title">Marketplace Discovery</h1>
                <p className="explore-description">
                    Access high-performance AI agents built by independent creators. Find specialized logic for your workspace deployment.
                </p>
            </header>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Search</h3>
                        <div className="search-wrapper">
                            <Search size={14} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search agents by name or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Categories</h3>
                        <div className="category-list">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                                >
                                    <span>{cat}</span>
                                    <span className="category-count">{getCategoryCount(cat)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section" style={{ opacity: 0.3, pointerEvents: 'none' }}>
                        <h3 className="sidebar-title">Filter by Model</h3>
                        <div className="category-list">
                            <div className="category-btn"><span>LLM-4.0</span></div>
                            <div className="category-btn"><span>Vision</span></div>
                        </div>
                    </div>
                </aside>

                <main className="explore-main">
                    <div className="results-header">
                        <div className="results-count">
                            {filteredAgents.length} {filteredAgents.length === 1 ? 'AGENT' : 'AGENTS'} IDENTIFIED
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="Recently Listed">Recently Listed</option>
                                <option value="Price: Low to High">Price: Low to High</option>
                                <option value="Price: High to Low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="agent-grid">
                        {filteredAgents.map(agent => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>

                    {filteredAgents.length === 0 && (
                        <div className="empty-discovery">
                            <p>No agents found matching your search parameters.</p>
                            <button
                                className="reset-btn"
                                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            >
                                Reset Discovery
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Explore;
