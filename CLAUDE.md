# The St. Pete Invitational

Mobile-first real-time scorekeeping app for a 3-day bachelor party competition — 15 players, 3 teams, card meta-game, prize pool.

## Identity
Working with Ian — PM/IC building this as a side project for a personal event.
Stack: React 18 + Vite + Tailwind CSS + Firebase Firestore + Zustand + React Router v6.
Deploys to Vercel via GitHub. Designed in Google Stitch (exports live in /design).

## Workspaces
- /src — React application source code (components, hooks, store, lib, pages)
- /design — Stitch-exported screens, design tokens, mockup references
- /docs — Game rules content, architecture decisions, deployment notes

## Routing
| Task | Go to | Read | Skills |
|------|-------|------|--------|
| Build or edit React components, hooks, store, Firebase logic | /src | CONTEXT.md | frontend-design |
| Integrate or reference Stitch screen exports | /design | CONTEXT.md | design-team:ux-advisor |
| Update rules content, write ADRs, deployment runbooks | /docs | CONTEXT.md | — |

## Naming conventions
- Components: PascalCase.jsx (e.g., TeamCard.jsx)
- Hooks: camelCase prefixed with "use" (e.g., useTeams.js)
- Docs/decisions: YYYY-MM-DD-topic.md
- Stitch exports: [screen-name]-export/ folder

## Rules
- Read this file first at the start of every session
- Work only in the designated workspace for each task type
- Never carry context from one workspace into another without being asked
- Ask before creating files outside the designated workspace folders
- When the project evolves, update the relevant CONTEXT.md (not this file)
- The plan at ~/.claude/plans/agile-inventing-cosmos.md is the source of truth for build order
