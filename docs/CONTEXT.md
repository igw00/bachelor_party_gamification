# Docs — /docs
_Last updated: 2026-04-06_

## Purpose
Stores the game rulebook content (used to populate the in-app Rules screen), architecture decision records (ADRs), and deployment/ops notes. Reference this workspace when writing rules content, documenting a significant technical decision, or setting up Firebase/Vercel.

## Audience / Stakeholders
Ian and any future contributors who need to understand how the app works, why key decisions were made, and how to deploy or maintain it.

## Process
- Rules content: edit `/docs/rules/` markdown files → these feed directly into the Rules screen
- ADRs: create `/docs/decisions/YYYY-MM-DD-topic.md` when making a significant technical choice
- Deployment notes: update `/docs/deployment/` when Firebase config or Vercel settings change

## What good looks like
- The rules/ folder mirrors the 8 sections of the official rulebook exactly
- Each ADR explains the decision, the alternatives considered, and why this was chosen
- Deployment notes are complete enough to reproduce the setup from scratch

## What to avoid
- Don't put app code here
- Don't duplicate rules content — the markdown here IS the source of truth for the in-app rules screen
- Don't let deployment notes go stale — update them when config changes

## Files in this workspace
- /rules — Rulebook sections as markdown (Section 1–8 + quick reference tables)
- /decisions — Architecture Decision Records
- /deployment — Firebase setup, Vercel config, environment variable notes
