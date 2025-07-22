/**
 * In-memory storage for calculation cooldown management
 */

interface CalculationHistory {
  lastExecutionTime: number | null;
  isExecuting: boolean;
}

// In-memory storage for calculation history
const calculationHistory: CalculationHistory = {
  lastExecutionTime: null,
  isExecuting: false
};

/**
 * Check if enough time has passed since the last calculation
 * @param cooldownMinutes - Cooldown period in minutes (default: 15)
 * @returns true if calculation is allowed, false otherwise
 */
export function canExecuteCalculation(cooldownMinutes: number = 15): boolean {
  if (calculationHistory.lastExecutionTime === null) {
    return true;
  }
  
  const now = Date.now();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLastExecution = now - calculationHistory.lastExecutionTime;
  
  return timeSinceLastExecution >= cooldownMs;
}

/**
 * Get the remaining cooldown time in minutes
 * @param cooldownMinutes - Cooldown period in minutes (default: 15)
 * @returns remaining minutes until next calculation is allowed, 0 if allowed now
 */
export function getRemainingCooldownMinutes(cooldownMinutes: number = 15): number {
  if (calculationHistory.lastExecutionTime === null) {
    return 0;
  }
  
  const now = Date.now();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLastExecution = now - calculationHistory.lastExecutionTime;
  const remainingMs = cooldownMs - timeSinceLastExecution;
  
  if (remainingMs <= 0) {
    return 0;
  }
  
  return Math.ceil(remainingMs / (60 * 1000));
}

/**
 * Mark that a calculation has been executed
 */
export function markCalculationExecuted(): void {
  calculationHistory.lastExecutionTime = Date.now();
}

/**
 * Get the last execution time (for debugging/display purposes)
 * @returns Date object of last execution or null if never executed
 */
export function getLastExecutionTime(): Date | null {
  if (calculationHistory.lastExecutionTime === null) {
    return null;
  }
  return new Date(calculationHistory.lastExecutionTime);
}

/**
 * Check if calculation is currently executing
 * @returns true if currently executing
 */
export function isCalculationExecuting(): boolean {
  return calculationHistory.isExecuting;
}

/**
 * Set calculation executing state
 */
export function setCalculationExecuting(executing: boolean): void {
  calculationHistory.isExecuting = executing;
}