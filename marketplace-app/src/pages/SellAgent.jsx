import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    Upload, DollarSign, Bot, FileText, CheckCircle2,
    AlertCircle, Sparkles, Terminal, Github, Cpu,
    Link as LinkIcon, Info, Coins, Image as ImageIcon,
    Globe, MessageCircle, FileCode, Layers, Zap, User,
    Shield, Code, Brackets, Key, Activity, ListChecks,
    Scale, Monitor, Play, Rocket, AlertTriangle, Fingerprint,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL, PROTOCOL_DOMAINS } from '../config';
import './SellAgent.css';

const SellAgent = () => {
    const { isConnected, addAgent, account, username, trustScore } = useWallet();
    const navigate = useNavigate();

    const getTrustTier = (score) => {
        if (score >= 150) return 'MASTER';
        if (score >= 60) return 'EXPERT';
        if (score >= 30) return 'BUILDER';
        return 'STARTER';
    };

    const tier = getTrustTier(trustScore || 0);

    let bondText = "";
    if (tier === 'STARTER') bondText = "Welcome to the network. Your listing will be EXPERT before being visible. Bond: 5x";
    else if (tier === 'BUILDER') bondText = "Your listing will go through review before going live. Bond required: 3x";
    else if (tier === 'EXPERT') bondText = "Bond required: 2x";
    else if (tier === 'MASTER') bondText = "Bond required: 1x";

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        role: '',
        description: '',
        useCase: '',
        capabilities: ['', '', '', '', '', ''],
        price: '',
        currency: 'ETH',
        github: '',
        model: 'GPT-4o',
        version: '1.0.0',
        contextWindow: '128k',
        architecture: 'Python',
        agentType: 'Code Package',
        aiModel: 'GPT-4o',
        runtime: 'Python 3.11',
        dockerRequired: 'No',
        gpuRequired: 'No',
        externalApis: '',
        dependencies: '',
        deploymentComplexity: 'Easy',
        pricingModel: 'ONE_TIME',
        interval: '30 days',
        deliveryType: 'DOWNLOAD',
        license: 'MIT',
        sourceVisibility: 'Open Source',
        support: 'Email',
        updateFrequency: 'Actively maintained',
        videoLink: '',
        website: '',
        discord: '',
        telegram: '',
        docs: '',
        riskProfit: false,
        riskCreator: false,
        riskBuyer: false
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [mainPreview, setMainPreview] = useState(null);
    const [agentCode, setAgentCode] = useState(null);
    const [gallery, setGallery] = useState([null, null, null]);
    const [galleryPreviews, setGalleryPreviews] = useState([null, null, null]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSection, setExpandedSection] = useState('identity');

    const toggleSection = (section) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const currencies = [
        { code: 'ETH', name: 'Ethereum' },
        { code: 'USDC', name: 'USDC' },
        { code: 'STORY', name: 'Story' }
    ];

    const availableTags = ['NLP', 'Coding', 'On-Chain', 'Vision', 'Trading', 'Oracle', 'Security', 'Creative', 'Multi-Agent', 'Enterprise', 'Automation'];

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleCapabilityChange = (index, value) => {
        const newCaps = [...formData.capabilities];
        newCaps[index] = value;
        setFormData({ ...formData, capabilities: newCaps });
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setMainPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newGallery = [...gallery];
            newGallery[index] = file;
            setGallery(newGallery);

            const newPreviews = [...galleryPreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setGalleryPreviews(newPreviews);
        }
    };

    const handleCodeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAgentCode(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected) return;

        if (!formData.riskProfit || !formData.riskCreator || !formData.riskBuyer) {
            setError('Please confirm all risk disclosures before listing.');
            return;
        }

        setError(null);
        setSubmitting(true);
        const finalData = {
            ...formData,
            tags: selectedTags,
            galleryFiles: gallery,
            capabilities: formData.capabilities.filter(c => c.trim() !== '')
        };
        const result = await addAgent(finalData, mainImage, agentCode);
        setSubmitting(false);

        if (result.success) {
            navigate('/explore');
        } else {
            setError(result.error || 'Deployment failed.');
        }
    };

    if (!isConnected) {
        return (
            <div className="sell-container animate-fade-in" style={{ textAlign: 'center', paddingTop: '200px' }}>
                <div style={{ marginBottom: '40px', opacity: 0.05 }}>
                    <Shield size={120} style={{ margin: '0 auto' }} color="white" />
                </div>
                <h2 style={{ fontSize: '38px', fontWeight: '950', marginBottom: '16px', color: '#fff', letterSpacing: '-0.04em' }}>Connection Protocol Required</h2>
                <button className="deploy-btn" onClick={() => navigate('/identity')}>Initialize Connection</button>
            </div>
        );
    }

    return (
        <div className="sell-container animate-fade-in-up">
            <header className="sell-header">
                <div className="sparkle-badge">
                    <Sparkles size={14} />
                    <span>PROTOCOL_DEPLOYMENT_INTERFACE</span>
                </div>
                <h1>Deploy your agent.</h1>
                <p>Initialize your autonomous agent on the SAW registry. Professional listings capture 4x more attention from verified buyers.</p>
                {bondText && (
                    <div className="bond-warning-box">
                        <Shield size={16} />
                        <span>{bondText}</span>
                        <div className="bond-tooltip-wrapper">
                            <Info size={14} className="info-icon" />
                            <div className="bond-tooltip">
                                A bond is a refundable protocol deposit required to list an agent. It protects the network against spam and malicious listings.
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <form onSubmit={handleSubmit} className="deploy-form">

                {/* SECTION 1: Identity & Classification */}
                <section className={`form-section ${expandedSection === 'identity' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('identity')}>
                        <div className="title-header">
                            <Bot size={22} />
                            <span>Identity</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'identity' && (
                        <div className="section-content">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Agent Name</label>
                                    <input name="name" type="text" placeholder="e.g. Nexus Voyager" className="input-field" required value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select name="role" className="input-field select-field" required value={formData.role} onChange={handleChange}>
                                        <option value="">Select Category</option>
                                        {PROTOCOL_DOMAINS.map(domain => (
                                            <option key={domain} value={domain}>{domain}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group full-width">
                                <label>Short Tagline (1 line)</label>
                                <input name="tagline" type="text" placeholder="e.g. Autonomous crypto funding-rate arbitrage monitor." className="input-field" required value={formData.tagline} onChange={handleChange} />
                            </div>
                            <div className="input-group full-width">
                                <label>Agent Description (Long Form)</label>
                                <textarea name="description" className="input-field text-area" placeholder="Detail the agent's logic, tools, and intended use cases..." required value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="input-group full-width">
                                <label>Who is this for? (Use Case)</label>
                                <input name="useCase" type="text" placeholder="e.g. Institutional delta-neutral traders" className="input-field" value={formData.useCase} onChange={handleChange} />
                            </div>
                            <div className="capabilities-group">
                                <label>Key Capabilities (Bullet list, max 6)</label>
                                <div className="capabilities-grid">
                                    {formData.capabilities.map((cap, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            placeholder={`Capability ${idx + 1}`}
                                            className="input-field cap-input"
                                            value={cap}
                                            onChange={(e) => handleCapabilityChange(idx, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 2: Technical Specifications */}
                <section className={`form-section ${expandedSection === 'architecture' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('architecture')}>
                        <div className="title-header">
                            <Terminal size={22} />
                            <span>Architecture</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'architecture' && (
                        <div className="section-content">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Agent Type</label>
                                    <select name="agentType" className="input-field select-field" value={formData.agentType} onChange={handleChange}>
                                        <option value="Code Package">Code Package</option>
                                        <option value="Hosted API">Hosted API</option>
                                        <option value="MCP Server">MCP Server</option>
                                        <option value="Workflow Template">Workflow Template</option>
                                        <option value="Plugin">Plugin</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>AI Model / Engine</label>
                                    <select name="aiModel" className="input-field select-field" value={formData.aiModel} onChange={handleChange}>
                                        <option value="GPT-4o">GPT-4 / GPT-4o</option>
                                        <option value="Claude 3.5">Claude</option>
                                        <option value="Local LLM">Local LLM</option>
                                        <option value="Custom Model">Custom model</option>
                                        <option value="Multi-model">Multi-model</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Architecture</label>
                                    <select name="architecture" className="input-field select-field" value={formData.architecture} onChange={handleChange}>
                                        <option value="Python">Python</option>
                                        <option value="Node.js">Node.js</option>
                                        <option value="LangChain">LangChain</option>
                                        <option value="CrewAI">CrewAI</option>
                                        <option value="AutoGPT">AutoGen</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Runtime Req.</label>
                                    <input name="runtime" type="text" placeholder="e.g. Python 3.11" className="input-field" value={formData.runtime} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Docker Required?</label>
                                    <select name="dockerRequired" className="input-field select-field" value={formData.dockerRequired} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>GPU Required?</label>
                                    <select name="gpuRequired" className="input-field select-field" value={formData.gpuRequired} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Context Window</label>
                                    <input name="contextWindow" type="text" placeholder="e.g. 128k" className="input-field" value={formData.contextWindow} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Complexity</label>
                                    <select name="deploymentComplexity" className="input-field select-field" value={formData.deploymentComplexity} onChange={handleChange}>
                                        <option value="Easy">Easy</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 3: Monetization */}
                <section className={`form-section ${expandedSection === 'monetization' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('monetization')}>
                        <div className="title-header">
                            <Coins size={22} />
                            <span>Monetization</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'monetization' && (
                        <div className="section-content">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Pricing Model</label>
                                    <select name="pricingModel" className="input-field select-field" value={formData.pricingModel} onChange={handleChange}>
                                        <option value="ONE_TIME">One-time purchase</option>
                                        <option value="RECURRING">Subscription</option>
                                    </select>
                                </div>
                                {formData.pricingModel === 'RECURRING' && (
                                    <div className="input-group">
                                        <label>Interval</label>
                                        <select name="interval" className="input-field select-field" value={formData.interval} onChange={handleChange}>
                                            <option value="30 days">30 days</option>
                                            <option value="90 days">90 days</option>
                                            <option value="custom">custom</option>
                                        </select>
                                    </div>
                                )}
                                <div className="input-group">
                                    <label>Price (ETH)</label>
                                    <div className="input-with-icon">
                                        <DollarSign size={14} color="rgba(255,255,255,0.2)" />
                                        <input name="price" type="number" step="0.001" placeholder="0.26" className="input-field" required value={formData.price} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Delivery Type</label>
                                    <select name="deliveryType" className="input-field select-field" value={formData.deliveryType} onChange={handleChange}>
                                        <option value="DOWNLOAD">Downloadable code</option>
                                        <option value="API">Hosted API</option>
                                        <option value="API">External endpoint</option>
                                        <option value="API">MCP server</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 4: Trust Layer */}
                <section className={`form-section ${expandedSection === 'verification' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('verification')}>
                        <div className="title-header">
                            <Shield size={22} />
                            <span>Verification</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'verification' && (
                        <div className="section-content">
                            <div className="upload-section" style={{ marginBottom: '32px' }}>
                                <div className="input-group">
                                    <label>Artifact Upload (ZIP bundle)</label>
                                    <div className="upload-box-full">
                                        <input type="file" accept=".zip" onChange={handleCodeChange} />
                                        <div className="box-content">
                                            {agentCode ? (
                                                <div className="file-ready"><CheckCircle2 size={24} /> <span>{agentCode.name}</span></div>
                                            ) : (
                                                <div className="file-empty"><Upload size={24} /> <span>Upload ZIP Bundle</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>License Type</label>
                                    <select name="license" className="input-field select-field" value={formData.license} onChange={handleChange}>
                                        <option value="Commercial">Commercial</option>
                                        <option value="MIT">MIT</option>
                                        <option value="Proprietary">Proprietary</option>
                                        <option value="Restricted">Restricted</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Source Visibility</label>
                                    <select name="sourceVisibility" className="input-field select-field" value={formData.sourceVisibility} onChange={handleChange}>
                                        <option value="Open Source">Open Source</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Closed Source">Closed Source</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 5: Support */}
                <section className={`form-section ${expandedSection === 'support' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('support')}>
                        <div className="title-header">
                            <MessageCircle size={22} />
                            <span>Support</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'support' && (
                        <div className="section-content">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Support Channel</label>
                                    <input name="support" type="text" placeholder="e.g. Discord, Email" className="input-field" value={formData.support} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Update Frequency</label>
                                    <select name="updateFrequency" className="input-field select-field" value={formData.updateFrequency} onChange={handleChange}>
                                        <option value="Actively maintained">Actively maintained</option>
                                        <option value="Maintenance only">Maintenance only</option>
                                        <option value="Frozen">Frozen</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION: Visuals */}
                <section className={`form-section ${expandedSection === 'visuals' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('visuals')}>
                        <div className="title-header">
                            <ImageIcon size={22} />
                            <span>Visual Identity</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'visuals' && (
                        <div className="section-content">
                            <div className="upload-row">
                                <div className="avatar-input">
                                    <label>Primary Avatar (Required)</label>
                                    <div className="upload-box avatar-box">
                                        <input type="file" onChange={handleMainImageChange} />
                                        {mainPreview ? <img src={mainPreview} alt="p" /> : <Upload size={24} />}
                                    </div>
                                </div>
                                <div className="gallery-input input-group">
                                    <label>Gallery (Screenshots / Diagrams)</label>
                                    <div className="upload-grid-small">
                                        {gallery.map((_, i) => (
                                            <div key={i} className="upload-box gal-box">
                                                <input type="file" onChange={(e) => handleGalleryChange(i, e)} />
                                                {galleryPreviews[i] ? <img src={galleryPreviews[i]} alt="g" /> : <ImageIcon size={20} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 6: Risk Disclosure */}
                <section className={`form-section risk-section ${expandedSection === 'risk' ? 'expanded' : ''}`}>
                    <div className="form-section-title" onClick={() => toggleSection('risk')}>
                        <div className="title-header">
                            <AlertTriangle size={22} />
                            <span>Risk Disclosure</span>
                        </div>
                        <ChevronDown size={20} className="toggle-icon" />
                    </div>
                    {expandedSection === 'risk' && (
                        <div className="section-content">
                            <div className="disclosure-list">
                                <label className="checkbox-item">
                                    <input type="checkbox" name="riskProfit" checked={formData.riskProfit} onChange={handleChange} />
                                    <span>This agent does not guarantee profits.</span>
                                </label>
                                <label className="checkbox-item">
                                    <input type="checkbox" name="riskCreator" checked={formData.riskCreator} onChange={handleChange} />
                                    <span>Creator is responsible for functionality claims.</span>
                                </label>
                                <label className="checkbox-item">
                                    <input type="checkbox" name="riskBuyer" checked={formData.riskBuyer} onChange={handleChange} />
                                    <span>Buyer should review code before deployment.</span>
                                </label>
                            </div>
                        </div>
                    )}
                </section>

                <div className="submit-container">
                    <button type="submit" className="main-submit" disabled={submitting}>
                        {submitting ? 'Deploying...' : 'List agent'}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </div>
            </form>
        </div>
    );
};

export default SellAgent;
