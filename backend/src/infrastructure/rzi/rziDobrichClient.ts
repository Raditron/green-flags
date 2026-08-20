import { WaterQualitySample } from "../../domain/waterQualitySample";
import { RziRegionClient } from "./rziRegionClient";

/**
 * RZI Dobrich (Golden Sands' northern edge, Albena, Kranevo — per issue #122's original scope,
 * though live data shows RZI Varna's own PDF already covers Golden Sands and Kranevo/Sunny Day, see
 * rziZoneMapping.ts) has no working scraper yet. Live re-verification in this session (August 2026)
 * found a harder blocker than the format-uncertainty issue #122 flagged:
 *
 * - The old `rzi-dobrich.egov.bg/169-...` URL the original research cited does 404, as expected.
 * - The current site (`rzi-dobrich.egov.bg`, an IBM WebSphere Portal) does list per-zone profile
 *   documents at main-activities/public-health/swimming-zone/profil-vodi-kypane, but every
 *   `/wps/wcm/myconnect/.../<n>.+Profil+<zone>.doc` download link 302-redirects to
 *   `/wps/wcm/login` even with the full CACHEID query string and a cookie jar warmed from the
 *   listing page — the documents are gated behind portal authentication despite the listing page
 *   itself being public. (Separately, those profile docs looked like static per-zone descriptions
 *   rather than dated sample tables anyway, based on their filenames.)
 * - No results table, news post, or other public page with actual dated MPN/100cm³ readings was
 *   found under the site's "Зони за къпане" section (which only offers "Табели плажове" and the
 *   gated "Профил води за къпане").
 *
 * Building this needs a fresh source-of-truth for RZI Dobrich specifically — a public results page
 * this session didn't find, a different access path for the gated documents, or accepting these
 * beaches stay uncovered by the water-quality rating. See issue #122's follow-up.
 */
export class RziDobrichClient implements RziRegionClient {
  async fetchLatestSamplesByZone(): Promise<Map<string, WaterQualitySample>> {
    throw new Error(
      "RziDobrichClient is not implemented: RZI Dobrich's per-zone documents are gated behind a portal " +
        "login and no public results table was found — see this file's class doc for what was checked."
    );
  }
}
