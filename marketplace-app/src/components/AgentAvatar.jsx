import React, { useState } from 'react';

// Generates a deterministic color based on the string
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const AgentAvatar = ({ image, name, size = '48px', style = {} }) => {
    const [error, setError] = useState(false);

    // Deterministic gradient if image fails
    const color1 = stringToColor(name || 'Agent');
    const color2 = stringToColor((name || 'Agent') + 'salt');

    const fallbackStyle = {
        width: size,
        height: size,
        borderRadius: '8px',
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size.endsWith('px') ? parseInt(size) / 2.5 + 'px' : '1.5rem',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        ...style
    };

    if (!image || error) {
        return (
            <div style={fallbackStyle}>
                {name?.slice(0, 2) || 'AI'}
            </div>
        );
    }

    return (
        <img
            src={image}
            alt={name}
            onError={() => setError(true)}
            style={{
                width: size,
                height: size,
                borderRadius: '8px',
                objectFit: 'cover',
                ...style
            }}
        />
    );
};

export default AgentAvatar;
