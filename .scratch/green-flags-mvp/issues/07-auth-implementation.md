# Auth implementation approach

Type: grilling
Status: resolved

## Question

Registered accounts are required to submit feedback (viewing stays anonymous). What's the concrete auth approach for the MVP — email/password, magic link, or OAuth (Google, etc.) — weighing signup friction against cost and the abuse-resistance mechanics from [Feedback and abuse-resistance mechanics](04-feedback-abuse-resistance.md)?

## Answer

**Method: Firebase Authentication, email/password, single method for MVP.** No OAuth or magic-link option at launch — offering a choice of signup paths is standard practice but each one is its own maintenance surface (password reset flows, email deliverability, OAuth consent screens), and this project has consistently picked the cheapest option that clears the bar over covering every base. Adding a second signup path later is low-risk since [Feedback and abuse-resistance mechanics](04-feedback-abuse-resistance.md)'s rate limit keys off `user_id`, not the method used to obtain one.

**Email verification is required before a user can submit feedback (not before signup).** Viewing stays anonymous regardless, per the map. Firebase's default email/password signup does not require a verified inbox, so without this gate the account-creation cost stays "type any string" — which defeats the point of Ticket 04's one-report-per-account-per-beach-per-day cap. Requiring `emailVerified` before the *first feedback submission* raises that cost to "control an inbox," which is the actual Sybil-resistance lever Ticket 04 was waiting on this ticket to supply.

**No additional signup-level throttling (IP rate limit, CAPTCHA, Firebase App Check) for MVP.** Disposable-inbox services mean email verification alone doesn't stop a determined scripted attacker, but this ships verification-only and defers further hardening — matching the same "ship a placeholder, retune post-launch against real abuse data" pattern Ticket 04 already set with κ. **Flagged for reconsideration if abuse is actually observed post-launch**, same as κ.

**User data model: mirrored `users` collection in MongoDB Atlas, keyed by Firebase UID, created lazily on first authenticated request.** The backend verifies the Firebase ID token per-request via the Firebase Admin SDK and uses the UID to find/create the Mongo user document. This is the natural place to hang feedback-cap uniqueness constraints and the moderation/ban mechanics the map still lists as an open fog item — retrofitting that onto a bare Firebase-UID foreign key later would be more painful than starting with the collection now.

**Cost:** Firebase Authentication's email/password provider is unlimited on the free Spark plan — $0/month, no quota. This adds nothing to the $10-25/mo ceiling, leaving the full budget for hosting per [Cost-effective tech stack and hosting](05-cost-effective-tech-stack.md).
