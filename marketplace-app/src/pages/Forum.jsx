import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { Heart, MessageCircle, Send, TrendingUp, Bookmark, User, ShieldCheck, Activity, Cpu, Reply, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Forum.css';

const Forum = () => {
    const { isConnected, username, account, marketplaceAgents, trustScore } = useWallet();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // UI State
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentContent, setCommentContent] = useState('');

    // Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const chatContainerRef = useRef(null);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/forum');
            if (res.ok) setPosts(await res.json());
        } catch (error) {
            console.error("Failed to load feed:", error);
        }
    };

    useEffect(() => {
        fetchPosts();

        // Simulate chat
        setChatMessages([
            { id: 1, author: 'System', text: 'Welcome to the global developer chat room.', color: '#1d9bf0' }
        ]);

        const interval = setInterval(() => {
            setChatMessages(prev => {
                const bots = ['0xFlash', 'NeuralKnight', 'DeFi_Degen', 'CodeAuditor'];
                const colors = ['#ff4d4d', '#ff9900', '#00e676', '#1d9bf0'];
                const events = [
                    'has anyone checked the new Aerodrome router?',
                    'just deployed my new MEV bot',
                    'gas is so low today',
                    'anyone auditing the YieldOptimizer contract?'
                ];

                if (Math.random() < 0.6) return prev; // 40% chance to generate message

                const randomBot = Math.floor(Math.random() * bots.length);
                const isReply = Math.random() > 0.7 && prev.length > 2; // Sometimes bots reply

                const latestMsgs = prev.slice(-49);
                let replyData = null;

                if (isReply) {
                    // Pick a random recent message to reply to
                    const userMsgs = latestMsgs.filter(m => m.author !== 'System');
                    if (userMsgs.length > 0) {
                        const target = userMsgs[Math.floor(Math.random() * userMsgs.length)];
                        replyData = { author: target.author, text: target.text };
                    }
                }

                return [...latestMsgs, {
                    id: Date.now(),
                    author: bots[randomBot],
                    color: colors[randomBot],
                    text: events[Math.floor(Math.random() * events.length)],
                    replyTo: replyData
                }];
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected) return;
        if (!newPostContent.trim() && !selectedAgentId) return;

        setIsPosting(true);
        try {
            const res = await fetch('http://localhost:3001/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: username || 'Anon',
                    content: newPostContent,
                    agentId: selectedAgentId
                })
            });

            if (res.ok) {
                setNewPostContent('');
                setSelectedAgentId('');
                fetchPosts();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to post.');
            }
        } catch (error) {
            console.error("Posting failed:", error);
            alert("An error occurred while posting.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!isConnected || !commentContent.trim()) return;

        try {
            const res = await fetch(`http://localhost:3001/api/forum/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: username || 'Anon',
                    content: commentContent
                })
            });

            if (res.ok) {
                setCommentContent('');
                fetchPosts();
            }
        } catch (error) {
            console.error("Comment failed:", error);
        }
    };

    const toggleLike = async (postId) => {
        if (!isConnected) return;
        try {
            const res = await fetch(`http://localhost:3001/api/forum/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: username })
            });

            if (res.ok) fetchPosts();
        } catch (error) {
            console.error("Like failed:", error);
        }
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!isConnected || !chatInput.trim()) return;

        setChatMessages(prev => [...prev.slice(-49), {
            id: Date.now(),
            author: username || 'Anon',
            color: '#fff',
            text: chatInput,
            replyTo: replyingTo
        }]);
        setChatInput('');
        setReplyingTo(null); // Clear reply state after sending
    };

    const handleReplyClick = (msg) => {
        setReplyingTo({
            author: msg.author,
            text: msg.text
        });
    };

    // Derived states
    const unreadMentions = isConnected ? chatMessages.filter(msg => msg.replyTo?.author === username).length : 0;

    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <div className="gram-wrapper">
            <div className="gram-container">

                {/* LEFT SIDEBAR: PROFILE & NAVIGATION */}
                <aside className="gram-sidebar left">
                    <div className="gram-profile-card">
                        <div className="gram-avatar large">
                            {isConnected && username ? username.charAt(0).toUpperCase() : '?'}
                        </div>
                        <h2 className="gram-username">{isConnected ? username : 'Guest'}</h2>
                        {isConnected && (
                            <div className="gram-trust-badge" title="Trust is calculated using stake, verified contributions, marketplace performance, and consistency. Higher tiers take longer to climb.">
                                <ShieldCheck size={16} color="#1d9bf0" />
                                <span>Trust Score: {trustScore}</span>
                            </div>
                        )}
                        <p className="gram-bio">
                            {isConnected ? 'Building the future of autonomous intelligence.' : 'Connect wallet to access builder features.'}
                        </p>
                    </div>

                    <nav className="gram-nav">
                        <Link to="/explore" className="gram-nav-item">
                            <TrendingUp size={22} />
                            <span>Trending Agents</span>
                        </Link>
                        <button className="gram-nav-item">
                            <Bookmark size={22} />
                            <span>Bookmarks</span>
                        </button>
                        {isConnected && (
                            <Link to="/dashboard" className="gram-nav-item">
                                <User size={22} />
                                <span>My Profile</span>
                            </Link>
                        )}
                    </nav>
                </aside>

                {/* CENTER: FEED */}
                <main className="gram-feed">
                    <div className="gram-feed-header">
                        <h2>Developer Feed</h2>
                    </div>

                    {/* COMPOSER */}
                    {isConnected && (
                        <div className="gram-composer">
                            <form onSubmit={handlePostSubmit}>
                                <div className="composer-top">
                                    <div className="gram-avatar small">{username?.charAt(0).toUpperCase()}</div>
                                    <textarea
                                        className="gram-textarea"
                                        placeholder="Deploying a new agent? Share it here..."
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                    />
                                </div>
                                <div className="composer-bottom">
                                    <div className="composer-attach">
                                        <Cpu size={18} color="#888" />
                                        <select
                                            value={selectedAgentId}
                                            onChange={(e) => setSelectedAgentId(e.target.value)}
                                            className="gram-select"
                                        >
                                            <option value="">Attach Agent Data...</option>
                                            {marketplaceAgents.filter(a => {
                                                const cleanUser = username?.replace('@', '').toLowerCase();
                                                const cleanOwner = a.owner?.replace('@', '').toLowerCase();
                                                const cleanCreator = a.creator?.replace('@', '').toLowerCase();
                                                const cleanAcc = account?.toLowerCase();

                                                return (cleanUser && (cleanOwner === cleanUser || cleanCreator === cleanUser)) ||
                                                    (cleanAcc && (a.owner?.toLowerCase() === cleanAcc || a.creator?.toLowerCase() === cleanAcc));
                                            }).map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="gram-post-btn"
                                        disabled={isPosting || (!newPostContent.trim() && !selectedAgentId)}
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* POSTS */}
                    <div className="gram-posts-list">
                        {posts.map(post => {
                            const linkedAgent = marketplaceAgents.find(a => a.id.toString() === post.agentId);
                            const isLiked = post.likedBy?.includes(username);

                            return (
                                <article key={post.id} className="gram-post">
                                    {/* Post Header */}
                                    <div className="post-header">
                                        <div className="post-author-info">
                                            <div className="gram-avatar small">{post.author ? post.author.charAt(0).toUpperCase() : '?'}</div>
                                            <div className="author-details">
                                                <span className="author-name">{post.author || 'Anon'}</span>
                                                <span className="author-trust"><ShieldCheck size={12} fill="#1d9bf0" color="#000" /> Trust: {post.authorTrust || 10}</span>
                                            </div>
                                        </div>
                                        <div className="post-time">{timeAgo(post.timestamp)}</div>
                                    </div>

                                    {/* Post Content / Agent Image Placeholder (Instagram Style) */}
                                    <div className="post-content-area">
                                        <p className="post-text">{post.content}</p>

                                        {linkedAgent && (
                                            <div className="post-agent-showcase">
                                                <div className="agent-image-placeholder">
                                                    <Cpu size={48} color="rgba(255,255,255,0.2)" />
                                                    <span>{linkedAgent.name}</span>
                                                </div>
                                                <div className="agent-showcase-bar">
                                                    <span>{linkedAgent.role}</span>
                                                    <span>{linkedAgent.price} {linkedAgent.currency || 'ETH'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="post-actions-bar">
                                        <button
                                            className={`gram-action-btn ${isLiked ? 'liked' : ''}`}
                                            onClick={() => toggleLike(post.id)}
                                        >
                                            <Heart size={24} fill={isLiked ? "#ff3040" : "none"} color={isLiked ? "#ff3040" : "#fff"} />
                                        </button>
                                        <button
                                            className="gram-action-btn"
                                            onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                        >
                                            <MessageCircle size={24} />
                                        </button>
                                        <button className="gram-action-btn">
                                            <Send size={24} />
                                        </button>
                                    </div>
                                    <div className="post-likes-count">
                                        {post.likes || 0} likes
                                    </div>

                                    {/* Comments Section */}
                                    <div className="post-comments-summary">
                                        {post.comments?.length > 0 && (
                                            <button
                                                className="view-all-comments"
                                                onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                            >
                                                View all {post.comments.length} comments
                                            </button>
                                        )}

                                        {/* Show expanded comments */}
                                        {activeCommentPost === post.id && (
                                            <div className="expanded-comments">
                                                {post.comments.map(c => (
                                                    <div key={c.id} className="comment-line">
                                                        <div className="comment-avatar">
                                                            {c.author ? c.author.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div className="comment-content">
                                                            <div className="comment-header">
                                                                <span className="comment-author">{c.author}</span>
                                                                <span className="comment-trust" title="Trust Score">
                                                                    <ShieldCheck size={12} color="#1d9bf0" /> {c.authorTrust || 10}
                                                                </span>
                                                            </div>
                                                            <span className="comment-text">{c.content}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Comment Input */}
                                    {isConnected && (
                                        <div className="post-add-comment">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={activeCommentPost === post.id ? commentContent : ''}
                                                onChange={(e) => {
                                                    setActiveCommentPost(post.id);
                                                    setCommentContent(e.target.value);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCommentSubmit(post.id);
                                                }}
                                            />
                                            {activeCommentPost === post.id && commentContent.trim() && (
                                                <button className="post-comment-btn" onClick={() => handleCommentSubmit(post.id)}>
                                                    Post
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: LIVE CHATS */}
                <aside className="gram-sidebar right chat-sidebar">
                    <div className="chat-header">
                        <div className="chat-header-title">
                            <Activity size={18} color="#1d9bf0" />
                            <h2>Live Network Chat</h2>
                        </div>
                        {unreadMentions > 0 && (
                            <div className="chat-mention-badge">
                                <Bell size={14} />
                                <span>{unreadMentions}</span>
                            </div>
                        )}
                    </div>

                    <div className="chat-messages-container" ref={chatContainerRef}>
                        {chatMessages.map(msg => {
                            const isTargetUser = isConnected && msg.replyTo?.author === username;

                            return (
                                <div key={msg.id} className={`chat-message ${isTargetUser ? 'is-mention' : ''}`}>
                                    {msg.author === 'System' ? (
                                        <div className="sys-message">{msg.text}</div>
                                    ) : (
                                        <div className="user-message">
                                            {msg.replyTo && (
                                                <div className="chat-reply-indicator">
                                                    <Reply size={12} />
                                                    <span>Replying to {msg.replyTo.author}</span>
                                                </div>
                                            )}
                                            <div className="user-message-core">
                                                <span className="chat-author" style={{ color: msg.color }}>{msg.author}:</span>
                                                <span className="chat-text">{msg.text}</span>
                                            </div>
                                            {isConnected && msg.author !== username && (
                                                <button
                                                    className="chat-reply-action-btn"
                                                    onClick={() => handleReplyClick(msg)}
                                                    title="Reply"
                                                >
                                                    <Reply size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="chat-input-wrapper">
                        {replyingTo && (
                            <div className="chat-replying-to-banner">
                                <div className="replying-to-info">
                                    <span className="replying-to-label">Replying to {replyingTo.author}</span>
                                    <span className="replying-to-text">{replyingTo.text}</span>
                                </div>
                                <button className="cancel-reply-btn" onClick={() => setReplyingTo(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleChatSubmit} className="chat-input-form">
                            <input
                                type="text"
                                placeholder={isConnected ? "Message..." : "Connect to chat"}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={!isConnected}
                            />
                            <button type="submit" disabled={!isConnected || !chatInput.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default Forum;
