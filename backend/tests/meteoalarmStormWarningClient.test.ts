import { afterEach, describe, expect, it, vi } from "vitest";
import { MeteoalarmStormWarningClient } from "../src/infrastructure/meteoalarm/meteoalarmStormWarningClient";

interface FixtureEntry {
  areaDesc: string;
  event: string;
  onset: string;
  expires: string;
}

function buildFeed(entries: FixtureEntry[]): string {
  const entryXml = entries
    .map(
      (entry) => `
  <entry>
    <cap:areaDesc>${entry.areaDesc}</cap:areaDesc>
    <cap:event>${entry.event}</cap:event>
    <cap:severity>Moderate</cap:severity>
    <cap:onset>${entry.onset}</cap:onset>
    <cap:expires>${entry.expires}</cap:expires>
    <title>Warning issued for Bulgaria - ${entry.areaDesc}</title>
  </entry>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:cap="urn:oasis:names:tc:emergency:cap:1.2">
  <id>tag:meteoalarm.org,2021-02-19:BG</id>
  <title>MeteoAlarm - Alerting Europe for Extreme Weather</title>
  <updated>2026-08-05T15:06:33.734086Z</updated>${entryXml}
</feed>`;
}

function stubFeed(xml: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(xml, { status: 200 }))
  );
}

describe("MeteoalarmStormWarningClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is inactive when the feed has no entries at all", async () => {
    stubFeed(buildFeed([]));
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T12:00:00Z"));

    expect(active).toBe(false);
  });

  it("is active for a coastal-area storm-category warning covering the current instant", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Varna", event: "Wind", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T12:00:00Z"));

    expect(active).toBe(true);
  });

  it("ignores warnings for non-coastal areas", async () => {
    stubFeed(
      buildFeed([
        {
          areaDesc: "Stara Zagora",
          event: "Wind",
          onset: "2026-08-05T10:00:00+00:00",
          expires: "2026-08-05T18:00:00+00:00",
        },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T12:00:00Z"));

    expect(active).toBe(false);
  });

  it("ignores non-storm event categories on the coast, e.g. a heat warning", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Burgas", event: "Hot!", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T12:00:00Z"));

    expect(active).toBe(false);
  });

  it("is inactive before the warning's onset", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Varna", event: "Thunderstorm", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T09:59:59.999Z"));

    expect(active).toBe(false);
  });

  it("is active exactly at the warning's onset boundary", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Varna", event: "Thunderstorm", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T10:00:00.000Z"));

    expect(active).toBe(true);
  });

  it("is active exactly at the warning's expiry boundary", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Varna", event: "Thunderstorm", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T18:00:00.000Z"));

    expect(active).toBe(true);
  });

  it("is inactive just after the warning's expiry", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Varna", event: "Thunderstorm", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T18:00:00.001Z"));

    expect(active).toBe(false);
  });

  it("handles a single-entry feed where the XML parser wouldn't naturally return an array", async () => {
    stubFeed(
      buildFeed([
        { areaDesc: "Dobrich", event: "Rain", onset: "2026-08-05T10:00:00+00:00", expires: "2026-08-05T18:00:00+00:00" },
      ])
    );
    const client = new MeteoalarmStormWarningClient();

    const active = await client.checkActiveStormWarning(new Date("2026-08-05T12:00:00Z"));

    expect(active).toBe(true);
  });
});
