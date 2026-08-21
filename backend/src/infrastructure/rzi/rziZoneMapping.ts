/** Which RZI region's client owns a zone code — codes are only unique within their own region's document. */
export type RziRegion = "varna" | "burgas";

export interface RziZoneMapping {
  region: RziRegion;
  zoneCodes: string[];
}

/**
 * Maps curated beaches (beachSeedData.ts, by id) to their RZI monitoring zone(s), built by matching
 * zone names against beach names in RZI Varna's live `mvodi-2026.pdf` (23 zones, Golden Sands through
 * Byala) and RZI Burgas's live `tablici-monitoring-more-mz-202608.xls` (49 zones, Obzor through
 * Sinemorets) — see issue #122. Verified August 2026; re-check zone names periodically since RZI
 * occasionally renumbers or renames zones between years.
 *
 * Matching rule: a beach gets every zone whose name shares the beach's own resort/town identifier
 * (e.g. all "Слънчев бряг" zones -> sunny-beach-central), *except* Varna Central Beach and Burgas
 * Central Beach specifically — those two seed beaches represent only the named "Централен плаж" of
 * their city, not the whole city's coastline (their id/name says "Central", unlike e.g. "Chernomorets"
 * or "Sozopol", which stand for the whole town in beachSeedData) — so only the exact "Централен"
 * zone is included for those two, leaving that city's other, differently-named zones (e.g. Varna's
 * Офицерски плаж, Южен плаж; Burgas's Сарафово, Крайморие) unmapped rather than guessed into the
 * wrong beach.
 *
 * Beaches not listed here get `null` from RziWaterQualityProvider — either genuinely outside both
 * regions' coverage (Durankulak through Kavarna/Balchik, and Albena, are RZI Dobrich territory; south
 * of Ahtopol/Sinemorets isn't covered by any RZI region site found so far) or a beach whose seed entry
 * doesn't correspond to any single zone name closely enough to be confident (e.g. Varna's own Южен
 * плаж/Бриз-3/Офицерски zones have no matching curated beach at all, so they're simply unused).
 *
 * Resolves 2 of issue #122's flagged "coordinate mismatches worth re-verifying": Irakli matches zone
 * 02047 by exact name ("Плаж \"Иракли\""), and Kranevo/Sunny Day matches Varna zone 03005 ("КК
 * \"Слънчев ден-Сахара\"") rather than needing RZI Dobrich as the original ticket assumed.
 */
export const BEACH_TO_RZI_ZONES: Record<string, RziZoneMapping> = {
  "golden-sands": { region: "varna", zoneCodes: ["03001", "03002", "03003", "03004"] },
  "kranevo-sunny-day": { region: "varna", zoneCodes: ["03005"] },
  "sveti-konstantin-i-elena": { region: "varna", zoneCodes: ["03006", "03007", "03008", "03009"] },
  "varna-central-beach": { region: "varna", zoneCodes: ["03012"] },
  byala: { region: "varna", zoneCodes: ["03020", "03021", "03022", "03023"] },

  obzor: { region: "burgas", zoneCodes: ["02001", "02002"] },
  elenite: { region: "burgas", zoneCodes: ["02003"] },
  "sveti-vlas": { region: "burgas", zoneCodes: ["02004", "02005"] },
  "sunny-beach-central": { region: "burgas", zoneCodes: ["02006", "02007", "02008"] },
  "nessebar-south-beach": { region: "burgas", zoneCodes: ["02009"] },
  ravda: { region: "burgas", zoneCodes: ["02010", "02011", "02012"] },
  pomorie: { region: "burgas", zoneCodes: ["02014", "02015", "02016"] },
  "burgas-central-beach": { region: "burgas", zoneCodes: ["02020"] },
  chernomorets: { region: "burgas", zoneCodes: ["02022", "02023", "02024"] },
  sozopol: { region: "burgas", zoneCodes: ["02025", "02026", "02027"] },
  dyuni: { region: "burgas", zoneCodes: ["02029", "02030"] },
  primorsko: { region: "burgas", zoneCodes: ["02032", "02033", "02034"] },
  kiten: { region: "burgas", zoneCodes: ["02035", "02036"] },
  lozenets: { region: "burgas", zoneCodes: ["02037", "02046"] },
  tsarevo: { region: "burgas", zoneCodes: ["02038", "02039", "02040", "02041", "02042"] },
  ahtopol: { region: "burgas", zoneCodes: ["02043"] },
  sinemorets: { region: "burgas", zoneCodes: ["02044", "02045", "02048"] },
  irakli: { region: "burgas", zoneCodes: ["02047"] },
};
