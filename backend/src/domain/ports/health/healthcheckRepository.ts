export interface HealthcheckPingResult {
  pingCount: number;
  lastPingAt: Date;
}

export interface HealthcheckRepository {
  recordPing(): Promise<HealthcheckPingResult>;
}
