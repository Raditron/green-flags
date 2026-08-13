# Future days summarize to one worst-case hour, reduced in the frontend

Day Outlook (#83) needs to represent an entire future day — one that hasn't happened yet — as a
single flag color and confidence, the same way today's Timeline currently commits to one selected
hour at a time. The backend's Prediction contract stays hourly (`HourlyPrediction[]` per day, per
`docs/adr/0007-prediction-keyed-by-target-and-issued-date.md`); a day-level summary is a read-time
concern of a single screen, not a fact worth persisting or serving from `/api/beaches/:id/predictions`.

We reduce a day's `HourlyPrediction[]` to the single hour whose flag color is most severe
(red > yellow > green) among hours 9-18 inclusive — the same lifeguard-hours bound `legalWindow.ts`
already encodes for "today" — tie-breaking to the earliest qualifying hour, and pass that hour's
confidence, forecast/conditions fields, and hour number straight through unchanged. The reduction is
a pure frontend function (`worstCaseHour`), not a backend contract change.

We considered two alternatives and rejected both:

- **An average across the day's hours.** Averaging flag color has no sound definition (there's no
  midpoint between red and green), and averaging confidence would blur a single certain red hour
  into a falsely reassuring blended number — exactly the kind of collision ADR-0004 already avoids
  for confidence vs. flag color.
- **A fixed representative hour** (e.g. always noon, or always the legal window's midpoint). This
  would silently hide a real hazard sitting at a different hour of that day, which defeats the
  purpose of showing a future day's outlook at all — a visitor planning around a Day Outlook needs
  the worst case, not an arbitrary sample.

Worst-case-of-day also fails safe: it can only overstate risk for the day (by surfacing a red hour
that borders calmer ones), never understate it, which matches this app's existing bias toward
caution elsewhere (e.g. ADR-0008's reconciliation grading, ADR-0009's conservative confidence
blending). Doing the reduction in the frontend, rather than adding a "worst hour" field to the
backend's Prediction contract, keeps the backend's stored data at its full hourly resolution — useful
for Reconciliation and any future per-hour analysis — while letting the one screen that wants a
single number derive it on demand.
