import React, { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import CompactAgentCard from '../components/CompactAgentCard';
import CommunityStory from '../components/CommunityStory';
import TrendingSection from '../components/TrendingSection';
import Features from '../components/Features';
import { useWallet } from '../context/WalletContext';
import { Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown, HandHeart } from 'lucide-react';

const Home = () => {
    const { marketplaceAgents } = useWallet();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Get unique categories for filters
    const categories = useMemo(() => {
        const cats = marketplaceAgents.map(a => a.role);
        return ['All', ...new Set(cats)];
    }, [marketplaceAgents]);

    // Filtering & Sorting Logic
    const filteredAgents = useMemo(() => {
        let result = [...marketplaceAgents];

        // Search Filter
        if (searchQuery) {
            result = result.filter(a =>
                a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category Tab Filter
        if (activeTab !== 'All') {
            result = result.filter(a => a.role === activeTab);
        }

        // Sorting
        if (sortBy === 'price_low') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price_high') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'newest') result.reverse();

        return result;
    }, [marketplaceAgents, searchQuery, activeTab, sortBy]);

    return (
        <div className="animate-fade-in-up">
            <Hero />

            <TrendingSection agents={[...marketplaceAgents].reverse()} />

            {/* Marketplace Main Container */}
            <section className="container" style={{ paddingBottom: '160px', paddingTop: '40px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '80px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '6px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }}></div>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Registry Snapshot</span>
                    </div>
                    <h2 style={{ fontSize: '64px', fontWeight: '950', marginBottom: '24px', letterSpacing: '-0.06em', color: '#fff', lineHeight: '1.0' }}>Built by Builders. <br /> <span style={{ opacity: 0.3 }}>Verified by code.</span></h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '20px', lineHeight: '1.6', fontWeight: '450' }}>
                        Browse the current census of {marketplaceAgents.length} independent AI agents ready for deployment.
                    </p>
                </div>

                {/* Toolbar: Search, Tabs, and Sort */}
                <div style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '28px',
                    padding: '16px',
                    marginBottom: '48px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Top Row: Search & Category Tabs */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '320px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                                <input
                                    type="text"
                                    placeholder="Search the registry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '18px',
                                        padding: '18px 20px 18px 56px',
                                        color: 'white',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(0,0,0,0.5)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.05)'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {['All', 'Newest', 'Top Rated'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setSortBy(filter.toLowerCase().replace(' ', '_'))}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: sortBy.includes(filter.toLowerCase().split(' ')[0]) ? 'rgba(255,255,255,0.06)' : 'transparent',
                                            color: sortBy.includes(filter.toLowerCase().split(' ')[0]) ? '#fff' : 'rgba(255,255,255,0.3)',
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Row: Advanced Filters & Results Count */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '75%', paddingBottom: '4px' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        style={{
                                            background: activeTab === cat ? '#fff' : 'rgba(255,255,255,0.02)',
                                            color: activeTab === cat ? '#000' : 'rgba(255,255,255,0.4)',
                                            border: '1px solid',
                                            borderColor: activeTab === cat ? '#fff' : 'rgba(255,255,255,0.05)',
                                            padding: '10px 24px',
                                            borderRadius: '100px',
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                    {filteredAgents.length} IDENTIFIED
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="newest">Sort By: Newest</option>
                                    <option value="price_low">Price (Low)</option>
                                    <option value="price_high">Price (High)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsive Grid for Agents */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '16px'
                }}>
                    {filteredAgents.length > 0 ? (
                        [...filteredAgents].sort(() => 0.5 - Math.random()).slice(0, 5).map((agent) => (
                            <CompactAgentCard key={agent.id} agent={agent} />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', border: '1px dashed #222', borderRadius: '32px' }}>
                            <p style={{ color: '#444', fontSize: '18px', fontWeight: '500' }}>No agents match this search. Try a different category?</p>
                            <button onClick={() => { setSearchQuery(''); setActiveTab('All'); }} style={{ marginTop: '20px', color: '#fff', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: '700' }}>Reset discovery</button>
                        </div>
                    )}
                </div>

                {filteredAgents.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '80px' }}>
                        <button className="btn btn-outline" style={{ padding: '0 64px' }}>
                            Discover More
                        </button>
                    </div>
                )}
            </section>



            <CommunityStory />
            <Features />
        </div>
    );
};

export default Home;
