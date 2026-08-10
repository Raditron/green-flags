import { BeachAreas } from "../../domain/ports/beachRepository";
import { BeachSeed } from "./beachSeedData";

/**
 * Beaches named in the Ministry of Tourism's unguarded-beach order (Заповед № Т-РД-16-221/
 * 13.07.2026, Приложение 1, plus the standing Приложение 2 "природосъобразен туризъм" list) that
 * do NOT exact-match any entry in beachSeedData.ts — that list is curated at whole-resort
 * granularity, while the ministry order names individual beach segments within each resort (e.g.
 * 15 separately-named beaches within Varna municipality alone). Five order entries — Shabla,
 * Elenite, Irakli, Rezovo, and Durankulak (inferred rather than exact-matched; see the isUnguarded
 * comment on Durankulak in beachSeedData.ts) — were flagged isUnguarded on their existing
 * beachSeedData.ts entries instead of duplicated here; see seedUnguardedBeaches.ts.
 *
 * lat/long here are coarse interpolations along the coastline from nearby known beach-center
 * coordinates (same beach-center-approximation approach as beachSeedData.ts) — NOT geocoded or
 * survey-verified per beach, since no authoritative per-beach coordinate source exists for most of
 * these. Treat as good enough for Open-Meteo's model-grid resolution and rough map placement only;
 * flagged for founder spot-check before relying on any single one, more so than the original 32.
 *
 * order values are fractional, interleaved between the integer orders in beachSeedData.ts, so the
 * combined list still reads north to south without renumbering the existing 32 beaches.
 */
export const UNGUARDED_BEACH_SEED_DATA: BeachSeed[] = [
  // --- Община Шабла (Приложение 1, rows 1-10) ---
  { id: "durankulak-north-1", name: "Durankulak North 1", lat: 43.687, long: 28.561, order: 0.01, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "durankulak-north-2", name: "Durankulak North 2", lat: 43.69, long: 28.5615, order: 0.02, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "durankulak-lake", name: "Durankulak Lake", lat: 43.679, long: 28.556, order: 0.03, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "kosmos", name: "Kosmos", lat: 43.65, long: 28.567, order: 0.5, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "krapets-north", name: "Krapets North (part)", lat: 43.618, long: 28.571, order: 1.01, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "krapets-central", name: "Krapets Central", lat: 43.613, long: 28.57, order: 1.02, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "krapets-south", name: "Krapets South", lat: 43.608, long: 28.568, order: 1.03, onshoreWindDirectionDeg: 60, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "dobrudzha-north", name: "Dobrudzha North 1 & 2", lat: 43.515, long: 28.548, order: 2.01, onshoreWindDirectionDeg: 65, area: BeachAreas.Shabla, isUnguarded: true },
  { id: "dobrudzha-south", name: "Dobrudzha South (part)", lat: 43.505, long: 28.546, order: 2.02, onshoreWindDirectionDeg: 65, area: BeachAreas.Shabla, isUnguarded: true },

  // --- Община Каварна (rows 11-13) ---
  {
    id: "rusalka",
    name: "Rusalka",
    lat: 43.4658,
    long: 28.3945,
    quirkNotes: "Combined listing: Rusalka small/large beach, slipway, kayak, central, and baby-beach outposts",
    order: 4.01,
    onshoreWindDirectionDeg: 70,
    area: BeachAreas.Kavarna,
    isUnguarded: true,
  },
  { id: "tauk-liman", name: "Tauk Liman", lat: 43.427, long: 28.335, order: 4.02, onshoreWindDirectionDeg: 70, area: BeachAreas.Kavarna, isUnguarded: true },
  { id: "bolata", name: "Bolata", lat: 43.386, long: 28.402, order: 5.01, onshoreWindDirectionDeg: 70, area: BeachAreas.Kavarna, isUnguarded: true },

  // --- Община Балчик (rows 14-17) ---
  { id: "tuzlata", name: "Tuzlata", lat: 43.44, long: 28.142, order: 6.01, onshoreWindDirectionDeg: 70, area: BeachAreas.Balchik, isUnguarded: true },
  { id: "srebarnia-bryag", name: "Srebarnia Bryag (Silvery Coast)", lat: 43.41, long: 28.18, order: 6.02, onshoreWindDirectionDeg: 70, area: BeachAreas.Balchik, isUnguarded: true },
  { id: "robinzon-2", name: "Robinson 2", lat: 43.4, long: 28.19, order: 6.03, onshoreWindDirectionDeg: 70, area: BeachAreas.Balchik, isUnguarded: true },
  { id: "fish-fish-new", name: "Fish Fish New", lat: 43.395, long: 28.2, order: 6.04, onshoreWindDirectionDeg: 70, area: BeachAreas.Balchik, isUnguarded: true },

  // --- Община Варна (rows 18-32) ---
  { id: "chaika-central-2", name: "Chaika Central 2", lat: 43.242, long: 27.988, order: 10.5, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "chaika-central-1", name: "Chaika Central 1", lat: 43.24, long: 27.987, order: 10.51, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "chaika-south", name: "Chaika South", lat: 43.235, long: 27.985, order: 10.52, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "mineral-pool-south", name: "Mineral Pool South", lat: 43.2, long: 27.93, order: 11.01, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "euxinograd-1", name: "Euxinograd 1", lat: 43.215, long: 27.995, order: 11.02, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "euxinograd-2", name: "Euxinograd 2", lat: 43.213, long: 27.99, order: 11.03, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "euxinograd-3", name: "Euxinograd 3", lat: 43.21, long: 27.987, order: 11.04, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "ofitserski", name: "Ofitserski (Officers')", lat: 43.205, long: 27.985, order: 11.05, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "galata-north", name: "Galata North", lat: 43.178, long: 27.928, order: 11.06, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "galata-east", name: "Galata East", lat: 43.175, long: 27.93, order: 11.07, onshoreWindDirectionDeg: 75, area: BeachAreas.Varna, isUnguarded: true },
  { id: "fichoza-north", name: "Fichoza North", lat: 43.155, long: 27.95, order: 11.08, onshoreWindDirectionDeg: 85, area: BeachAreas.Varna, isUnguarded: true },
  { id: "fichoza", name: "Fichoza", lat: 43.145, long: 27.952, order: 11.09, onshoreWindDirectionDeg: 85, area: BeachAreas.Varna, isUnguarded: true },
  { id: "fichoza-south", name: "Fichoza South", lat: 43.135, long: 27.95, order: 11.1, onshoreWindDirectionDeg: 85, area: BeachAreas.Varna, isUnguarded: true },
  { id: "hizha-chernomorets-north", name: "Hizha Chernomorets North", lat: 43.12, long: 27.945, order: 11.11, onshoreWindDirectionDeg: 85, area: BeachAreas.Varna, isUnguarded: true },
  { id: "pasha-dere", name: "Pasha Dere", lat: 43.1, long: 27.94, order: 11.12, onshoreWindDirectionDeg: 85, area: BeachAreas.Varna, isUnguarded: true },

  // --- Община Аврен (rows 33-34) ---
  { id: "romantika", name: "Romantika", lat: 43.065, long: 27.92, order: 11.5, onshoreWindDirectionDeg: 85, area: BeachAreas.Avren, isUnguarded: true },
  { id: "kamchia-north", name: "Kamchia North 1, 2, 4 & 5", lat: 43.055, long: 27.89, order: 11.6, onshoreWindDirectionDeg: 87, area: BeachAreas.Avren, isUnguarded: true },

  // --- Община Долни Чифлик (rows 35-37) ---
  { id: "kamchia-south", name: "Kamchia South", lat: 43.04, long: 27.885, order: 11.7, onshoreWindDirectionDeg: 88, area: BeachAreas.DolniChiflik, isUnguarded: true },
  { id: "izgrev-horizont", name: "Izgrev-Horizont", lat: 43.0, long: 27.88, order: 11.8, onshoreWindDirectionDeg: 89, area: BeachAreas.DolniChiflik, isUnguarded: true },
  { id: "shkorpilovtsi-north", name: "Shkorpilovtsi North", lat: 42.95, long: 27.885, order: 11.9, onshoreWindDirectionDeg: 90, area: BeachAreas.DolniChiflik, isUnguarded: true },

  // --- Община Бяла (rows 38-42, plus Приложение 2 "Бяла - Карадере") ---
  { id: "byala-north", name: "Byala North", lat: 42.89, long: 27.88, order: 12.01, onshoreWindDirectionDeg: 90, area: BeachAreas.Byala, isUnguarded: true },
  { id: "byala-central-1", name: "Byala Central I", lat: 42.88, long: 27.875, order: 12.02, onshoreWindDirectionDeg: 90, area: BeachAreas.Byala, isUnguarded: true },
  { id: "byala-central-3", name: "Byala Central III", lat: 42.877, long: 27.874, order: 12.03, onshoreWindDirectionDeg: 90, area: BeachAreas.Byala, isUnguarded: true },
  { id: "byala-central-4", name: "Byala Central IV", lat: 42.875, long: 27.873, order: 12.04, onshoreWindDirectionDeg: 90, area: BeachAreas.Byala, isUnguarded: true },
  { id: "byala-chaika", name: "Byala Chaika", lat: 42.87, long: 27.87, order: 12.05, onshoreWindDirectionDeg: 90, area: BeachAreas.Byala, isUnguarded: true },
  {
    id: "byala-karadere",
    name: "Byala Karadere",
    lat: 42.92,
    long: 27.83,
    quirkNotes: "Приложение 2 (nature-friendly tourism beach), not Приложение 1 — same practical no-lifeguard effect",
    order: 12.5,
    onshoreWindDirectionDeg: 90,
    area: BeachAreas.Byala,
    isUnguarded: true,
  },

  // --- Община Несебър (rows 43-46, 48-50) ---
  { id: "smrikite", name: "Smrikite", lat: 42.685, long: 27.745, order: 16.01, onshoreWindDirectionDeg: 100, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "elenite-east", name: "Elenite East 1 & 2", lat: 42.705, long: 27.755, order: 15.01, onshoreWindDirectionDeg: 100, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "kozluka", name: "Kozluka", lat: 42.66, long: 27.73, order: 18.01, onshoreWindDirectionDeg: 110, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "robinzon-west-2", name: "Robinson West 2", lat: 42.658, long: 27.732, order: 18.02, onshoreWindDirectionDeg: 110, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "nessebar-east", name: "Nessebar East", lat: 42.657, long: 27.738, order: 18.03, onshoreWindDirectionDeg: 110, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "emona-south", name: "Emona South", lat: 42.64, long: 27.72, order: 19.01, onshoreWindDirectionDeg: 115, area: BeachAreas.Nessebar, isUnguarded: true },
  { id: "emona-bunardzhika", name: "Emona Bunardzhika", lat: 42.638, long: 27.722, order: 19.02, onshoreWindDirectionDeg: 115, area: BeachAreas.Nessebar, isUnguarded: true },

  // --- Община Поморие (rows 51-56) ---
  { id: "aheloy-north", name: "Aheloy North", lat: 42.655, long: 27.655, order: 19.5, onshoreWindDirectionDeg: 115, area: BeachAreas.Pomorie, isUnguarded: true },
  { id: "camping-aheloy", name: "Camping Aheloy (excl. part 3)", lat: 42.65, long: 27.65, order: 19.51, onshoreWindDirectionDeg: 115, area: BeachAreas.Pomorie, isUnguarded: true },
  { id: "pomorie-spit", name: "Pomorie Spit", lat: 42.565, long: 27.625, order: 20.01, onshoreWindDirectionDeg: 120, area: BeachAreas.Pomorie, isUnguarded: true },
  { id: "pomorie-bunata", name: "Pomorie Bunata", lat: 42.555, long: 27.64, order: 20.02, onshoreWindDirectionDeg: 120, area: BeachAreas.Pomorie, isUnguarded: true },
  { id: "camping-europa", name: "Camping Europa", lat: 42.54, long: 27.63, order: 20.03, onshoreWindDirectionDeg: 120, area: BeachAreas.Pomorie, isUnguarded: true },
  { id: "lahana-1", name: "Lahana 1", lat: 42.52, long: 27.605, order: 20.04, onshoreWindDirectionDeg: 120, area: BeachAreas.Pomorie, isUnguarded: true },

  // --- Община Бургас (rows 57-67) ---
  { id: "sarafovo-north", name: "Sarafovo North", lat: 42.51, long: 27.515, order: 20.9, onshoreWindDirectionDeg: 130, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "atanasovska-kosa", name: "Atanasovska Spit (part 2)", lat: 42.5, long: 27.5, order: 20.91, onshoreWindDirectionDeg: 130, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "kraymorie-north-1", name: "Kraymorie North 1", lat: 42.44, long: 27.535, order: 21.5, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "kraymorie-north-2", name: "Kraymorie North 2", lat: 42.435, long: 27.533, order: 21.51, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "kraymorie-north-3", name: "Kraymorie North 3", lat: 42.43, long: 27.53, order: 21.52, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "kraymorie-south", name: "Kraymorie South 1 & 2", lat: 42.42, long: 27.545, order: 21.53, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "otmanli", name: "Otmanli", lat: 42.415, long: 27.55, order: 21.55, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "rosenets", name: "Rosenets", lat: 42.4, long: 27.57, order: 21.6, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "rosenets-west", name: "Rosenets West", lat: 42.398, long: 27.565, order: 21.61, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "rosenets-central", name: "Rosenets Central", lat: 42.395, long: 27.57, order: 21.62, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },
  { id: "rosenets-east", name: "Rosenets East", lat: 42.392, long: 27.575, order: 21.63, onshoreWindDirectionDeg: 140, area: BeachAreas.Burgas, isUnguarded: true },

  // --- Община Созопол (rows 68-69) ---
  { id: "vromos", name: "Vromos", lat: 42.39, long: 27.66, order: 22.01, onshoreWindDirectionDeg: 130, area: BeachAreas.Sozopol, isUnguarded: true },
  { id: "alepu", name: "Alepu", lat: 42.4, long: 27.68, order: 22.02, onshoreWindDirectionDeg: 130, area: BeachAreas.Sozopol, isUnguarded: true },

  // --- Община Приморско (rows 70-71) ---
  { id: "arkutino", name: "Arkutino (Water Lilies)", lat: 42.3, long: 27.73, order: 24.5, onshoreWindDirectionDeg: 112, area: BeachAreas.Primorsko, isUnguarded: true },
  { id: "ropotamo", name: "Ropotamo", lat: 42.29, long: 27.725, order: 24.51, onshoreWindDirectionDeg: 112, area: BeachAreas.Primorsko, isUnguarded: true },

  // --- Община Царево (rows 72-90, plus Приложение 2 "Корал") ---
  { id: "lozenets-south", name: "Lozenets South", lat: 42.185, long: 27.835, order: 27.01, onshoreWindDirectionDeg: 110, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "malak-oazis", name: "Malak Oazis 1-4", lat: 42.18, long: 27.84, order: 27.02, onshoreWindDirectionDeg: 115, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "malak-oazis-zone", name: "Malak Oazis Zone 1, 2 & 4 Central-East", lat: 42.178, long: 27.842, order: 27.03, onshoreWindDirectionDeg: 115, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "tsarevo-north", name: "Tsarevo North 1-3", lat: 42.175, long: 27.845, order: 28.01, onshoreWindDirectionDeg: 120, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "popski-plazh-north", name: "Popski Plazh North 1-5", lat: 42.172, long: 27.848, order: 28.02, onshoreWindDirectionDeg: 120, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "tsarevo-central", name: "Tsarevo Central", lat: 42.165, long: 27.852, order: 28.03, onshoreWindDirectionDeg: 120, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "tsarevo-vasiliko", name: "Tsarevo Vasiliko", lat: 42.16, long: 27.855, order: 28.04, onshoreWindDirectionDeg: 120, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "skalite", name: "Skalite (The Rocks)", lat: 42.15, long: 27.86, order: 28.05, onshoreWindDirectionDeg: 120, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "lafina-north", name: "Lafina North 1", lat: 42.135, long: 27.875, order: 28.06, onshoreWindDirectionDeg: 125, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "manastirich", name: "Manastirich", lat: 42.125, long: 27.885, order: 28.07, onshoreWindDirectionDeg: 125, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "varvara-north", name: "Varvara North", lat: 42.115, long: 27.895, order: 28.08, onshoreWindDirectionDeg: 125, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "ahtopol-lighthouse", name: "Ahtopol Lighthouse", lat: 42.1, long: 27.935, order: 30.01, onshoreWindDirectionDeg: 125, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "ahtopol-north-west", name: "Ahtopol North West Zone", lat: 42.095, long: 27.925, order: 30.02, onshoreWindDirectionDeg: 125, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "listi", name: "Listi", lat: 42.04, long: 27.975, order: 29.01, onshoreWindDirectionDeg: 130, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "silistar-north", name: "Silistar North", lat: 42.03, long: 27.99, order: 29.5, onshoreWindDirectionDeg: 130, area: BeachAreas.Tsarevo, isUnguarded: true },
  {
    id: "koral",
    name: "Koral",
    lat: 42.045,
    long: 27.965,
    quirkNotes: "Приложение 2 (nature-friendly tourism beach), not Приложение 1 — same practical no-lifeguard effect",
    order: 29.6,
    onshoreWindDirectionDeg: 130,
    area: BeachAreas.Tsarevo,
    isUnguarded: true,
  },
  { id: "ayrodi-north", name: "Ayrodi North", lat: 42.06, long: 27.95, order: 30.5, onshoreWindDirectionDeg: 128, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "ayrodi-south", name: "Ayrodi South", lat: 42.055, long: 27.955, order: 30.51, onshoreWindDirectionDeg: 128, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "lipite", name: "Lipite", lat: 42.05, long: 27.96, order: 30.52, onshoreWindDirectionDeg: 128, area: BeachAreas.Tsarevo, isUnguarded: true },
  { id: "rezovo-kastrich", name: "Rezovo Kastrich", lat: 42.01, long: 27.975, order: 31.01, onshoreWindDirectionDeg: 130, area: BeachAreas.Tsarevo, isUnguarded: true },
];
