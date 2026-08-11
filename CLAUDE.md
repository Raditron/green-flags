# CLAUDE.md

Project-specific notes for Claude Code.

## Dev environment

- **Port 4000 is off-limits.** The user already runs the backend dev server on port 4000 outside of Claude Code's sessions. Do not start/run the backend (or anything else) on port 4000 — attempting to `listen` on it will collide with the user's own running instance (`EADDRINUSE`). If the backend needs to be run from within a Claude Code session, use a different port (e.g. via a `PORT` env var override) or ask the user first.
