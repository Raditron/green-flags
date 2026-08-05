import { HealthcheckRepository } from "../../domain/ports/healthcheckRepository";

export interface HealthcheckResult {
  status: "ok";
  pingCount: number;
  lastPingAt: string;
}

export async function runHealthcheck(repository: HealthcheckRepository): Promise<HealthcheckResult> {
  const { pingCount, lastPingAt } = await repository.recordPing();

  return {
    status: "ok",
    pingCount,
    lastPingAt: lastPingAt.toISOString(),
  };
}
