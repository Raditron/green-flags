/**
 * Classifies a non-negative value against a scale's ordered upper bounds, returning the index
 * of the first bound the value doesn't exceed (or one past the last bound, if it exceeds all).
 * Shared by beaufortScale.ts and douglasSeaState.ts, whose lookup shape is otherwise identical.
 */
export function classifyByUpperBounds(value: number, upperBounds: number[], valueLabel: string): number {
  if (value < 0) {
    throw new Error(`${valueLabel} must not be negative, got ${value}`);
  }

  const index = upperBounds.findIndex((upperBound) => value <= upperBound);
  return index === -1 ? upperBounds.length : index;
}
