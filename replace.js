const fs = require('fs');
const files = [
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\portal\\PortalLogin.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\pages\\AdminDisputes.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\portal\\PortalDashboard.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\pages\\AdminDashboard.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\context\\WalletContext.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\marketplace-app\\src\\config.js',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\admin-portal\\src\\portal\\PortalLogin.jsx',
    'c:\\Users\\Admin\\Downloads\\Code Works\\AI agent marketplace\\admin-portal\\src\\portal\\PortalDashboard.jsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(
        "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';",
        "const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';"
    );
    content = content.replace(
        "export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';",
        "export const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';"
    );
    fs.writeFileSync(f, content);
});
console.log("Done");
