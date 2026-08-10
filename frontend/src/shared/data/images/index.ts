import albena from "./albena.png";
import burgasCentralBeach from "./burgas-central-beach.png";
import byala from "./byala.png";
import goldenSands from "./golden-sands.png";
import irakli from "./irakli.png";
import kiten from "./kiten.png";
import kranevo from "./kranevo.png";
import nessebarSouthBeach from "./nessebar-south-beach.png";
import obzor from "./obzor.png";
import pomorie from "./pomorie.png";
import primorsko from "./primorsko.png";
import sinemorets from "./sinemorets.png";
import sozopolCentralBeach from "./sozopol-central-beach.png";
import sunnyBeachCentral from "./sunny-beach-central.png";
import svetiVlas from "./sveti-vlas.png";
import varnaCentralBeach from "./varna-central-beach.png";

/**
 * Curated beach photos, keyed by beach id — the stable slug used for routing
 * and in the backend seed data (backend/src/infrastructure/seed/beachSeedData.ts),
 * as opposed to the human-readable `name` field which contains spaces/parens
 * and isn't a safe lookup key. Most filenames already match their id 1:1;
 * `kranevo-sunny-day` and `sozopol` are the two exceptions, mapped explicitly
 * below since the image files were named informally.
 */
export const BEACH_IMAGES: Record<string, string> = {
  "varna-central-beach": varnaCentralBeach,
  "golden-sands": goldenSands,
  albena,
  "kranevo-sunny-day": kranevo,
  byala,
  obzor,
  irakli,
  "sveti-vlas": svetiVlas,
  "sunny-beach-central": sunnyBeachCentral,
  "nessebar-south-beach": nessebarSouthBeach,
  pomorie,
  "burgas-central-beach": burgasCentralBeach,
  sozopol: sozopolCentralBeach,
  primorsko,
  kiten,
  sinemorets,
};

export function getBeachImage(beachId: string): string | undefined {
  return BEACH_IMAGES[beachId];
}
