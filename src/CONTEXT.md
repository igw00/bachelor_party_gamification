# Engineering — /src
_Last updated: 2026-04-06_

## Purpose
This is the React application source. All component code, state management, Firebase logic, routing, and utility functions live here. When writing or editing any app code, work in this folder.

## Audience / Stakeholders
Ian building the app. End users are 15 bachelor party attendees — primarily captains logging scores on mobile Safari/Chrome. Must work reliably on phone screens in outdoor settings (high brightness, one thumb).

## Architecture
```
src/
├── components/
│   ├── layout/       # TabBar, BottomSheet, StatusBar
│   ├── scoreboard/   # TeamCard, PlayerRow, CardHandPreview, ProgressBar
│   ├── points/       # QuickAddSheet, AdvancedOptions, PlayerChips
│   ├── rules/        # RulesScreen, QuickRefCard, CollapsibleSection
│   └── setup/        # PlayerEntry, TeamDraw, DeckBuilder
├── hooks/            # useFirestore, useTeams, usePlayers, useCards
├── store/            # Zustand store (mirrors Firestore shape)
├── lib/              # firebase.js, scoring.js, cards.js
└── pages/            # Scoreboard.jsx, Rules.jsx, Setup.jsx
```

## Key constraints
- Firebase env vars go in `.env.local` — never committed
- Scoring logic lives in `lib/scoring.js` only — no inline point math in components
- Card logic lives in `lib/cards.js` only
- All Firestore writes go through hooks — components never call Firebase directly
- Groom is not on a team (teamId: null) but appears in every player selector
- Only Captains may activate cards — enforce this in the UI, not just the rules

## Process
1. Check the plan at `~/.claude/plans/agile-inventing-cosmos.md` for build order
2. Reference `/design/CONTEXT.md` and Stitch exports before building any screen
3. Build feature → write to `src/` → test in browser → confirm Firestore sync

## What good looks like
- A captain can log points in under 5 taps on mobile
- Two devices reflect the same score update within 1 second
- Card draw milestones auto-trigger at every 50-pt crossing
- Scoring utils are pure functions with no side effects

## What to avoid
- No inline styles — Tailwind utility classes only
- No point calculations outside `lib/scoring.js`
- No direct Firestore calls in components
- No gradients (per design spec)
