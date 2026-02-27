import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { REGISTRY_ABI, CONTRACT_ADDRESS } from '../contracts';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const WalletProvider = ({ children }) => {
    // --- State Management ---
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const [trustScore, setTrustScore] = useState(10);

    // Marketplace Data
    const [marketplaceAgents, setMarketplaceAgents] = useState([]);
    const [purchasedAgents, setPurchasedAgents] = useState([]);
    const [rawPurchases, setRawPurchases] = useState([]);
    const [rawSales, setRawSales] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    const loadMarketplaceData = useCallback(async () => {
        try {
            const [agentsRes, auctionsRes] = await Promise.all([
                fetch(`${API_URL}/api/agents`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/auctions`).catch(() => ({ ok: false }))
            ]);

            if (agentsRes.ok) setMarketplaceAgents(await agentsRes.json());
            if (auctionsRes.ok) setAuctions(await auctionsRes.json());
        } catch (error) {
            console.error("Failed to fetch marketplace data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMarketplaceData();
    }, [loadMarketplaceData]);

    // Web 2.5 Hybrid Match: Find which of the active agents this user has bought access to
    useEffect(() => {
        if (account && marketplaceAgents.length > 0) {
            fetch(`${API_URL}/api/purchases/${account}`)
                .then(res => res.json())
                .then(data => {
                    setRawPurchases(data);
                    const purchasedIds = data.map(d => d.agentId.toString());
                    const bought = marketplaceAgents.filter(a => purchasedIds.includes(a.id.toString()));
                    setPurchasedAgents(bought);
                })
                .catch(e => console.error("Failed to fetch cross-chain purchases", e));

            fetch(`${API_URL}/api/purchases/sales/${account}`)
                .then(res => res.json())
                .then(data => {
                    setRawSales(data);
                })
                .catch(e => console.error("Failed to fetch cross-chain sales", e));
        } else {
            setPurchasedAgents([]);
            setRawPurchases([]);
            setRawSales([]);
        }
    }, [account, marketplaceAgents]);

    // Helper: Sync Identity from Blockchain or Backend (Hybrid)
    const syncIdentity = async (address) => {
        try {
            const provider = new BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, provider);

            const identity = await contract.identities(address);
            if (identity && identity.exists) {
                setUsername(identity.username);
            } else {
                await fetchBackendIdentity(address);
            }
        } catch (error) {
            console.error("Failed to sync identity from chain, checking backend...");
            await fetchBackendIdentity(address);
        }
    };

    const fetchBackendIdentity = async (address) => {
        try {
            const res = await fetch(`${API_URL}/api/users/${address}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.username) {
                    setUsername(data.username);
                    if (data.visible_trust !== undefined) setTrustScore(data.visible_trust);
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        }
        setUsername(null);
    };

    // --- Blockchain Interactions (Web3) ---

    // 1. Connect Wallet
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask to interact with this marketplace.");
            return false;
        }

        try {
            setLoading(true);
            const provider = new BrowserProvider(window.ethereum);

            // Ensure we are on Base Sepolia
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x14a34') {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x14a34' }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x14a34',
                                chainName: 'Base Sepolia',
                                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                                rpcUrls: ['https://sepolia.base.org'],
                                blockExplorerUrls: ['https://sepolia.basescan.org'],
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length > 0) {
                const address = accounts[0].toLowerCase();

                // --- SiWE Authentication Flow ---
                try {
                    const nonceRes = await fetch(`${API_URL}/api/auth/nonce?address=${address}`);
                    const { nonce } = await nonceRes.json();

                    const signer = await provider.getSigner();
                    const message = `Sign this message to prove you own this wallet and to log in to OpenAgent.\n\nNonce: ${nonce}`;
                    const signature = await signer.signMessage(message);

                    const verifyRes = await fetch(`${API_URL}/api/auth/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address, signature })
                    });

                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok || !verifyData.success) {
                        throw new Error(verifyData.error || 'Verification failed');
                    }

                    localStorage.setItem('jwtToken', verifyData.token);
                } catch (authError) {
                    console.error("Authentication failed:", authError);
                    alert("Authentication failed. Please try again.");
                    setLoading(false);
                    return false;
                }

                setAccount(address);
                setIsConnected(true);
                setUser({ address, authType: 'web3' });

                await syncIdentity(address);

                localStorage.removeItem('userDisconnected');

                return true;
            }
            return false;
        } catch (error) {
            console.error("Connection failed:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = connectWallet; // Re-map so external components don't break

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        setUsername(null);
        setUser(null);
        localStorage.removeItem('jwtToken');
        localStorage.setItem('userDisconnected', 'true');
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    const address = accounts[0].toLowerCase();
                    setAccount(address);
                    syncIdentity(address);
                } else {
                    disconnectWallet();
                }
            });
            window.ethereum.on('chainChanged', () => window.location.reload());

            const switchNetwork = async () => {
                if (!window.ethereum) return;
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x14a34' }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0x14a34',
                                    chainName: 'Base Sepolia',
                                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                                    rpcUrls: ['https://sepolia.base.org'],
                                    blockExplorerUrls: ['https://sepolia.basescan.org'],
                                }],
                            });
                        } catch (addError) {
                            console.error("Error adding network:", addError);
                        }
                    }
                }
            };

            const checkNetwork = async () => {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== '0x14a34') {
                    console.warn(`Connected to unsupported chain: ${chainId}. Switching to Base Sepolia.`);
                    await switchNetwork();
                }
            };
            checkNetwork();

            // Auto connect if previously approved and not manually disconnected
            const userDisconnected = localStorage.getItem('userDisconnected') === 'true';
            if (!userDisconnected) {
                window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });
            }
        }
    }, []);

    // 2. Identity Claiming
    const saveUsername = async (newName) => {
        if (!isConnected || !account) return { success: false, error: 'Wallet not connected' };
        if (!window.ethereum) return { success: false, error: 'Web3 provider missing' };

        try {
            const provider = new BrowserProvider(window.ethereum);

            // Hard check network before signing
            const { chainId } = await provider.getNetwork();
            if (chainId !== 84532n && chainId !== 84532) { // 0x14a34
                await switchNetwork();
                return { success: false, error: 'Switched network to Base Sepolia. Please try again.' };
            }

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            const tx = await contract.claimIdentity(newName);
            await tx.wait(); // Wait for confirmation on chain

            setUsername(newName);

            await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ address: account, username: newName })
            }).catch(() => { });

            return { success: true };
        } catch (error) {
            console.error("Identity Error:", error);
            const msg = error.reason || error.shortMessage || error.message || 'Identity claim failed';
            return { success: false, error: msg };
        }
    };

    // 3. Sell Agent
    const addAgent = async (agentData, imageFile, codeFile) => {
        if (!isConnected) return false;

        try {
            const provider = new BrowserProvider(window.ethereum);

            // Hard check network 
            const { chainId } = await provider.getNetwork();
            if (chainId !== 84532n && chainId !== 84532) {
                await switchNetwork();
                return false;
            }

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            const priceWei = parseEther(agentData.price.toString());

            const tx = await contract.listAgent(priceWei);
            const receipt = await tx.wait();

            // Find AgentListed event
            const event = receipt.logs
                .map(log => {
                    try { return contract.interface.parseLog(log); } catch (e) { return null; }
                })
                .find(parsed => parsed && parsed.name === 'AgentListed');

            const onChainId = event?.args?.id?.toString() || Date.now().toString();

            const formData = new FormData();
            formData.append('id', onChainId);
            formData.append('name', agentData.name);
            formData.append('role', agentData.role);
            formData.append('price', agentData.price);
            formData.append('currency', agentData.currency || 'ETH');
            formData.append('description', agentData.description);
            formData.append('github', agentData.github || '');
            formData.append('model', agentData.model || '');
            formData.append('owner', username || account);

            if (imageFile) formData.append('image', imageFile);
            if (codeFile) formData.append('agentCode', codeFile);

            const extras = ['version', 'contextWindow', 'architecture', 'framework', 'apiDependencies', 'inferenceService', 'license', 'videoLink', 'website', 'discord', 'telegram', 'docs'];
            extras.forEach(ext => formData.append(ext, agentData[ext] || ''));
            formData.append('tags', JSON.stringify(agentData.tags || []));
            formData.append('txHash', tx.hash);

            const response = await fetch(`${API_URL}/api/agents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: formData
            });

            if (response.ok) {
                const newAgent = await response.json();
                setMarketplaceAgents(prev => [newAgent, ...prev]);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to deploy agent:", error);
            alert(`Deployment Error: ${error.reason || error.shortMessage || error.message}`);
            return false;
        }
    };

    // 4. Buy Agent 
    const buyAgent = async (agent) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            const priceWei = parseEther(agent.price.toString());

            const tx = await contract.buyAgent(agent.id, { value: priceWei });
            await tx.wait();

            // Web 2.5: The agent is a software license, so we DON'T delete it from the marketplace!
            await fetch(`${API_URL}/api/purchases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ agentId: agent.id, buyer: account, txHash: tx.hash })
            }).catch(() => { });

            setPurchasedAgents(prev => [...prev, agent]);
            return { success: true };

        } catch (error) {
            console.error("Purchase Error:", error);
            let msg = error.reason || error.shortMessage || error.message || 'On-chain purchase failed';

            // Handle common obscure RPC errors for mocked data
            if (msg.toLowerCase().includes('missing revert data') || msg.toLowerCase().includes('execution reverted')) {
                msg = 'Transaction reverted. This agent was seeded in the database but may not exist on the testnet smart contract. Try deploying a new agent first!';
            }

            return { success: false, error: msg };
        }
    };

    // 5. Auctions 
    const placeBid = async (auctionId, amount) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            const amountWei = parseEther(amount.toString());

            const tx = await contract.placeBid(auctionId, { value: amountWei });
            await tx.wait();

            await fetch(`${API_URL}/api/auctions/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({
                    auctionId,
                    bidder: account,
                    amount
                })
            });

            loadMarketplaceData();
            return { success: true };
        } catch (error) {
            console.error("Bid Error:", error);
            return { success: false, error: error.reason || error.shortMessage || 'On-chain bid failed' };
        }
    };

    const deleteAgent = async (id) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            // 1. Delist on-chain
            const tx = await contract.delistAgent(id);
            await tx.wait();

            // 2. Delete off-chain
            const response = await fetch(`${API_URL}/api/agents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (response.ok) {
                setMarketplaceAgents(prev => prev.filter(a => a.id.toString() !== id.toString()));
                return { success: true };
            }
            return { success: true, warning: 'Delisted on-chain, but server error occurred' };
        } catch (error) {
            console.error("Delist Error:", error);
            let msg = error.reason || error.shortMessage || error.message || "Delisting failed. Ensure you are the seller.";

            if (msg.toLowerCase().includes('missing revert data') || msg.toLowerCase().includes('execution reverted')) {
                msg = 'Transaction reverted. This agent was seeded in the database but may not exist on the testnet smart contract.';
            }

            return { success: false, error: msg };
        }
    };

    return (
        <WalletContext.Provider value={{
            account,
            username,
            isConnected,
            user,
            authType: 'web3',
            connectWallet,
            loginWithGoogle,
            disconnectWallet,
            saveUsername,
            marketplaceAgents,
            auctions,
            addAgent,
            deleteAgent,
            buyAgent,
            placeBid,
            loading,
            trustScore,
            purchasedAgents,
            rawPurchases,
            rawSales,
            hasPurchasedFrom: (owner) => purchasedAgents.some(a => (a.owner || '').toLowerCase() === (owner || '').toLowerCase())
        }}>
            {children}
        </WalletContext.Provider>
    );
};
