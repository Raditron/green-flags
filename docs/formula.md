# Prediction formula

The mathematical form of the rule engine and confidence model implemented in
`backend/src/domain/rules/`. See the source files for the reasoning behind
each constant.

## Inputs (hour *h*, beach *b*)

| Symbol | Meaning | Source |
|---|---|---|
| $w$ | wind speed (m/s) | `windSpeedMps` |
| $\theta_w$ | wind bearing, meteorological convention (blowing FROM) | `windDirectionDeg` |
| $\theta_b$ | beach's onshore-facing bearing | `onshoreWindDirectionDeg` |
| $H_{wind}$ | wind-wave height (m) | `waveHeightM` |
| $H_{swell}$ | swell height on top of it (m), 0 if absent | `swellHeightM` |
| $T$ | wave period (s) | `wavePeriodS` |
| $S \in \{0,1\}$ | active storm warning | `stormWarningActive` |

## 1. Beaufort force

Step classifier against the WMO wind-force upper bounds (m/s):

$$U^B = [0.2,\ 1.5,\ 3.3,\ 5.4,\ 7.9,\ 10.7,\ 13.8,\ 17.1,\ 20.7,\ 24.4,\ 28.4,\ 32.6]$$

$$B(w) = \min\{\,i \in \{0,\dots,11\} : w \le U^B_i\,\} \quad(\text{12 if } w > U^B_{11})$$

## 2. Douglas sea state

Same classifier shape, applied to the taller of wind-wave and swell height:

$$H = \max(H_{wind},\, H_{swell})$$

$$U^D = [0,\ 0.1,\ 0.5,\ 1.25,\ 2.5,\ 4,\ 6,\ 9,\ 14]$$

$$D(H) = \min\{\,j \in \{0,\dots,8\} : H \le U^D_j\,\} \quad(\text{9 if } H > U^D_8)$$

## 3. Flag color

$$
\text{Flag} =
\begin{cases}
\text{red} & S = 1 \ \lor\ B \ge 6 \ \lor\ D \ge 5 \\
\text{yellow} & \text{else if } B \ge 4 \ \lor\ D \ge 3 \\
\text{green} & \text{otherwise}
\end{cases}
$$

## 4. Rip current risk

Onshore component of the wind (clamped — offshore wind contributes nothing):

$$\alpha = \theta_w - \theta_b, \qquad u_{on} = \max\big(w\cos(\alpha \cdot \pi / 180),\ 0\big)$$

Per-factor step score with a (moderate, high) threshold pair:

$$
\sigma(x; m, h) =
\begin{cases}
2 & x \ge h \\
1 & m \le x < h \\
0 & x < m
\end{cases}
$$

$$R = \sigma(H_{wind};\ 0.5,\ 1.0) + \sigma(T;\ 6,\ 8) + \sigma(u_{on};\ 3,\ 8)$$

$$
\text{RipRisk} =
\begin{cases}
\text{high} & R \ge 4 \\
\text{moderate} & 2 \le R < 4 \\
\text{low} & R < 2
\end{cases}
$$

## 5. Distance prior

Nearest yellow/red crossing points, reused from §1–2:

$$y_w = U^B_3 = 5.4, \quad r_w = U^B_5 = 10.7 \qquad\qquad y_h = U^D_2 = 0.5, \quad r_h = U^D_4 = 2.5$$

$$d_{wind} = \min(|w - y_w|,\ |w - r_w|) \qquad d_{wave} = \min(|H - y_h|,\ |H - r_h|)$$

$$c = \min\!\left(\min\!\left(\frac{d_{wind}}{2.0},\, 1\right),\ \min\!\left(\frac{d_{wave}}{0.4},\, 1\right)\right)$$

$c = 1$ means conditions are "well clear" of every threshold.

$$
\pi_0 =
\begin{cases}
0.98 & S = 1 \ \text{or}\ c = 1 \\
0.5 + 0.4c & \text{otherwise}
\end{cases}
$$

## 6. Confidence calibration (Beta-Binomial conjugate update)

The historical bucket hit-rate acts as a Beta prior with $\kappa = 9$
pseudo-observations; today's live reports update it as Bernoulli trials.

$(h_{hist}, n_{hist})$ = historical hits/total for bucket `beaufort-B_douglas-D`.
$(a_{today}, n_{today})$ = today's agreeing/total reports for this beach + hour.

$$
p_0 =
\begin{cases}
h_{hist} / n_{hist} & n_{hist} > 0 \\
\pi_0 & n_{hist} = 0
\end{cases}
\qquad\text{(baseline / prior mean)}
$$

$$p^{*} = \frac{\kappa\, p_0 + a_{today}}{\kappa + n_{today}} \qquad\text{(posterior mean)}$$

$$
\text{Confidence} =
\begin{cases}
\operatorname{round}(100\,\pi_0),\ \texttt{basis=certain} & c = 1 \\
\operatorname{round}(100\,\pi_0), \ \texttt{basis=prior} & c < 1,\ n_{hist} = n_{today} = 0 \\
\operatorname{round}(100\,p^{*}), \ \texttt{basis=blended} & \text{otherwise}
\end{cases}
$$

Equivalently, $p^{*}$ is the posterior mean of
$\text{Beta}(\kappa p_0,\ \kappa(1-p_0))$ updated by observing
$\text{Binomial}(n_{today}, a_{today})$: $\kappa$ is the baseline's weight in
units of pseudo-reports. As $n_{today} \to \infty$, $p^{*} \to a_{today}/n_{today}$
(today's data dominates); as $n_{today} \to 0$, $p^{*} \to p_0$ (prior dominates).

## Pipeline

$$(w,\ H_{wind},\ H_{swell},\ T,\ \theta_w,\ \theta_b,\ S)
\xrightarrow{\ B,\ D\ } \text{Flag}, \text{RipRisk}$$

$$(w,\ H_{wind},\ H_{swell},\ S,\ \text{feedback})
\xrightarrow{\ c,\ \pi_0,\ p^{*}\ } \text{Confidence}$$

Two parallel derivations off the same raw reading: one deterministic (the
flag), one Bayesian (how much to trust it).
