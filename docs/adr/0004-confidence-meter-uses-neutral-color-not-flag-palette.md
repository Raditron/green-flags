# Confidence meter uses a neutral color scale, not the red/yellow/green flag palette

The per-hour confidence indicator on the beach detail page is being redesigned
from a plain sentence into a horizontal meter bar. The obvious choice would
be to fill it using the same `--flag-red` / `--flag-yellow` / `--flag-green`
tokens already used for water-safety flags elsewhere in the app, since
they're right there and already theme-aware.

We're deliberately not doing that. Confidence percent measures how much data
backs a prediction (basis: certain / blended-from-reports / no-reports-yet);
it says nothing about whether the water is safe. A low-confidence reading
filled in flag-red would read as a safety warning, when the actual flag color
for that hour might be green. The meter fill uses a neutral blue drawn from
the existing brand palette (`colors.blue`) instead, so "how much do we know"
stays visually distinct from "is it safe to swim" — the two signals the page
already renders side by side (meter vs. the hour's flag-colored timeline
segment) would otherwise collide.
