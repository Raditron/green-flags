import { connectToDatabase } from "./infrastructure/db/mongoClient";
import { MongoHealthcheckRepository } from "./infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "./infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "./infrastructure/repositories/mongoPredictionRepository";
import { MongoReportRepository } from "./infrastructure/repositories/mongoReportRepository";
import { MongoUserRepository } from "./infrastructure/repositories/mongoUserRepository";
import { OpenMeteoForecastClient } from "./infrastructure/openMeteo/openMeteoForecastClient";
import { MeteoalarmStormWarningClient } from "./infrastructure/meteoalarm/meteoalarmStormWarningClient";
import { initializeFirebaseAdminApp } from "./infrastructure/firebase/firebaseAdminApp";
import { FirebaseAdminAuthVerifier } from "./infrastructure/firebase/firebaseAdminAuthVerifier";
import { AppDependencies } from "./presentation/app";

export interface CompositionConfig {
  mongoUri: string;
  mongoDbName: string;
  batchTriggerSecret: string;
  firebaseServiceAccount: string;
}

/** Maps every domain port to its concrete infrastructure adapter. Does not build the Express app — see `presentation/app.ts`. */
export async function buildDependencies(config: CompositionConfig): Promise<AppDependencies> {
  const { db } = await connectToDatabase(config.mongoUri, config.mongoDbName);
  const firebaseApp = initializeFirebaseAdminApp(config.firebaseServiceAccount);

  return {
    healthcheckRepository: new MongoHealthcheckRepository(db),
    beachRepository: new MongoBeachRepository(db),
    predictionRepository: new MongoPredictionRepository(db),
    reportRepository: new MongoReportRepository(db),
    userRepository: new MongoUserRepository(db),
    forecastProvider: new OpenMeteoForecastClient(),
    stormWarningProvider: new MeteoalarmStormWarningClient(),
    authTokenVerifier: new FirebaseAdminAuthVerifier(firebaseApp),
    batchTriggerSecret: config.batchTriggerSecret,
  };
}
