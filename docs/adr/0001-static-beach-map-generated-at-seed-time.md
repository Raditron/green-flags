# Static beach map image generated once at seed time

The beach detail screen needed some visual/spatial anchor for a beach's
location, but the app is under a hard $0/mo infrastructure constraint and a
live map embed (tiles, an interactive map SDK) would introduce a
per-view-scaling dependency and a free-tier limit to track indefinitely. We
decided instead to call the Google Maps Static API exactly once per beach,
at founder-controlled beach-seeding time (User Story 15), and store the
resulting pin image as a static asset served from our own backend/DB rather
than fetched live from Google on each page view. Cost is bounded by beach
count at launch (16 one-time calls, ever) instead of by viewer traffic,
consistent with how the rest of the prediction pipeline is already
cost-flat. The trade-off: if a beach's coordinates or region framing ever
change, the static image must be manually regenerated — there is no live
sync.
