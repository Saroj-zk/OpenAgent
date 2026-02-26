import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    Upload, DollarSign, Bot, FileText, CheckCircle,
    AlertCircle, Sparkles, Terminal, Github, Cpu,
    Link as LinkIcon, Info, Coins, Image as ImageIcon,
    Globe, MessageCircle, FileCode, Layers, Zap, User,
    Shield, Code, Brackets, Key, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SellAgent.css';

const SellAgent = () => {
    const { isConnected, addAgent, account, username } = useWallet();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        price: '',
        currency: 'ETH',
        description: '',
        github: '',
        model: 'GPT-4o',
        version: '1.0.0',
        contextWindow: '128k',
        architecture: 'Transformer',
        framework: 'LangChain',
        apiDependencies: 'OpenAI',
        inferenceService: 'Direct',
        license: 'MIT',
        videoLink: '',
        website: '',
        discord: '',
        telegram: '',
        docs: ''
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [mainPreview, setMainPreview] = useState(null);
    const [gallery, setGallery] = useState([null, null, null]);
    const [galleryPreviews, setGalleryPreviews] = useState([null, null, null]);
    const [agentCode, setAgentCode] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const currencies = [
        { code: 'ETH', name: 'Ethereum' },
        { code: 'SOL', name: 'Solana' },
        { code: 'USDC', name: 'USDC' },
        { code: 'STORY', name: 'Story' }
    ];

    const availableTags = ['NLP', 'Coding', 'Social', 'Vision', 'Trading', 'Research', 'Security', 'Creative'];

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

        setSubmitting(true);
        // Combine tags into description or handle as separate field if backend supports
        const finalData = { ...formData, tags: selectedTags };
        const success = await addAgent(finalData, mainImage, agentCode);
        setSubmitting(false);

        if (success) {
            navigate('/explore');
        } else {
            alert('Deployment failed. Ensure your wallet is connected and try again.');
        }
    };

    if (!isConnected) {
        return (
            <div className="sell-container animate-fade-in" style={{ textAlign: 'center', paddingTop: '200px' }}>
                <div style={{ marginBottom: '40px', opacity: 0.1 }}>
                    <Shield size={100} style={{ margin: '0 auto' }} color="white" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>Connection Required</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>Join the collective to deploy your autonomous legacy and start earning from your creations.</p>
                <button className="deploy-btn" style={{ width: '220px' }} onClick={() => navigate('/identity')}>Connect Identity</button>
            </div>
        );
    }

    return (
        <div className="sell-container animate-fade-in-up">
            <header className="sell-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    <Sparkles size={14} />
                    <span>Agent Listing Infrastructure</span>
                </div>
                <h1>Deploy your agent.</h1>
                <p>Register your autonomous agent on the OpenAgent registry. Provide technical specs to help builders discover your work.</p>
            </header>

            <form onSubmit={handleSubmit} className="deploy-form">

                {/* SECTION 1: Identity */}
                <section>
                    <div className="form-section-title">
                        <User size={14} />
                        <span>Core Identity</span>
                    </div>
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Agent Name</label>
                            <input name="name" type="text" placeholder="e.g. Nexus Voyager" className="input-field" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Functional Role (Category)</label>
                            <input name="role" type="text" placeholder="e.g. Quantitative Analyst" className="input-field" required value={formData.role} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '32px' }}>
                        <label>Capabilities & Tags</label>
                        <div className="tag-cloud">
                            {availableTags.map(tag => (
                                <div
                                    key={tag}
                                    className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Technical Specs (The Developer Part) */}
                <section>
                    <div className="form-section-title">
                        <Brackets size={14} />
                        <span>Technical Infrastructure</span>
                    </div>
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Base Model</label>
                            <select name="model" className="input-field select-field" value={formData.model} onChange={handleChange}>
                                <option value="GPT-4o">GPT-4o (OpenAI)</option>
                                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                                <option value="Llama 3.1 (405B)">Llama 3.1 (405B)</option>
                                <option value="DeepSeek-V3">DeepSeek-V3</option>
                                <option value="Custom/Self-Hosted">Custom/Self-Hosted</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Agent Framework</label>
                            <select name="framework" className="input-field select-field" value={formData.framework} onChange={handleChange}>
                                <option value="LangChain">LangChain</option>
                                <option value="CrewAI">CrewAI</option>
                                <option value="AutoGPT">AutoGPT</option>
                                <option value="PydanticAI">PydanticAI</option>
                                <option value="Custom">Custom Architecture</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Primary API Provider</label>
                            <select name="apiDependencies" className="input-field select-field" value={formData.apiDependencies} onChange={handleChange}>
                                <option value="OpenAI">OpenAI Official</option>
                                <option value="Anthropic">Anthropic Official</option>
                                <option value="Google Vertex">Google Vertex/AI Studio</option>
                                <option value="Ollama">Ollama (Local Inference)</option>
                                <option value="Groq">Groq (LPU Inference)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>License Type</label>
                            <select name="license" className="input-field select-field" value={formData.license} onChange={handleChange}>
                                <option value="MIT">MIT License</option>
                                <option value="Apache 2.0">Apache 2.0</option>
                                <option value="GPLv3">GPLv3</option>
                                <option value="Proprietary">Proprietary / Closed Source</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: Performance Details */}
                <section>
                    <div className="form-section-title">
                        <Activity size={14} />
                        <span>Runtime Specifications</span>
                    </div>
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Context Window (Max Tokens)</label>
                            <input name="contextWindow" type="text" placeholder="e.g. 128k" className="input-field" value={formData.contextWindow} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Version Hash / Tag</label>
                            <input name="version" type="text" placeholder="e.g. v1.2.4-stable" className="input-field" value={formData.version} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                {/* SECTION 4: Pricing */}
                <section>
                    <div className="form-section-title">
                        <Coins size={14} />
                        <span>Economic Configuration</span>
                    </div>
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Listing Price</label>
                            <div className="input-with-icon">
                                <DollarSign size={14} color="rgba(255,255,255,0.2)" />
                                <input name="price" type="number" step="0.001" placeholder="1.25" className="input-field" required value={formData.price} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Trading Currency</label>
                            <select name="currency" className="input-field select-field" value={formData.currency} onChange={handleChange}>
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: Description */}
                <section>
                    <div className="form-section-title">
                        <FileText size={14} />
                        <span>Manifesto & Logic</span>
                    </div>
                    <div className="input-group">
                        <label>Agent Briefing (Description)</label>
                        <textarea name="description" className="input-field text-area" placeholder="Detail the agent's logic, tools, and intended use cases..." required value={formData.description} onChange={handleChange}></textarea>
                    </div>
                </section>

                {/* SECTION: Source Code */}
                <section>
                    <div className="form-section-title">
                        <Code size={14} />
                        <span>Source Code (Product)</span>
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', display: 'block' }}>AGENT CODE (ZIP, TAR)</label>
                        <div className="upload-box" style={{ width: '100%', padding: '32px', textAlign: 'center' }}>
                            <input type="file" accept=".zip,.rar,.tar,.tar.gz" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} onChange={handleCodeChange} />
                            {agentCode ? (
                                <div style={{ color: '#4dff88', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <CheckCircle size={24} />
                                    <span>{agentCode.name}</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)' }}>
                                    <Upload size={24} />
                                    <span>Upload .zip or .tar</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION 6: Visual Identity */}
                <section>
                    <div className="form-section-title">
                        <ImageIcon size={14} />
                        <span>Visual Identity & Showcase</span>
                    </div>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', display: 'block' }}>PRIMARY AVATAR (REQUIRED)</label>
                        <div className="upload-box" style={{ width: '180px', aspectRatio: '1/1' }}>
                            <input type="file" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} onChange={handleMainImageChange} />
                            {mainPreview ? <img src={mainPreview} alt="main" /> : <Upload size={24} />}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', display: 'block' }}>GALLERY (SCREENSHOTS / ARCHITECTURE DIAGRAMS)</label>
                        <div className="upload-grid">
                            {gallery.map((_, i) => (
                                <div key={i} className="upload-box">
                                    <input type="file" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} onChange={(e) => handleGalleryChange(i, e)} />
                                    {galleryPreviews[i] ? <img src={galleryPreviews[i]} alt={`gal-${i}`} /> : <ImageIcon size={20} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 7: Connectivity */}
                <section>
                    <div className="form-section-title">
                        <LinkIcon size={14} />
                        <span>External Connectivity</span>
                    </div>
                    <div className="input-grid">
                        <div className="input-group">
                            <label>GitHub Source</label>
                            <div className="input-with-icon">
                                <Github size={14} color="rgba(255,255,255,0.2)" />
                                <input name="github" type="url" placeholder="repo url" className="input-field" value={formData.github} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Documentation Link</label>
                            <div className="input-with-icon">
                                <FileCode size={14} color="rgba(255,255,255,0.2)" />
                                <input name="docs" type="url" placeholder="GitBook / Docusaurus URL" className="input-field" value={formData.docs} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Agent Demo URL (Optional)</label>
                            <div className="input-with-icon">
                                <Globe size={14} color="rgba(255,255,255,0.2)" />
                                <input name="website" type="url" placeholder="https://..." className="input-field" value={formData.website} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Support / Discord</label>
                            <div className="input-with-icon">
                                <MessageCircle size={14} color="rgba(255,255,255,0.2)" />
                                <input name="discord" type="text" placeholder="Discord Invite" className="input-field" value={formData.discord} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </section>

                <button type="submit" className="deploy-btn" disabled={submitting}>
                    {submitting ? 'DEPLOYING TO REGISTRY...' : 'DEPLOY AGENT'}
                </button>

            </form>
        </div>
    );
};

export default SellAgent;
