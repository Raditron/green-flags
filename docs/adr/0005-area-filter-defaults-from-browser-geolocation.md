# Beach list's area filter and distance defaults come from client-side browser geolocation, not the backend

With all Bulgarian beaches now seeded, the beach list needs to default to the visitor's Area
instead of always showing every beach, and to show each beach's distance from the visitor.

We get both from `navigator.geolocation` in the browser and compute everything client-side: the
Detected Area is the Area of the *nearest beach* (by straight-line distance to the coordinates the
`/api/beaches` response already carries), only used as Selected Area's starting value if that
nearest beach is within 50 km — otherwise Selected Area starts as All Areas. Distance-to-beach
reuses that same distance function and is shown on every card whenever location is known,
independent of the 50 km cutoff. The permission prompt fires automatically on page load rather
than behind a "use my location" button, since a denied/ignored prompt costs nothing (graceful
fallback to All Areas) and an extra click would undercut the point of a smart default. Nothing is
persisted — every page load re-derives fresh.

We deliberately did **not** push distance/area calculation to the backend, even though the backend
already owns beach coordinates and Area. The formula is pure arithmetic needing nothing server-side
(no DB, no business rule); doing it server-side would mean sending the visitor's precise live
coordinates over the wire and into server logs on every beach-list fetch for a number the client
can produce locally, and would make the otherwise-identical-for-everyone `/api/beaches` response
per-visitor and harder to cache — for a ~100-beach list where server-side sort/pagination buys
nothing anyway.

We also considered IP-based geolocation (rejected: far too imprecise for bucketing into one of 13
municipalities along a narrow coastal strip) and reverse-geocoding coordinates via a third-party
service (rejected: adds an external dependency and a new failure mode when we already have a
serviceable set of reference points — the beaches themselves).
