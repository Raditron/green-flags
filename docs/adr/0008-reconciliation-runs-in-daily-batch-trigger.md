# Prediction reconciliation runs inside the existing daily batch trigger, not a separate schedule

Once Predictions are stored per-lead, something needs to grade each date's closed-out Predictions
against what actually happened, once a day. The existing GitHub Actions cron already calls
`POST /api/batch` once daily at 04:00 UTC — comfortably after the previous day's legal window
(09:00-18:30) has closed and any reports for it have stopped arriving, and before the current day's
window opens. That's already the right checkpoint; nothing about reconciliation's timing needs it
to run separately.

We deliberately did not give reconciliation its own scheduled workflow or endpoint. This project
runs on an explicit $10-25/month budget with a stated preference for minimal moving infrastructure
(see `.scratch/green-flags-mvp/issues/03-bulgarian-coast-weather-apis.md` and
`05-cost-effective-tech-stack.md`); a second cron job, secret, and endpoint would be ongoing
operational surface bought for a timing requirement the existing trigger already satisfies for free.
`runDailyBatch` reconciles yesterday's closed-out Predictions as its first step, before fetching and
storing today's fresh rolling window.
