# Split routes into route + controller files, add a top-level composition root

Every file in `presentation/routes/` was a single `createXRouter(deps)` factory
that mixed two concerns: wiring (path, HTTP method, middleware chain) and
handling (parsing the request, invoking the use case, mapping the result or
error to an HTTP response). Meanwhile `server.ts` did double duty as both the
process entrypoint (reading env vars, starting the listener) and the
composition root (constructing every concrete Mongo repository, provider, and
Firebase verifier by hand). We split each route file into a `*.route.ts`
(wiring only) and a `presentation/controllers/*.controller.ts` (handling
only, one `createXController(deps)` factory returning an object of handler
methods), and extracted the dependency construction out of `server.ts` into a
new top-level `backend/src/composition.ts`, peer to `domain/`, `application/`,
`infrastructure/`, and `presentation/`.

Two boundaries were deliberately kept narrow rather than consolidated further:
`composition.ts` builds the dependency bag only — it does not call
`createApp` itself — so `presentation/app.ts` remains the single place that
shapes the Express app from a dependency bag, which is also how it's already
unit-tested (fake deps passed directly to `createApp`). And `composition.ts`
never touches `process.env` directly; `server.ts` still reads and validates
env vars and passes a plain config object in, keeping `composition.ts` a pure
function of its inputs and env-var sourcing a single process-entrypoint
concern.
