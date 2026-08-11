import { XMLParser } from "fast-xml-parser";
import { StormWarningProvider } from "../../domain/ports/batch/stormWarningProvider";

const BULGARIA_CAP_FEED = "https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-bulgaria";

/** Bulgarian oblasti (provinces) touching the Black Sea coast — the ones this app's beaches sit in. */
const COASTAL_AREAS = new Set(["Varna", "Dobrich", "Burgas"]);

/** CAP `event` values that indicate a sea/coastal hazard, as opposed to e.g. a heat or cold warning. */
const STORM_EVENT_PATTERN = /wind|thunderstorm|rain|coastal|flood/i;

interface CapEntry {
  "cap:areaDesc": string;
  "cap:event": string;
  "cap:onset": string;
  "cap:expires": string;
}

interface CapFeed {
  feed?: {
    entry?: CapEntry[];
  };
}

const parser = new XMLParser({
  isArray: (tagName) => tagName === "entry",
});

/**
 * Checks Meteoalarm's free Bulgaria CAP/Atom feed for an active storm/severe-weather warning
 * covering the coast, per .scratch/green-flags-mvp/issues/03-bulgarian-coast-weather-apis.md —
 * Open-Meteo's own weathercodes are explicitly unreliable for thunderstorm detail outside Central
 * Europe, so this official government feed is the authoritative storm signal instead.
 */
export class MeteoalarmStormWarningClient implements StormWarningProvider {
  async checkActiveStormWarning(now: Date): Promise<boolean> {
    const response = await fetch(BULGARIA_CAP_FEED);

    if (!response.ok) {
      throw new Error(`Meteoalarm feed request failed with status ${response.status}`);
    }

    const xml = await response.text();
    const parsed = parser.parse(xml) as CapFeed;
    const entries = parsed.feed?.entry ?? [];

    return entries.some((entry) => this.isActiveCoastalStormWarning(entry, now));
  }

  private isActiveCoastalStormWarning(entry: CapEntry, now: Date): boolean {
    if (!COASTAL_AREAS.has(entry["cap:areaDesc"])) return false;
    if (!STORM_EVENT_PATTERN.test(entry["cap:event"])) return false;

    const onsetMs = new Date(entry["cap:onset"]).getTime();
    const expiresMs = new Date(entry["cap:expires"]).getTime();
    const nowMs = now.getTime();

    return nowMs >= onsetMs && nowMs <= expiresMs;
  }
}
