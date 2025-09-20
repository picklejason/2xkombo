import { InputKey } from "@/components/InputIcon";

/**
 * Configuration for combo limits and validation rules
 * These values can be easily adjusted for testing and tuning
 */
export const COMBO_LIMITS = {
  /** Maximum number of combos a user can have */
  MAX_COMBOS_PER_USER: 100,
  
  /** Minimum number of inputs required in a combo */
  MIN_INPUTS: 5,
  
  /** Whether combos must contain at least one "then" (>) operator */
  REQUIRE_THEN: true,
} as const;

/**
 * Validates if a combo meets the minimum input requirements
 */
export function validateComboInputs(inputs: InputKey[]): {
  isValid: boolean;
  error?: string;
} {
  // Check minimum input count
  if (inputs.length <= COMBO_LIMITS.MIN_INPUTS) {
    return {
      isValid: false,
      error: `Combo must have more than ${COMBO_LIMITS.MIN_INPUTS} inputs`
    };
  }

  // Check for "then" operator requirement
  if (COMBO_LIMITS.REQUIRE_THEN && !inputs.includes(">")) {
    return {
      isValid: false,
      error: "Combo must contain at least one 'then' (>) operator"
    };
  }

  return { isValid: true };
}

/**
 * Validates if a user can create a new combo based on their current count
 */
export function validateUserComboLimit(currentComboCount: number): {
  isValid: boolean;
  error?: string;
} {
  if (currentComboCount >= COMBO_LIMITS.MAX_COMBOS_PER_USER) {
    return {
      isValid: false,
      error: `You have reached the maximum limit of ${COMBO_LIMITS.MAX_COMBOS_PER_USER} combos`
    };
  }

  return { isValid: true };
}
