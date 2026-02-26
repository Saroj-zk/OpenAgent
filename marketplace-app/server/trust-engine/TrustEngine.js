const Config = require('./constants');
const User = require('../models/User');
const Agent = require('../models/Agent');
const ForumPost = require('../models/ForumPost');

/**
 * TrustEngine - A modular system for calculating and managing user reputation.
 * Refactored for MongoDB.
 */
class TrustEngine {
    constructor() { }

    // --- Core Math ---
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x / Config.SIGMOID_SCALE));
    }

    mappingHiddenToVisible(h) {
        return Math.floor(Config.LOG_A * Math.log10(Math.max(0, h) + 1) + Config.LOG_B);
    }

    getRollingContributionPoints(user) {
        return user.contribution_points_rolling_30d || 0;
    }

    computeDecay(user, visibleTrust) {
        if (!user.last_activity_at) return 0;
        const daysInactive = Math.max(0, (new Date() - new Date(user.last_activity_at)) / (1000 * 60 * 60 * 24));

        if (daysInactive <= 7) return 0;

        let delta = 0.03;
        if (visibleTrust >= 200) delta = 0.08;
        else if (visibleTrust >= 100) delta = 0.05;

        return delta * (daysInactive - 7);
    }

    async computeAgentUsageBoost(username) {
        const userAgents = await Agent.find({
            $or: [
                { owner: username },
                { creator: username }
            ]
        });

        let totalUsageBoost = 0;
        userAgents.forEach(agent => {
            const runs = agent.successful_runs_30d || 0;
            totalUsageBoost += Math.log10(runs + 1);
        });

        return Config.GAMMA * totalUsageBoost;
    }

    // --- Public API ---

    async computeUserTrust(username) {
        const user = await User.findOne({
            $or: [
                { username: username },
                { address: username.toLowerCase() }
            ]
        });

        if (!user) return 10;

        let h = user.hidden_rating || 10;
        const visibleNow = this.mappingHiddenToVisible(h);

        // 1. Contribution Boost
        const cp = 0.7 * (user.contribution_points_rolling_30d || 0) + 0.3 * Math.log10((user.contribution_points_lifetime || 0) + 1);
        const contributionBoost = Config.ALPHA * cp;

        // 2. Stake Boost
        let stakeBoost = 0;
        if (user.staked_amount > 0) {
            let actualStakeWeight = 1.0;
            const stakeAgeDays = user.stake_started_at ? (new Date() - new Date(user.stake_started_at)) / (1000 * 60 * 60 * 24) : 0;
            const isLocked = (user.stake_lock_days_remaining || 0) > 0;

            if (stakeAgeDays < 7 && !isLocked) {
                actualStakeWeight = 0.2;
            }
            stakeBoost = Config.BETA * Math.log10(user.staked_amount + 1) * actualStakeWeight;
        }

        // 3. Agent Usage Boost
        const agentBoost = await this.computeAgentUsageBoost(username);

        // 4. Decay
        const decay = this.computeDecay(user, visibleNow);

        const finalH = h + contributionBoost + stakeBoost + agentBoost - decay;
        return this.mappingHiddenToVisible(finalH);
    }

    async updateTrustScore(username, outcomeValue, type = 'general', sourceUser = null) {
        if (!username) return;

        const user = await User.findOne({
            $or: [
                { username: username },
                { address: username.toLowerCase() }
            ]
        });

        if (user) {
            const today = new Date().toISOString().split('T')[0];

            // Initialize daily fields if missing or outdated
            if (!user.daily_from_others) user.daily_from_others = new Map();

            if (user.daily_posts_date !== today) {
                user.daily_posts_date = today;
                user.daily_weighted_total = 0;
                user.daily_from_others = new Map();
            }

            let weight = 1.0;
            if (sourceUser && sourceUser !== username) {
                const sourceTrust = await this.computeUserTrust(sourceUser);
                weight = Math.min(2.0, Math.max(0.5, Math.log10(sourceTrust + 10) / 2));

                const currentFromPeer = user.daily_from_others.get(sourceUser) || 0;
                if (outcomeValue > 0 && currentFromPeer >= Config.INTERACTION_CAP) return;
            }

            let weightedPoints = outcomeValue * weight;

            if (outcomeValue > 0) {
                const currentTotal = user.daily_weighted_total || 0;
                if (currentTotal >= Config.MAX_DAILY_POINTS) return;

                if (currentTotal + weightedPoints > Config.MAX_DAILY_POINTS) {
                    weightedPoints = Config.MAX_DAILY_POINTS - currentTotal;
                }
                user.daily_weighted_total = currentTotal + weightedPoints;

                if (sourceUser) {
                    const peerPoints = user.daily_from_others.get(sourceUser) || 0;
                    user.daily_from_others.set(sourceUser, peerPoints + weightedPoints);
                }
            }

            const currentRating = user.hidden_rating || 10;
            const expected = this.sigmoid(currentRating);
            let performance = expected + weightedPoints;
            if (type === 'marketplace_outcome') performance = outcomeValue;

            const deltaOutcome = Config.K_FACTOR * (performance - expected);
            user.hidden_rating = Math.max(0, currentRating + deltaOutcome);
            user.last_activity_at = new Date();

            await user.save();
            return this.mappingHiddenToVisible(user.hidden_rating);
        }
    }
}

module.exports = TrustEngine;
