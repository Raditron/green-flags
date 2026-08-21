import { connectToDatabase } from "./infrastructure/db/mongoClient";
import { MongoHealthcheckRepository } from "./infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "./infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "./infrastructure/repositories/mongoPredictionRepository";
import { MongoSelfConsistencyRepository } from "./infrastructure/repositories/mongoSelfConsistencyRepository";
import { MongoReportRepository } from "./infrastructure/repositories/mongoReportRepository";
import { MongoUserRepository } from "./infrastructure/repositories/mongoUserRepository";
import { MongoCommentRepository } from "./infrastructure/repositories/mongoCommentRepository";
import { OpenMeteoForecastClient } from "./infrastructure/openMeteo/openMeteoForecastClient";
import { MeteoalarmStormWarningClient } from "./infrastructure/meteoalarm/meteoalarmStormWarningClient";
import { RziWaterQualityProvider } from "./infrastructure/rzi/rziWaterQualityProvider";
import { RziVarnaClient } from "./infrastructure/rzi/rziVarnaClient";
import { RziBurgasClient } from "./infrastructure/rzi/rziBurgasClient";
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
    selfConsistencyRepository: new MongoSelfConsistencyRepository(db),
    reportRepository: new MongoReportRepository(db),
    userRepository: new MongoUserRepository(db),
    commentRepository: new MongoCommentRepository(db),
    forecastProvider: new OpenMeteoForecastClient(),
    stormWarningProvider: new MeteoalarmStormWarningClient(),
    waterQualityProvider: new RziWaterQualityProvider({ varna: new RziVarnaClient(), burgas: new RziBurgasClient() }),
    authTokenVerifier: new FirebaseAdminAuthVerifier(firebaseApp),
    batchTriggerSecret: config.batchTriggerSecret,
  };
}
