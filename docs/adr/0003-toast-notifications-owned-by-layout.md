# Toast notifications are a Layout-owned global mechanism, not per-page components

The beach detail page needs a transient "Unofficial estimate — not the
lifeguard's flag" toast on every load. Rather than building that as a
one-off component local to `BeachDetail`, we're giving `Layout` a generic
toast/snackbar mechanism (context provider + `useToast().show(message)`)
that any page can call into, and having `BeachDetail` call it on mount for
this disclaimer.

We considered keeping it local to `BeachDetail` — simpler for this one use
case, no new context, no changes outside the component that needs it. We
rejected that because a toast is exactly the kind of thing that gets needed
again (a "report submitted" confirmation, a network-error notice, etc.), and
`Layout` is already the place that owns cross-page chrome (header, auth
modal, verify-email banner). Building it local now would mean either
duplicating toast plumbing per page later or ripping this one out to
generalize it — Layout is the right home from the start.

`Layout` owns rendering, stacking, and dismiss timing; callers only pass a
message. `BeachDetail` never renders toast markup itself.
