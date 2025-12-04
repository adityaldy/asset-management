/**
 * Unit Tests for State Machine
 * Tests all valid and invalid state transitions
 */

import {
  AssetStatus,
  ActionType,
  ConditionStatus,
  isValidTransition,
  getNextStatus,
  getAvailableActions,
  validateTransition,
  getCheckinAction,
  getStatusColor,
  getTransitionDescription
} from '../../utils/stateMachine.js';

describe('State Machine', () => {
  
  describe('AssetStatus Constants', () => {
    test('should have all required status values', () => {
      expect(AssetStatus.AVAILABLE).toBe('available');
      expect(AssetStatus.ASSIGNED).toBe('assigned');
      expect(AssetStatus.REPAIR).toBe('repair');
      expect(AssetStatus.RETIRED).toBe('retired');
      expect(AssetStatus.MISSING).toBe('missing');
    });
  });

  describe('ActionType Constants', () => {
    test('should have all required action types', () => {
      expect(ActionType.CHECKOUT).toBe('checkout');
      expect(ActionType.CHECKIN).toBe('checkin');
      expect(ActionType.REPAIR).toBe('repair');
      expect(ActionType.COMPLETE_REPAIR).toBe('complete_repair');
      expect(ActionType.DISPOSE).toBe('dispose');
      expect(ActionType.LOST).toBe('lost');
      expect(ActionType.FOUND).toBe('found');
    });
  });

  describe('isValidTransition', () => {
    // Available -> transitions
    test('available -> assigned (checkout) should be valid', () => {
      expect(isValidTransition(AssetStatus.AVAILABLE, ActionType.CHECKOUT)).toBe(true);
    });

    test('available -> repair should be valid', () => {
      expect(isValidTransition(AssetStatus.AVAILABLE, ActionType.REPAIR)).toBe(true);
    });

    test('available -> retired (dispose) should be valid', () => {
      expect(isValidTransition(AssetStatus.AVAILABLE, ActionType.DISPOSE)).toBe(true);
    });

    test('available -> checkin should be invalid', () => {
      expect(isValidTransition(AssetStatus.AVAILABLE, ActionType.CHECKIN)).toBe(false);
    });

    // Assigned -> transitions
    test('assigned -> available (checkin) should be valid', () => {
      expect(isValidTransition(AssetStatus.ASSIGNED, ActionType.CHECKIN)).toBe(true);
    });

    test('assigned -> repair should be valid', () => {
      expect(isValidTransition(AssetStatus.ASSIGNED, ActionType.REPAIR)).toBe(true);
    });

    test('assigned -> missing (lost) should be valid', () => {
      expect(isValidTransition(AssetStatus.ASSIGNED, ActionType.LOST)).toBe(true);
    });

    test('assigned -> checkout should be invalid', () => {
      expect(isValidTransition(AssetStatus.ASSIGNED, ActionType.CHECKOUT)).toBe(false);
    });

    // Repair -> transitions
    test('repair -> available (complete_repair) should be valid', () => {
      expect(isValidTransition(AssetStatus.REPAIR, ActionType.COMPLETE_REPAIR)).toBe(true);
    });

    test('repair -> retired (dispose) should be valid', () => {
      expect(isValidTransition(AssetStatus.REPAIR, ActionType.DISPOSE)).toBe(true);
    });

    test('repair -> checkout should be invalid', () => {
      expect(isValidTransition(AssetStatus.REPAIR, ActionType.CHECKOUT)).toBe(false);
    });

    // Missing -> transitions
    test('missing -> available (found) should be valid', () => {
      expect(isValidTransition(AssetStatus.MISSING, ActionType.FOUND)).toBe(true);
    });

    test('missing -> retired (dispose) should be valid', () => {
      expect(isValidTransition(AssetStatus.MISSING, ActionType.DISPOSE)).toBe(true);
    });

    test('missing -> checkout should be invalid', () => {
      expect(isValidTransition(AssetStatus.MISSING, ActionType.CHECKOUT)).toBe(false);
    });

    // Retired -> no transitions (final state)
    test('retired -> any action should be invalid', () => {
      expect(isValidTransition(AssetStatus.RETIRED, ActionType.CHECKOUT)).toBe(false);
      expect(isValidTransition(AssetStatus.RETIRED, ActionType.CHECKIN)).toBe(false);
      expect(isValidTransition(AssetStatus.RETIRED, ActionType.REPAIR)).toBe(false);
      expect(isValidTransition(AssetStatus.RETIRED, ActionType.FOUND)).toBe(false);
    });

    // Invalid status
    test('invalid status should return false', () => {
      expect(isValidTransition('invalid_status', ActionType.CHECKOUT)).toBe(false);
    });
  });

  describe('getNextStatus', () => {
    test('should return correct next status for valid transitions', () => {
      expect(getNextStatus(AssetStatus.AVAILABLE, ActionType.CHECKOUT)).toBe(AssetStatus.ASSIGNED);
      expect(getNextStatus(AssetStatus.AVAILABLE, ActionType.REPAIR)).toBe(AssetStatus.REPAIR);
      expect(getNextStatus(AssetStatus.AVAILABLE, ActionType.DISPOSE)).toBe(AssetStatus.RETIRED);
      expect(getNextStatus(AssetStatus.ASSIGNED, ActionType.CHECKIN)).toBe(AssetStatus.AVAILABLE);
      expect(getNextStatus(AssetStatus.ASSIGNED, ActionType.LOST)).toBe(AssetStatus.MISSING);
      expect(getNextStatus(AssetStatus.REPAIR, ActionType.COMPLETE_REPAIR)).toBe(AssetStatus.AVAILABLE);
      expect(getNextStatus(AssetStatus.MISSING, ActionType.FOUND)).toBe(AssetStatus.AVAILABLE);
    });

    test('should return null for invalid transitions', () => {
      expect(getNextStatus(AssetStatus.AVAILABLE, ActionType.CHECKIN)).toBe(null);
      expect(getNextStatus(AssetStatus.RETIRED, ActionType.CHECKOUT)).toBe(null);
    });
  });

  describe('getAvailableActions', () => {
    test('should return available actions for AVAILABLE status', () => {
      const actions = getAvailableActions(AssetStatus.AVAILABLE);
      expect(actions).toContain(ActionType.CHECKOUT);
      expect(actions).toContain(ActionType.REPAIR);
      expect(actions).toContain(ActionType.DISPOSE);
      expect(actions.length).toBe(3);
    });

    test('should return available actions for ASSIGNED status', () => {
      const actions = getAvailableActions(AssetStatus.ASSIGNED);
      expect(actions).toContain(ActionType.CHECKIN);
      expect(actions).toContain(ActionType.REPAIR);
      expect(actions).toContain(ActionType.LOST);
      expect(actions.length).toBe(3);
    });

    test('should return available actions for REPAIR status', () => {
      const actions = getAvailableActions(AssetStatus.REPAIR);
      expect(actions).toContain(ActionType.COMPLETE_REPAIR);
      expect(actions).toContain(ActionType.DISPOSE);
      expect(actions.length).toBe(2);
    });

    test('should return available actions for MISSING status', () => {
      const actions = getAvailableActions(AssetStatus.MISSING);
      expect(actions).toContain(ActionType.FOUND);
      expect(actions).toContain(ActionType.DISPOSE);
      expect(actions.length).toBe(2);
    });

    test('should return empty array for RETIRED status', () => {
      const actions = getAvailableActions(AssetStatus.RETIRED);
      expect(actions).toEqual([]);
    });

    test('should return empty array for invalid status', () => {
      const actions = getAvailableActions('invalid');
      expect(actions).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    test('should return valid result for valid transition', () => {
      const result = validateTransition(AssetStatus.AVAILABLE, ActionType.CHECKOUT);
      expect(result.valid).toBe(true);
      expect(result.newStatus).toBe(AssetStatus.ASSIGNED);
      expect(result.error).toBe(null);
      expect(result.description).toBeDefined();
    });

    test('should return invalid result for invalid transition', () => {
      const result = validateTransition(AssetStatus.AVAILABLE, ActionType.CHECKIN);
      expect(result.valid).toBe(false);
      expect(result.newStatus).toBe(null);
      expect(result.error).toContain('Cannot perform');
    });

    test('should return error for invalid status', () => {
      const result = validateTransition('invalid_status', ActionType.CHECKOUT);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid current status');
    });

    test('should return error for invalid action', () => {
      const result = validateTransition(AssetStatus.AVAILABLE, 'invalid_action');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid action');
    });

    test('should include available actions in error message', () => {
      const result = validateTransition(AssetStatus.ASSIGNED, ActionType.CHECKOUT);
      expect(result.error).toContain('checkin');
    });
  });

  describe('getCheckinAction', () => {
    test('should return CHECKIN for good condition', () => {
      expect(getCheckinAction(ConditionStatus.GOOD)).toBe(ActionType.CHECKIN);
    });

    test('should return REPAIR for damaged condition', () => {
      expect(getCheckinAction(ConditionStatus.DAMAGED)).toBe(ActionType.REPAIR);
    });

    test('should return LOST for lost condition', () => {
      expect(getCheckinAction(ConditionStatus.LOST)).toBe(ActionType.LOST);
    });

    test('should return CHECKIN for unknown condition', () => {
      expect(getCheckinAction('unknown')).toBe(ActionType.CHECKIN);
    });
  });

  describe('getStatusColor', () => {
    test('should return correct colors for each status', () => {
      expect(getStatusColor(AssetStatus.AVAILABLE)).toBe('green');
      expect(getStatusColor(AssetStatus.ASSIGNED)).toBe('blue');
      expect(getStatusColor(AssetStatus.REPAIR)).toBe('yellow');
      expect(getStatusColor(AssetStatus.RETIRED)).toBe('gray');
      expect(getStatusColor(AssetStatus.MISSING)).toBe('red');
    });

    test('should return gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('gray');
    });
  });

  describe('getTransitionDescription', () => {
    test('should return description for valid transitions', () => {
      const desc = getTransitionDescription(AssetStatus.AVAILABLE, AssetStatus.ASSIGNED);
      expect(desc).toContain('checked out');
    });

    test('should return fallback description for unknown transitions', () => {
      const desc = getTransitionDescription('unknown', 'unknown2');
      expect(desc).toContain('Status changed from');
    });
  });

  describe('Full Workflow Tests', () => {
    test('complete checkout-checkin workflow should be valid', () => {
      // Start: available
      let status = AssetStatus.AVAILABLE;
      
      // Checkout
      let result = validateTransition(status, ActionType.CHECKOUT);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.ASSIGNED);
      
      // Checkin
      result = validateTransition(status, ActionType.CHECKIN);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.AVAILABLE);
    });

    test('repair workflow should be valid', () => {
      let status = AssetStatus.AVAILABLE;
      
      // Send to repair
      let result = validateTransition(status, ActionType.REPAIR);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.REPAIR);
      
      // Complete repair
      result = validateTransition(status, ActionType.COMPLETE_REPAIR);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.AVAILABLE);
    });

    test('lost and found workflow should be valid', () => {
      let status = AssetStatus.ASSIGNED;
      
      // Report lost
      let result = validateTransition(status, ActionType.LOST);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.MISSING);
      
      // Found
      result = validateTransition(status, ActionType.FOUND);
      expect(result.valid).toBe(true);
      status = result.newStatus;
      expect(status).toBe(AssetStatus.AVAILABLE);
    });

    test('dispose workflow from different states should be valid', () => {
      // From available
      expect(validateTransition(AssetStatus.AVAILABLE, ActionType.DISPOSE).valid).toBe(true);
      
      // From repair (beyond repair)
      expect(validateTransition(AssetStatus.REPAIR, ActionType.DISPOSE).valid).toBe(true);
      
      // From missing (write-off)
      expect(validateTransition(AssetStatus.MISSING, ActionType.DISPOSE).valid).toBe(true);
    });
  });
});
