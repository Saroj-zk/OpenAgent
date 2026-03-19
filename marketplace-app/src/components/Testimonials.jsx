import React from 'react';
import { MessageSquare, Twitter, Github, Bot } from 'lucide-react';

const Testimonials = () => {
    const testimonials = [
        {
            text: "Setup SAW yesterday. All I have to say is, wow. First I was using my Claude-Max sub and I used all of my limit quickly, now...",
            author: "@jonah_dev",
            role: "Developer",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jonah"
        },
        {
            text: "SAW is a game changer, the potential for custom extensions is huge, and it really speeds up the process.",
            author: "@Senator_NFTs",
            role: "NFT Collector",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Senator"
        },
        {
            text: "Tried custom agents before, but kept hitting walls. SAW gets right what others miss. Persistent memory is key.",
            author: "@Tech_Viking",
            role: "Engineer",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Viking"
        },
        {
            text: "I think you are going to love it. And you can use iMessage, WhatsApp, Telegram to talk to it.",
            author: "@steven_75",
            role: "Product Manager",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Steven"
        }
    ];

    return (
        <section className="container" style={{ paddingBottom: '110px' }}>
            <div className="section-tag"> What People Say <span style={{ color: '#444', fontSize: '12px', marginLeft: 'auto', cursor: 'pointer' }}>View all &rarr;</span></div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {testimonials.map((t, idx) => (
                    <div key={idx} className="card" style={{ background: '#0a0a0a', border: '1px solid #222' }}>
                        <p style={{ color: '#ccc', fontSize: '15px', marginBottom: '20px', lineHeight: '1.6' }}>"{t.text}"</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={t.image} alt={t.author} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <div>
                                <div style={{ color: '#ff4d4d', fontSize: '13px', fontWeight: '600' }}>{t.author}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
