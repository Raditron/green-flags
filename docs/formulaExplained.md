# Formula, explained

Companion to [formula.md](./formula.md). Same order, same symbols. For each
step: *why this exists*, *why these numbers*, *what principle is being used*.

---

## Inputs

Just the raw readings everything else is built from — sensor/forecast data
plus one boolean (storm warning) and one derived fact (beach's onshore
bearing). Nothing conceptual here, just naming.

---

## 1. Beaufort force

**Why reuse the Beaufort scale?** We need to turn a raw wind speed into a
small number of ordinal categories a rule engine can reason about. Rather
than inventing thresholds, we reuse an existing WMO-standardized scale — its
categories already carry real-world meaning ("gale", "strong breeze").

**Why exactly `[0.2, 1.5, 3.3, ...]`?** These are the official WMO upper-bound
wind speeds (m/s) for Beaufort forces 0–11. Not tuned, just looked up.

**Principle — step function / bucketization:**
$$B(w) = \min\{\,i : w \le U^B_i\,\}$$
"Find the first bucket whose upper bound still covers w." Same idea as
`np.digitize`, or finding which income tax bracket a salary falls into. The
overflow clause (`12 if w > U^B_{11}`) just catches wind stronger than any
defined bucket.

**Q: in our case, what are the buckets?**
**A:** 13 buckets (B = 0 … 12), each one's upper bound taken straight from
$U^B$:

| B | Name | Wind speed (m/s) |
|---|---|---|
| 0 | Calm | ≤ 0.2 |
| 1 | Light air | ≤ 1.5 |
| 2 | Light breeze | ≤ 3.3 |
| 3 | Gentle breeze | ≤ 5.4 |
| 4 | Moderate breeze | ≤ 7.9 |
| 5 | Fresh breeze | ≤ 10.7 |
| 6 | Strong breeze | ≤ 13.8 |
| 7 | Near gale | ≤ 17.1 |
| 8 | Gale | ≤ 20.7 |
| 9 | Strong gale | ≤ 24.4 |
| 10 | Storm | ≤ 28.4 |
| 11 | Violent storm | ≤ 32.6 |
| 12 | Hurricane force | > 32.6 |

Worth noting for step 3 later: red needs B ≥ 6 (Strong breeze+), yellow needs
B ≥ 4 (Moderate breeze+).

---

## 2. Douglas sea state

**Why the same shape again?** Same problem (continuous → ordinal), same
solution (standardized scale, step function). This time the standard is the
Douglas sea state scale, and the constants `[0, 0.1, 0.5, 1.25, 2.5, 4, 6, 9,
14]` are *its* official boundaries (metres), from "calm/glassy" to
"phenomenal."

**Why $H = \max(H_{wind}, H_{swell})$ and not, say, the sum?** Sea danger is
governed by the *taller* wave train present, not by adding two wave systems
together (they don't stack that simply). This is a **worst-factor-governs**
choice, not an averaging one — you'll see it again in step 3.

---

## 3. Flag color

**What is this step doing?** Collapsing two ordinal hazard scores (B, D) and
one binary flag (S) into a single traffic-light decision.

**Principle — cascading threshold rule (worst-factor / precautionary logic):**
red is checked first, then yellow, then default green — and each tier fires
on **OR**, not on a weighted average.

**Why OR instead of averaging the factors?** In a safety system, one severe
factor (e.g. an active storm) shouldn't get diluted by other calm factors.
"Any one dangerous signal → escalate" is the precautionary principle; it's
why B ≥ 6 alone is enough for red even if D is low.

**Why B ≥ 6 / D ≥ 5 for red, B ≥ 4 / D ≥ 3 for yellow?** These are the
force/state levels that correspond to genuinely hazardous swimming conditions
in marine safety practice (strong-gale-and-up wind, rough-and-up seas) —
domain judgment applied on top of the standardized scales from steps 1–2.

---

## 4. Rip current risk

**Why a separate score from the flag?** Rip currents aren't caused by wind
strength or wave height alone — they're caused by a *combination* of wind
pushing water onshore, wave height, and wave period (long-period waves pump
more water toward shore per wave). None of B or D alone captures that.

**Onshore wind component — trigonometric projection:**
$$\alpha = \theta_w - \theta_b, \qquad u_{on} = \max(w\cos\alpha,\ 0)$$
This is a **vector projection**: $\cos\alpha$ projects the wind vector onto
the beach's onshore-facing axis, giving "how much of this wind is actually
blowing straight at the beach" rather than along it. The `max(..., 0)` floor
exists because offshore wind (α near 180°, cos negative) doesn't build rip
current risk — it can't contribute *negatively*, so it's clamped to zero
instead of being allowed to cancel other risk.

**Per-factor scoring, $\sigma(x; m, h)$:** the same step-function principle
from steps 1–2, but now a small reusable helper — score 0/1/2 depending on
whether a value is below-moderate, between-moderate-and-high, or above-high.

**Why sum three $\sigma$ scores instead of OR-ing them like the flag?**
Rip current formation is *cumulative* — each factor (wave height, period,
onshore push) contributes partial risk, and no single one is normally
sufficient by itself (unlike a storm warning, which alone justifies red).
So here the principle flips from "worst factor wins" to an **additive
point system**, capped by thresholds on the total ($R \ge 4$ → high, etc).

---

## 5. Distance prior

This step estimates *how confident we should be in the flag*, before any
historical or live data — based purely on how close the current reading sits
to a decision boundary.

**Core idea — margin to a threshold.** If wind is 5.3 m/s and yellow starts
at 5.4, we're basically on the fence; the flag could easily flip with the
next reading. If wind is 0.5 m/s, we're nowhere near a boundary and can be
confident. This is the same intuition as *margin* in a margin classifier
(e.g. SVM): distance from the decision boundary tracks how trustworthy the
decision is.

**Why reuse $U^B_3, U^B_5, U^D_2, U^D_4$?** Those are exactly the yellow/red
crossing points used by the flag rule in step 3 — the boundaries we're now
measuring distance to.

**Normalization — $d/2.0$ and $d/0.4$, clamped to 1:** raw distances (m/s,
metres) aren't comparable to each other, so each is scaled by "how many units
away counts as fully clear" for that variable, then capped at 1 so it reads
as a 0–1 confidence contribution. These scale constants define the width of
the "uncertain zone" around each threshold.

**Why $c = \min(\cdot,\cdot)$ of the two, not average?** Same
worst-factor-governs logic as steps 2–3: if either wind or wave is near its
boundary, overall confidence is capped by that one, not smoothed over by the
other being far away.

**$\pi_0$ piecewise:** near-certain (0.98) when there's an active storm or
we're fully clear of every boundary ($c=1$); otherwise a simple linear
interpolation $0.5 \to 0.9$ as $c$ goes $0 \to 1$ — confidence grows smoothly
as we move away from the edge.

---

## 6. Confidence calibration (Beta-Binomial conjugate update)

This is where the distance-based *prior* gets corrected using actual
observed data — a textbook **Bayesian conjugate update**.

**Q: what is the principle of a Bayesian conjugate update?**
**A:** Bayesian updating in general is just: *start with a belief (prior),
observe evidence, combine the two into an updated belief (posterior)*. In
full generality that combination step requires integrating over a
probability distribution, which can be expensive or have no closed form.

"Conjugate" is a shortcut that applies when the prior's distribution family
is chosen to match the type of evidence coming in. If it matches, the
posterior comes out *in the same family as the prior*, just with updated
parameters — so "updating" collapses into simple arithmetic on those
parameters instead of doing calculus.

For Beta + Bernoulli/Binomial data specifically: a Beta distribution is
naturally described by two pseudo-counts — "successes seen so far" and
"failures seen so far." Observing a real success or failure is *also* just a
count. So updating the belief means literally adding the new counts to the
old ones — the posterior is still a Beta, just with bigger counts. That's
the whole trick, and it's exactly what
$p^{*} = \frac{\kappa p_0 + a_{today}}{\kappa + n_{today}}$ is doing: treating
$\kappa p_0$ as "pseudo-successes already banked" and adding today's real
successes/trials on top.

**Why Beta-Binomial specifically?** We're estimating a probability (flag
correctness rate), and updating it with pass/fail trials (agree/disagree
reports). The Beta distribution is the **conjugate prior** for Bernoulli/
Binomial data — meaning the posterior after updating is *also* a Beta
distribution, so the update has a clean closed form instead of requiring
numerical integration.

**What is $\kappa = 9$?** The prior's strength, expressed in the same units
as real observations — "pseudo-observations." Setting $\kappa=9$ means the
prior is worth as much as if we'd already seen 9 historical reports.

**$p_0$ — where the prior mean comes from:** actual historical hit-rate for
this beaufort/douglas bucket if we have any history; otherwise fall back to
the physics-only estimate $\pi_0$ from step 5. History beats geometry when
available.

**Posterior mean:**
$$p^{*} = \frac{\kappa p_0 + a_{today}}{\kappa + n_{today}}$$
This is literally the Beta-Binomial posterior mean — a **weighted average of
prior and data**, where the weights are pseudo-observations ($\kappa$) vs.
real observations ($n_{today}$).

**Why it behaves the way it does — shrinkage:** as $n_{today} \to \infty$,
$p^{*} \to a_{today}/n_{today}$ (today's live agreement rate dominates); as
$n_{today} \to 0$, $p^{*} \to p_0$ (fall back to prior). This is the same
shrinkage-toward-prior behavior you get in empirical Bayes / James-Stein
estimators — trust real data more as it accumulates, trust the prior when
data is scarce.

**Why three cases (certain / prior / blended) instead of always using
$p^*$?** When $S=1$ or $c=1$ we're already maximally confident from physics
alone — no data could sharpen that meaningfully, so we skip the update.
When there's *no* data at all (no history, no live reports), $p^*$ reduces to
$p_0 = \pi_0$ anyway, so reporting $\pi_0$ directly with `basis=prior` is just
being honest about *why* the number is what it is (labeling, not math).

---

## How it all fits together

Two parallel derivations off the same raw reading:

```
raw readings ──► B, D (bucketize, §1–2) ──► Flag, RipRisk (rule veto/sum, §3–4)
raw readings ──► distance c (§5) ──► prior π₀ ──► Bayesian update (§6) ──► Confidence
```

- **The Flag path is deterministic:** bucketize → threshold rule. It answers
  *"what do we tell the swimmer?"*
- **The Confidence path is probabilistic:** margin-to-boundary → Bayesian
  update with historical + live agreement data. It answers *"how much should
  they trust that answer?"*

Splitting a system into a **point decision** plus a **calibrated confidence
in that decision** is a standard pattern anywhere a rule fires on noisy,
boundary-adjacent data — you don't just say "red flag," you also say how
sure you are it's really red.
