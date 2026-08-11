/**
 * Hand-maintained beachId -> raw source photo path map.
 *
 * This is the single source of truth for "which raw photo belongs to which
 * beach id" — it replaces the old hand-written `import` list that used to
 * live directly in `index.ts`. Paths are relative to this directory
 * (`frontend/src/shared/data/images/`).
 *
 * `frontend/scripts/prepare-images.mjs` reads this file to know which raw
 * files to dedupe/compress/resize, and writes `generated/manifest.ts`
 * (fully generated — do not hand-edit) which `index.ts` consumes to build
 * the responsive image descriptor lookup (`getBeachImage`).
 *
 * To add a new beach photo: drop the raw file under `images/<area>/`, add
 * one line here, then run `npm run images:prepare` and commit the generated
 * output. See IMAGE_SOURCES.md for the full process and photo provenance.
 *
 * The first 16 entries are curated photos for the original guarded beaches.
 * The rest (grouped by BeachAreas, north to south) were sourced from
 * free-license Wikimedia Commons photos via download-missing-images.sh — see
 * IMAGE_SOURCES.md in this directory for the source URL and license of every
 * one of them. Many ids within the same coastline stretch intentionally
 * share one representative photo (no distinct published photography exists
 * for each individual wild-beach segment) — those ids simply repeat the same
 * path below, and the pipeline collapses them to one canonical asset.
 */
export const BEACH_PHOTO_SOURCES: Record<string, string> = {
  "varna-central-beach": "varna/varna-central-beach.png",
  "golden-sands": "varna/golden-sands.png",
  albena: "balchik/albena.png",
  "kranevo-sunny-day": "balchik/kranevo.png",
  byala: "byala/byala.png",
  obzor: "nessebar/obzor.png",
  irakli: "nessebar/irakli.png",
  "sveti-vlas": "nessebar/sveti-vlas.png",
  "sunny-beach-central": "nessebar/sunny-beach-central.png",
  "nessebar-south-beach": "nessebar/nessebar-south-beach.png",
  pomorie: "pomorie/pomorie.png",
  "burgas-central-beach": "burgas/burgas-central-beach.png",
  sozopol: "sozopol/sozopol-central-beach.png",
  primorsko: "primorsko/primorsko.png",
  kiten: "primorsko/kiten.png",
  sinemorets: "tsarevo/sinemorets.png",

  // Shabla
  durankulak: "shabla/durankulak.jpg",
  krapets: "shabla/krapets.jpg",
  shabla: "shabla/shabla.jpg",
  tyulenovo: "shabla/tyulenovo.jpg",
  "durankulak-north-1": "shabla/durankulak-north-1.jpg",
  "durankulak-north-2": "shabla/durankulak-north-2.jpg",
  "durankulak-lake": "shabla/durankulak-lake.jpg",
  kosmos: "shabla/kosmos.jpg",
  "krapets-north": "shabla/krapets-north.jpg",
  "krapets-central": "shabla/krapets-central.jpg",
  "krapets-south": "shabla/krapets-south.jpg",
  "dobrudzha-north": "shabla/dobrudzha-north.jpg",
  "dobrudzha-south": "shabla/dobrudzha-south.jpg",
  // Kavarna
  kavarna: "kavarna/kavarna.jpg",
  kaliakra: "kavarna/kaliakra.jpg",
  rusalka: "kavarna/rusalka.jpg",
  "tauk-liman": "kavarna/tauk-liman.jpg",
  bolata: "kavarna/bolata.jpg",
  // Balchik
  balchik: "balchik/balchik.jpg",
  tuzlata: "balchik/tuzlata.jpg",
  "srebarnia-bryag": "balchik/srebarnia-bryag.jpg",
  "robinzon-2": "balchik/robinzon-2.jpg",
  "fish-fish-new": "balchik/fish-fish-new.jpg",
  // Varna
  "sveti-konstantin-i-elena": "varna/sveti-konstantin-i-elena.jpg",
  "chaika-central-2": "varna/chaika-central-2.jpg",
  "chaika-central-1": "varna/chaika-central-1.jpg",
  "chaika-south": "varna/chaika-south.jpg",
  "mineral-pool-south": "varna/mineral-pool-south.jpg",
  "euxinograd-1": "varna/euxinograd-1.jpg",
  "euxinograd-2": "varna/euxinograd-2.jpg",
  "euxinograd-3": "varna/euxinograd-3.jpg",
  ofitserski: "varna/ofitserski.jpg",
  "galata-north": "varna/galata-north.jpg",
  "galata-east": "varna/galata-east.jpg",
  "fichoza-north": "varna/fichoza-north.jpg",
  fichoza: "varna/fichoza.jpg",
  "fichoza-south": "varna/fichoza-south.jpg",
  "hizha-chernomorets-north": "varna/hizha-chernomorets-north.jpg",
  "pasha-dere": "varna/pasha-dere.jpg",
  // Avren
  romantika: "avren/romantika.jpg",
  "kamchia-north": "avren/kamchia-north.jpg",
  // Dolni Chiflik
  "kamchia-south": "dolni-chiflik/kamchia-south.jpg",
  "izgrev-horizont": "dolni-chiflik/izgrev-horizont.jpg",
  "shkorpilovtsi-north": "dolni-chiflik/shkorpilovtsi-north.jpg",
  // Byala
  "byala-north": "byala/byala-north.jpg",
  "byala-central-1": "byala/byala-central-1.jpg",
  "byala-central-3": "byala/byala-central-3.jpg",
  "byala-central-4": "byala/byala-central-4.jpg",
  "byala-chaika": "byala/byala-chaika.jpg",
  "byala-karadere": "byala/byala-karadere.jpg",
  // Nessebar
  elenite: "nessebar/elenite.jpg",
  ravda: "nessebar/ravda.jpg",
  smrikite: "nessebar/smrikite.jpg",
  "elenite-east": "nessebar/elenite-east.jpg",
  kozluka: "nessebar/kozluka.jpg",
  "robinzon-west-2": "nessebar/robinzon-west-2.jpg",
  "nessebar-east": "nessebar/nessebar-east.jpg",
  "emona-south": "nessebar/emona-south.jpg",
  "emona-bunardzhika": "nessebar/emona-bunardzhika.jpg",
  // Pomorie
  "aheloy-north": "pomorie/aheloy-north.jpg",
  "camping-aheloy": "pomorie/camping-aheloy.jpg",
  "pomorie-spit": "pomorie/pomorie-spit.jpg",
  "pomorie-bunata": "pomorie/pomorie-bunata.jpg",
  "camping-europa": "pomorie/camping-europa.jpg",
  "lahana-1": "pomorie/lahana-1.jpg",
  // Burgas
  "sarafovo-north": "burgas/sarafovo-north.jpg",
  "atanasovska-kosa": "burgas/atanasovska-kosa.jpg",
  "kraymorie-north-1": "burgas/kraymorie-north-1.jpg",
  "kraymorie-north-2": "burgas/kraymorie-north-2.jpg",
  "kraymorie-north-3": "burgas/kraymorie-north-3.jpg",
  "kraymorie-south": "burgas/kraymorie-south.jpg",
  otmanli: "burgas/otmanli.jpg",
  rosenets: "burgas/rosenets.jpg",
  "rosenets-west": "burgas/rosenets-west.jpg",
  "rosenets-central": "burgas/rosenets-central.jpg",
  "rosenets-east": "burgas/rosenets-east.jpg",
  // Sozopol
  chernomorets: "sozopol/chernomorets.jpg",
  dyuni: "sozopol/dyuni.jpg",
  vromos: "sozopol/vromos.jpg",
  alepu: "sozopol/alepu.jpg",
  // Primorsko
  arkutino: "primorsko/arkutino.jpg",
  ropotamo: "primorsko/ropotamo.jpg",
  // Tsarevo
  lozenets: "tsarevo/lozenets.jpg",
  tsarevo: "tsarevo/tsarevo.jpg",
  ahtopol: "tsarevo/ahtopol.jpg",
  rezovo: "tsarevo/rezovo.jpg",
  "lozenets-south": "tsarevo/lozenets-south.jpg",
  "malak-oazis": "tsarevo/malak-oazis.jpg",
  "malak-oazis-zone": "tsarevo/malak-oazis-zone.jpg",
  "tsarevo-north": "tsarevo/tsarevo-north.jpg",
  "popski-plazh-north": "tsarevo/popski-plazh-north.jpg",
  "tsarevo-central": "tsarevo/tsarevo-central.jpg",
  "tsarevo-vasiliko": "tsarevo/tsarevo-vasiliko.jpg",
  skalite: "tsarevo/skalite.jpg",
  "lafina-north": "tsarevo/lafina-north.jpg",
  manastirich: "tsarevo/manastirich.jpg",
  "varvara-north": "tsarevo/varvara-north.jpg",
  "ahtopol-lighthouse": "tsarevo/ahtopol-lighthouse.jpg",
  "ahtopol-north-west": "tsarevo/ahtopol-north-west.jpg",
  listi: "tsarevo/listi.jpg",
  "silistar-north": "tsarevo/silistar-north.jpg",
  koral: "tsarevo/koral.jpg",
  "ayrodi-north": "tsarevo/ayrodi-north.jpg",
  "ayrodi-south": "tsarevo/ayrodi-south.jpg",
  lipite: "tsarevo/lipite.jpg",
  "rezovo-kastrich": "tsarevo/rezovo-kastrich.jpg",
};
