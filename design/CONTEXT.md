# Design — /design
_Last updated: 2026-04-06_

## Purpose
Holds all design artifacts for the app: Stitch-exported screen code, design tokens, and mockup screenshots. When integrating a new screen from Stitch or making visual decisions, start here.

## Audience / Stakeholders
Ian reviewing designs and integrating Stitch exports into the React app. Design references the Stitch prompt visual spec: Airbnb-inspired, minimal, mobile-first.

## Design Language (from Stitch prompt)
- Background: `#FAFAFA`
- Accent: deep coral (`#E85D45`) or navy (`#1B2E4B`) — pick one and stay consistent
- Rounded cards with subtle drop shadows
- Strong typographic hierarchy — no gradients, no clutter
- Bottom tab bar: fixed, 3 tabs, center + button elevated above bar

## Process
1. Export screen from Stitch as code → drop into `/design/stitch-exports/[screen-name]-export/`
2. Screenshot the Stitch mockup → save to `/design/screens/`
3. Extract any new design tokens → update `/design/tokens/tokens.js`
4. In `/src`, integrate the export by wiring it to the Zustand store and hooks

## What good looks like
- Every screen in Stitch has a corresponding export folder before the React component is built
- Design tokens are single-sourced in `tokens.js` and imported into `tailwind.config.js`
- No hardcoded hex values in React components — use Tailwind token classes only

## What to avoid
- Don't put finalized component code here — exports move to `/src` once wired up
- Don't make visual decisions without referencing the Stitch mockup first

## Files in this workspace
- /stitch-exports — raw exported code from Google Stitch, one folder per screen
- /screens — screenshots of Stitch mockups for reference
- /tokens — design token source file (`tokens.js`)
