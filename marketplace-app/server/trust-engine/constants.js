/**
 * Trust Engine Tuning Constants (MMR & Decay Logic)
 */
module.exports = {
    K_FACTOR: 0.12,          // Speed of trust change
    SIGMOID_SCALE: 60,      // Smoothness of the probability curve
    ALPHA: 0.08,            // Weight for contribution points
    BETA: 0.9,               // Weight for staked amount (diminishing returns)
    GAMMA: 0.15,            // Weight for agent usage/successful runs
    LOG_A: 120,             // Scaling factor for visible trust (log basis)
    LOG_B: 0,               // Base offset for visible trust
    MAX_DAILY_POINTS: 15.0, // Cap on trust points earned per day
    INTERACTION_CAP: 3.0    // Max points influence from a single user per day
};
