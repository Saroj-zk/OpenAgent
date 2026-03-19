const PURCHASE_STATUS = Object.freeze({
    CREATED: 'created',
    COMPLETED: 'completed',
    DISPUTED: 'disputed',
    REFUNDED: 'refunded',
    RESOLVED: 'resolved',
    FINALIZED: 'finalized'
});

function normalizePurchaseStatus(status) {
    if (!status || typeof status !== 'string') {
        return PURCHASE_STATUS.CREATED;
    }

    const normalized = status.trim().toLowerCase();
    return Object.values(PURCHASE_STATUS).includes(normalized)
        ? normalized
        : PURCHASE_STATUS.CREATED;
}

function statusAllowsAccess(status) {
    const normalized = normalizePurchaseStatus(status);
    return normalized !== PURCHASE_STATUS.DISPUTED && normalized !== PURCHASE_STATUS.REFUNDED;
}

module.exports = {
    PURCHASE_STATUS,
    normalizePurchaseStatus,
    statusAllowsAccess
};
