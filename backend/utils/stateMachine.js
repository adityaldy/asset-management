/**
 * State Machine for Asset Status Transitions
 * Manages valid state transitions and provides validation
 */

// Asset status enum
export const AssetStatus = {
    AVAILABLE: "available",
    ASSIGNED: "assigned",
    REPAIR: "repair",
    RETIRED: "retired",
    MISSING: "missing"
};

// Transaction action types
export const ActionType = {
    CHECKOUT: "checkout",
    CHECKIN: "checkin",
    REPAIR: "repair",
    COMPLETE_REPAIR: "complete_repair",
    DISPOSE: "dispose",
    LOST: "lost",
    FOUND: "found"
};

// Condition status for check-in
export const ConditionStatus = {
    GOOD: "good",
    DAMAGED: "damaged",
    LOST: "lost"
};

/**
 * Valid state transitions map
 * Format: { currentStatus: { action: newStatus } }
 */
const stateTransitions = {
    [AssetStatus.AVAILABLE]: {
        [ActionType.CHECKOUT]: AssetStatus.ASSIGNED,
        [ActionType.REPAIR]: AssetStatus.REPAIR,
        [ActionType.DISPOSE]: AssetStatus.RETIRED
    },
    [AssetStatus.ASSIGNED]: {
        [ActionType.CHECKIN]: AssetStatus.AVAILABLE,      // When condition is good
        [ActionType.REPAIR]: AssetStatus.REPAIR,          // When condition is damaged (via checkin)
        [ActionType.LOST]: AssetStatus.MISSING            // When reported lost
    },
    [AssetStatus.REPAIR]: {
        [ActionType.COMPLETE_REPAIR]: AssetStatus.AVAILABLE,
        [ActionType.DISPOSE]: AssetStatus.RETIRED         // Beyond repair
    },
    [AssetStatus.MISSING]: {
        [ActionType.FOUND]: AssetStatus.AVAILABLE,
        [ActionType.DISPOSE]: AssetStatus.RETIRED         // Write-off
    },
    [AssetStatus.RETIRED]: {
        // No transitions from retired - final state
    }
};

/**
 * Human-readable transition descriptions
 */
const transitionDescriptions = {
    [`${AssetStatus.AVAILABLE}->${AssetStatus.ASSIGNED}`]: "Asset checked out to employee",
    [`${AssetStatus.AVAILABLE}->${AssetStatus.REPAIR}`]: "Asset sent for repair",
    [`${AssetStatus.AVAILABLE}->${AssetStatus.RETIRED}`]: "Asset disposed/retired",
    [`${AssetStatus.ASSIGNED}->${AssetStatus.AVAILABLE}`]: "Asset checked in (good condition)",
    [`${AssetStatus.ASSIGNED}->${AssetStatus.REPAIR}`]: "Asset checked in (damaged, sent for repair)",
    [`${AssetStatus.ASSIGNED}->${AssetStatus.MISSING}`]: "Asset reported lost/missing",
    [`${AssetStatus.REPAIR}->${AssetStatus.AVAILABLE}`]: "Repair completed, asset available",
    [`${AssetStatus.REPAIR}->${AssetStatus.RETIRED}`]: "Asset beyond repair, disposed",
    [`${AssetStatus.MISSING}->${AssetStatus.AVAILABLE}`]: "Lost asset found and recovered",
    [`${AssetStatus.MISSING}->${AssetStatus.RETIRED}`]: "Lost asset written off"
};

/**
 * Check if a transition is valid
 * @param {string} currentStatus - Current asset status
 * @param {string} action - Action to perform
 * @returns {boolean} - Whether the transition is valid
 */
export const isValidTransition = (currentStatus, action) => {
    const transitions = stateTransitions[currentStatus];
    if (!transitions) return false;
    return action in transitions;
};

/**
 * Get the new status after a transition
 * @param {string} currentStatus - Current asset status
 * @param {string} action - Action to perform
 * @returns {string|null} - New status or null if invalid
 */
export const getNextStatus = (currentStatus, action) => {
    if (!isValidTransition(currentStatus, action)) {
        return null;
    }
    return stateTransitions[currentStatus][action];
};

/**
 * Get transition description
 * @param {string} fromStatus - Starting status
 * @param {string} toStatus - Ending status
 * @returns {string} - Human-readable description
 */
export const getTransitionDescription = (fromStatus, toStatus) => {
    const key = `${fromStatus}->${toStatus}`;
    return transitionDescriptions[key] || `Status changed from ${fromStatus} to ${toStatus}`;
};

/**
 * Get available actions for a given status
 * @param {string} currentStatus - Current asset status
 * @returns {string[]} - Array of available actions
 */
export const getAvailableActions = (currentStatus) => {
    const transitions = stateTransitions[currentStatus];
    if (!transitions) return [];
    return Object.keys(transitions);
};

/**
 * Validate and get transition result
 * @param {string} currentStatus - Current asset status
 * @param {string} action - Action to perform
 * @returns {Object} - { valid: boolean, newStatus: string|null, error: string|null }
 */
export const validateTransition = (currentStatus, action) => {
    // Validate current status
    if (!Object.values(AssetStatus).includes(currentStatus)) {
        return {
            valid: false,
            newStatus: null,
            error: `Invalid current status: ${currentStatus}`
        };
    }

    // Validate action
    if (!Object.values(ActionType).includes(action)) {
        return {
            valid: false,
            newStatus: null,
            error: `Invalid action: ${action}`
        };
    }

    // Check if transition is valid
    if (!isValidTransition(currentStatus, action)) {
        const availableActions = getAvailableActions(currentStatus);
        return {
            valid: false,
            newStatus: null,
            error: `Cannot perform '${action}' on asset with status '${currentStatus}'. ` +
                   `Available actions: ${availableActions.length > 0 ? availableActions.join(", ") : "none"}`
        };
    }

    const newStatus = getNextStatus(currentStatus, action);
    return {
        valid: true,
        newStatus,
        error: null,
        description: getTransitionDescription(currentStatus, newStatus)
    };
};

/**
 * Determine action type based on check-in condition
 * @param {string} condition - Condition status (good, damaged, lost)
 * @returns {string} - Action type
 */
export const getCheckinAction = (condition) => {
    switch (condition) {
        case ConditionStatus.GOOD:
            return ActionType.CHECKIN;
        case ConditionStatus.DAMAGED:
            return ActionType.REPAIR;
        case ConditionStatus.LOST:
            return ActionType.LOST;
        default:
            return ActionType.CHECKIN;
    }
};

/**
 * Get status badge color for UI
 * @param {string} status - Asset status
 * @returns {string} - Color name
 */
export const getStatusColor = (status) => {
    const colors = {
        [AssetStatus.AVAILABLE]: "green",
        [AssetStatus.ASSIGNED]: "blue",
        [AssetStatus.REPAIR]: "yellow",
        [AssetStatus.RETIRED]: "gray",
        [AssetStatus.MISSING]: "red"
    };
    return colors[status] || "gray";
};

export default {
    AssetStatus,
    ActionType,
    ConditionStatus,
    isValidTransition,
    getNextStatus,
    getTransitionDescription,
    getAvailableActions,
    validateTransition,
    getCheckinAction,
    getStatusColor
};
