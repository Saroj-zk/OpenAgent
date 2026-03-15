import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, REGISTRY_ABI, SUBSCRIPTIONS_ADDRESS, SUBSCRIPTIONS_ABI } from '../contracts';
import { useNavigate } from 'react-router-dom';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const WalletProvider = ({ children }) => {
    // --- State Management ---
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const [trustScore, setTrustScore] = useState(200); // Default to 200 for testing (Trust disabled)

    // Marketplace Data
    const [marketplaceAgents, setMarketplaceAgents] = useState([]);
    const [purchasedAgents, setPurchasedAgents] = useState([]);
    const [rawPurchases, setRawPurchases] = useState([]);
    const [rawSales, setRawSales] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    const loadMarketplaceData = async (showExperimental = false) => {
        try {
            const [agentsRes, auctionsRes] = await Promise.all([
                fetch(`${API_URL}/api/agents${showExperimental ? '?showExperimental=true' : ''}`).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/auctions`).catch(() => ({ ok: false }))
            ]);

            if (agentsRes.ok) setMarketplaceAgents(await agentsRes.json());
            if (auctionsRes.ok) setAuctions(await auctionsRes.json());
        } catch (error) {
            console.error("Failed to fetch marketplace data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMarketplaceData();
    }, []); // Removed loadMarketplaceData from dependency array as it's not wrapped in useCallback anymore

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
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, provider);

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
                    // setTrustScore(data.trustScore || 200); // Fixed for testing
                    setTrustScore(200); // Always trusted for testing
                    setUser(data);
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
    const connectWallet = async (selectedProvider = window.ethereum) => {
        if (!selectedProvider) {
            alert("No wallet selected or installed.");
            return false;
        }

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(selectedProvider);

            let chainId = '0x0';
            try {
                const network = await provider.getNetwork();
                chainId = '0x' + network.chainId.toString(16);
            } catch (networkError) {
                console.warn("Ethers network check failed, using fallback:", networkError);
                chainId = selectedProvider.chainId ||
                    (selectedProvider.networkVersion ? '0x' + parseInt(selectedProvider.networkVersion).toString(16) : '0x0');
            }

            if (chainId !== '0x14a34' && chainId !== '0x0') {
                try {
                    await selectedProvider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x14a34' }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        try {
                            await selectedProvider.request({
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
                            console.error("Error adding network, proceeding anyway:", addError);
                        }
                    } else {
                        console.error("Error switching network, proceeding anyway:", switchError);
                    }
                }
            }

            const accounts = await selectedProvider.request({ method: 'eth_requestAccounts' });

            if (accounts && accounts.length > 0) {
                const address = accounts[0].toLowerCase();

                // Fallback direct RPC signing if Ethers provider abstractions fail 
                // in multi-wallet extension environments (like Coinbase/MetaMask conflicts)
                try {
                    const nonceRes = await fetch(`${API_URL}/api/auth/nonce?address=${address}`, {
                        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                    });
                    const nonceData = await nonceRes.json();
                    const nonce = nonceData.nonce;
                    const message = `Login to AgentBase with Nonce: ${nonce}`;

                    console.log("--- Frontend Auth Process ---");
                    console.log(`[AUTH_DEBUG_FRONT] address=[${address}] nonce=[${nonce}]`);
                    console.log("Full Message: [" + message + "]");
                    console.log("Signer Message:", message);

                    const signer = await provider.getSigner(address);
                    const signerAddress = await signer.getAddress();
                    console.log("Verified Signer Address:", signerAddress);

                    const signature = await signer.signMessage(message);
                    console.log("Generated Signature:", signature);

                    // LOCAL VERIFICATION TEST
                    const localRecovered = ethers.verifyMessage(message, signature);
                    console.log("Local Recovered Address:", localRecovered.toLowerCase());
                    console.log("Matches connected address?", localRecovered.toLowerCase() === address.toLowerCase());

                    const verifyRes = await fetch(`${API_URL}/api/auth/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address, signature })
                    });

                    const verifyData = await verifyRes.json();
                    console.log("Backend Response:", verifyData);

                    if (!verifyRes.ok || !verifyData.success) {
                        console.error("Backend Auth Rejection:", verifyData);
                        throw new Error(verifyData.error || 'Verification failed');
                    }

                    localStorage.setItem('jwtToken', verifyData.token);
                    const userData = verifyData.user || { address };
                    setUser({ ...userData, authType: 'web3' });
                    setAccount(address.toLowerCase());
                    setIsConnected(true);

                } catch (authError) {
                    console.error("CRITICAL AUTH ERROR:", authError);
                    setLoading(false);
                    return false;
                }

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
        let handleAccounts, handleChain;
        if (window.ethereum) {
            handleAccounts = (accounts) => {
                if (accounts.length > 0) {
                    const address = accounts[0].toLowerCase();
                    setAccount(address);
                    syncIdentity(address);
                } else {
                    disconnectWallet();
                }
            };

            handleChain = () => {
                // Soft reload logic to prevent infinite HMR loops in strict mode
                console.log("Chain changed, re-syncing...");
                if (account) syncIdentity(account);
            };

            window.ethereum.on('accountsChanged', handleAccounts);
            window.ethereum.on('chainChanged', handleChain);


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
                try {
                    let chainId = window.ethereum.chainId;
                    if (!chainId) {
                        const tempProvider = new ethers.BrowserProvider(window.ethereum);
                        const network = await tempProvider.getNetwork();
                        chainId = '0x' + network.chainId.toString(16);
                    }

                    if (chainId !== '0x14a34') {
                        console.warn(`Connected to unsupported chain: ${chainId}. Switching to Base Sepolia.`);
                        await switchNetwork();
                    }
                } catch (e) {
                    console.error("Network check suppressed due to provider incompatibility:", e);
                }
            };
            checkNetwork();

            // Auto resume session using JWT if possible
            const userDisconnected = localStorage.getItem('userDisconnected') === 'true';
            const jwtToken = localStorage.getItem('jwtToken');

            if (!userDisconnected && jwtToken) {
                fetch(`${API_URL}/api/auth/resume`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.user) {
                            const addr = data.user.address.toLowerCase();
                            setAccount(addr);
                            setUser({ ...data.user, authType: 'web3' });
                            setUsername(data.user.username || null);
                            // setTrustScore(data.user.trustScore || 200);
                            setTrustScore(200); // Always trusted for testing
                            setIsConnected(true);
                            // Make sure we have provider access to contracts
                            const tempProvider = new ethers.BrowserProvider(window.ethereum);
                            tempProvider.listAccounts().catch(() => { });
                        } else {
                            throw new Error("Invalid session token");
                        }
                    })
                    .catch(err => {
                        console.warn("Session resume failed, token expired:", err);
                        localStorage.removeItem('jwtToken');
                    });
            } else if (!userDisconnected) {
                // If they previously connected but have no token (e.g. legacy state)
                const tempProvider = new ethers.BrowserProvider(window.ethereum);
                tempProvider.listAccounts().then(accounts => {
                    if (accounts.length > 0) {
                        // connectWallet(); // DEACTIVATED to stop popup loop on reload without token
                    }
                }).catch(() => { });
            }

            return () => {
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccounts);
                    window.ethereum.removeListener('chainChanged', handleChain);
                }
            };
        }
    }, []);

    // 2. Identity Claiming
    const saveUsername = async (newName) => {
        if (!isConnected || !account) return { success: false, error: 'Wallet not connected' };
        if (!window.ethereum) return { success: false, error: 'Web3 provider missing' };

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Hard check network before signing
            const { chainId } = await provider.getNetwork();
            if (chainId !== 84532n && chainId !== 84532) { // 0x14a34
                // The switchNetwork function is not directly available here,
                // but connectWallet handles it. For now, we'll just return an error.
                return { success: false, error: 'Please switch to Base Sepolia network and try again.' };
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

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
        if (!isConnected) return { success: false, error: "Wallet not connected" };

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const { chainId } = await provider.getNetwork();
            if (chainId !== 84532n && chainId !== 84532) {
                return { success: false, error: "Please switch to Base Sepolia network" };
            }

            // 1. Contract Listing (Web3)
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            // Ensure price is a valid string for parseEther
            const priceStr = agentData.price ? agentData.price.toString() : "0";
            const priceWei = ethers.parseEther(priceStr);

            let computedHash = '0x' + "0".repeat(64);
            if (codeFile) {
                const buffer = await codeFile.arrayBuffer();
                const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                computedHash = '0x' + hashHex;
            }

            console.log("Pre-flight check:", { priceStr, priceWei: priceWei.toString(), artifactHash: computedHash });

            const multiplier = await contract.getBondMultiplier(account).catch(() => 1n);
            // Trust score requirement bypassed for testing
            /*
            if (multiplier === 0n || multiplier === 0) {
                return { success: false, error: "Your account is STARTER (Trust Score < 30). You cannot list agents." };
            }
            */

            // Fetch listing bond from contract
            const baseBond = await contract.LISTING_BOND();
            const totalBond = BigInt(baseBond) * BigInt(multiplier);

            // Check if user has enough balance
            const balance = await provider.getBalance(account);
            if (balance < totalBond) {
                const required = ethers.formatEther(totalBond);
                const current = ethers.formatEther(balance);
                return { success: false, error: `Insufficient funds for listing bond. Required: ${required} ETH. Your Balance: ${current} ETH.` };
            }

            // ensure we have BigInt for the contract call
            const priceVal = BigInt(priceWei);
            const bondVal = BigInt(totalBond);
            const hashVal = computedHash.toLowerCase();

            if (hashVal.length !== 66) {
                return { success: false, error: "Invalid artifact hash length. Please try again." };
            }

            console.log(`Executing listAgent with Price: ${priceVal}, Hash: ${hashVal}, Bond: ${bondVal}`);
            const tx = await contract.listAgent(priceVal, hashVal, { value: bondVal });
            const receipt = await tx.wait();

            // Find AgentListed event
            const event = receipt.logs
                .map(log => {
                    try { return contract.interface.parseLog(log); } catch (e) { return null; }
                })
                .find(e => e && e.name === 'AgentListed');

            if (!event) return { success: false, error: "Deployment succeeded but event not found." };
            const onChainId = (event.args.id || event.args[0]).toString();

            // 2. Add metadata to database via API
            const formData = new FormData();
            formData.append('id', onChainId);
            formData.append('onChainId', onChainId);
            formData.append('name', agentData.name || '');
            formData.append('role', agentData.role || '');
            formData.append('price', priceStr);
            formData.append('description', agentData.description || '');
            formData.append('owner', account);
            formData.append('creator', account);
            formData.append('model', agentData.model || '');
            formData.append('framework', agentData.framework || '');

            if (imageFile) formData.append('image', imageFile);
            if (codeFile) formData.append('agentCode', codeFile);

            // Limit gallery to 3 images as per typical UI
            if (agentData.galleryFiles) {
                agentData.galleryFiles.slice(0, 3).forEach((file) => {
                    if (file) formData.append('gallery', file);
                });
            }

            const extras = [
                'tagline', 'useCase', 'capabilities', 'agentType', 'aiModel',
                'runtime', 'dockerRequired', 'gpuRequired', 'externalApis',
                'dependencies', 'deploymentComplexity', 'interval',
                'sourceVisibility', 'support', 'updateFrequency',
                'version', 'contextWindow', 'architecture', 'inferenceService',
                'videoLink', 'website', 'discord', 'telegram', 'docs',
                'pricingModel', 'deliveryType', 'github', 'apiDependencies'
            ];
            extras.forEach(ext => {
                if (agentData[ext] !== undefined && agentData[ext] !== null) {
                    const val = typeof agentData[ext] === 'object' ? JSON.stringify(agentData[ext]) : agentData[ext];
                    formData.append(ext, val);
                }
            });

            formData.append('tags', JSON.stringify(agentData.tags || []));
            formData.append('txHash', tx.hash);
            formData.append('artifactHash', hashVal);

            const apiRes = await fetch(`${API_URL}/api/agents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: formData
            });

            if (apiRes.ok) {
                const newAgent = await apiRes.json();
                setMarketplaceAgents(prev => [newAgent, ...prev]);
                return { success: true };
            }
            const errorData = await apiRes.json();
            return { success: false, error: errorData.error || "Database sync failed." };
        } catch (error) {
            console.error("Failed to deploy agent:", error);
            const errReason = error.reason || error.shortMessage || error.message || "An unexpected error occurred.";
            if (errReason.includes("out-of-bounds") || errReason.includes("out of range")) {
                return { success: false, error: `Value out-of-bounds in contract call. Please check your price and artifacts. (Technical: ${errReason})` };
            }
            return { success: false, error: errReason };
        }
    };

    // 4. Buy Agent 
    const buyAgent = async (agent) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            // --- Pre-flight: Validate agent exists on-chain ---
            let onChainAgent;
            try {
                onChainAgent = await contract.agents(agent.id);
                if (!onChainAgent.active) {
                    return { 
                        success: false, 
                        error: `Agent #${agent.id} is not active on-chain. It may have been delisted or was never listed on the smart contract. Please ask the creator to re-list it.`
                    };
                }
            } catch (e) {
                return { 
                    success: false, 
                    error: `Agent #${agent.id} was not found on the smart contract. This agent exists in the database but was not registered on-chain. Try listing a new agent.`
                };
            }

            // Use ON-CHAIN price (the real source of truth), not database price
            const onChainPriceWei = onChainAgent.price;
            const priceToSend = onChainPriceWei > 0n ? onChainPriceWei : ethers.parseEther('0');

            console.log(`[buyAgent] Verified on-chain: Agent #${agent.id} active=${onChainAgent.active}, price=${ethers.formatEther(onChainPriceWei)} ETH`);

            const tx = await contract.buyAgent(agent.id, { value: priceToSend });
            await tx.wait();

            // Web 2.5: Record purchase in backend DB
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
            const reason = error.reason || error.shortMessage || error.message || 'On-chain purchase failed';
            
            if (reason.includes('Agent not active for sale')) {
                return { success: false, error: `Agent not active on-chain. The agent's ID in the database doesn't match any active listing on the smart contract. Agent ID: ${agent.id}` };
            }
            if (reason.includes('already own access')) {
                return { success: false, error: 'You already own this agent!' };
            }
            if (reason.includes('Insufficient funds') || reason.includes('insufficient funds')) {
                return { success: false, error: 'Insufficient ETH in your wallet to purchase this agent.' };
            }
            return { success: false, error: reason };
        }
    };


    // 4.5 Open Dispute (Escrow)
    const openDispute = async (escrowId, evidence) => {
        if (!isConnected) return { success: false, error: 'Connect wallet to dispute' };
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            let evidenceHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
            if (evidence) {
                const buffer = new TextEncoder().encode(evidence);
                const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                evidenceHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            const tx = await contract.openDispute(escrowId, evidenceHash);
            await tx.wait();

            // Update local DB instantly so frontend registers it before indexer catches up
            fetch(`${API_URL}/api/disputes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ escrowId, evidence })
            }).catch(() => { });

            return { success: true, transaction: tx };
        } catch (error) {
            console.error("Dispute failed:", error);
            return { success: false, error: error.reason || error.message };
        }
    };

    // 5. Auctions 
    const placeBid = async (auctionId, amount) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

            const amountWei = ethers.parseEther(amount.toString());

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

    const subscribeToAgent = async (agent) => {
        try {
            if (!window.ethereum || !account) return { success: false, error: 'Wallet not connected' };
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await ethersProvider.getSigner();

            const subContract = new ethers.Contract(SUBSCRIPTIONS_ADDRESS, SUBSCRIPTIONS_ABI, signer);
            const priceInWei = ethers.parseEther(agent.price.toString());

            const tx = await subContract.subscribe(agent.id, { value: priceInWei });
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (error) {
            console.error("Subscription failed:", error);
            return { success: false, error: error.reason || error.message };
        }
    };

    const extendAgentSubscription = async (agent) => {
        try {
            if (!window.ethereum || !account) return { success: false, error: 'Wallet not connected' };
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await ethersProvider.getSigner();

            const subContract = new ethers.Contract(SUBSCRIPTIONS_ADDRESS, SUBSCRIPTIONS_ABI, signer);
            const priceInWei = ethers.parseEther(agent.price.toString());

            const tx = await subContract.extendSubscription(agent.id, { value: priceInWei });
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (error) {
            console.error("Extend failed:", error);
            return { success: false, error: error.reason || error.message };
        }
    };

    const stake = async (amount, lockDays) => {
        if (!isConnected) return { success: false, error: 'Auth required' };
        try {
            const res = await fetch(`${API_URL}/api/users/stake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ username: username || account, amount, lockDays })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchBackendIdentity(account);
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Connection failed' };
        }
    };

    const unstake = async (amount) => {
        if (!isConnected) return { success: false, error: 'Auth required' };
        try {
            const res = await fetch(`${API_URL}/api/users/unstake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ username: username || account, amount })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchBackendIdentity(account);
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Connection failed' };
        }
    };

    const deleteAgent = async (id) => {
        if (!isConnected) return { success: false, error: 'Connect your wallet first' };

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signer);

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
            disconnectWallet,
            saveUsername,
            addAgent,
            buyAgent,
            openDispute,
            loadMarketplaceData,
            deleteAgent,
            placeBid,
            subscribeToAgent,
            extendAgentSubscription,
            marketplaceAgents,
            auctions,
            loading,
            trustScore,
            stake,
            unstake,
            purchasedAgents,
            rawPurchases,
            rawSales,
            hasPurchasedFrom: (owner) => purchasedAgents.some(a => (a.owner || '').toLowerCase() === (owner || '').toLowerCase())
        }}>
            {children}
        </WalletContext.Provider>
    );
};
