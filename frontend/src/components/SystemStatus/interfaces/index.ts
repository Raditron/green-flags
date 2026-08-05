export interface HealthcheckResponse {
  status: "ok";
  pingCount: number;
  lastPingAt: string;
}
