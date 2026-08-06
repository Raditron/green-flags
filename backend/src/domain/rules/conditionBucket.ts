/**
 * A condition bucket groups hours with the same Beaufort force and Douglas sea state, the two
 * scales already legally-recognized for Bulgarian rescue stations (see
 * .scratch/green-flags-mvp/issues/09-rule-engine-threshold-standard.md), so calibration doesn't
 * need to invent new wind/wave range bins.
 */
export function deriveConditionBucketKey(beaufortForce: number, douglasSeaState: number): string {
  return `beaufort-${beaufortForce}_douglas-${douglasSeaState}`;
}
