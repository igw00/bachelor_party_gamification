import { DEFAULT_DECK } from '../../lib/cards'

/**
 * GameCard — Yu-Gi-Oh–inspired card layout for the meta-game card system.
 *
 * Layout (portrait):
 *   ┌──────────────────────┐
 *   │  TYPE BADGE  │ NAME  │  ← colored title bar
 *   ├──────────────────────┤
 *   │     ILLUSTRATION     │  ← decorative art zone
 *   ├──────────────────────┤
 *   │ ─── TYPE LABEL ───── │
 *   │  Description text    │  ← effect box
 *   │           +Y / -X pt │  ← points (bottom-right, conditional)
 *   └──────────────────────┘
 */

const TYPE_CONFIG = {
  Power: {
    outerBg: 'bg-secondary-fixed',
    border: 'border-secondary/50',
    titleBg: 'bg-secondary',
    titleText: 'text-on-secondary',
    illustrationBg: 'bg-secondary-fixed-dim/50',
    illustrationRing: 'ring-secondary/30',
    accentText: 'text-secondary',
    icon: 'bolt',
    divider: 'border-secondary/20',
    badge: 'bg-secondary/15 text-secondary',
    pointGain: 'text-secondary',
  },
  Chaos: {
    outerBg: 'bg-primary-fixed',
    border: 'border-primary/50',
    titleBg: 'bg-primary',
    titleText: 'text-on-primary',
    illustrationBg: 'bg-primary-fixed-dim/50',
    illustrationRing: 'ring-primary/30',
    accentText: 'text-primary',
    icon: 'cyclone',
    divider: 'border-primary/20',
    badge: 'bg-primary/10 text-primary',
    pointGain: 'text-primary',
  },
  Wild: {
    outerBg: 'bg-tertiary-fixed/70',
    border: 'border-tertiary/50',
    titleBg: 'bg-tertiary',
    titleText: 'text-on-tertiary',
    illustrationBg: 'bg-tertiary-fixed-dim/50',
    illustrationRing: 'ring-tertiary/30',
    accentText: 'text-tertiary',
    icon: 'auto_awesome',
    divider: 'border-tertiary/20',
    badge: 'bg-tertiary/15 text-tertiary',
    pointGain: 'text-tertiary',
  },
}

const ILLUSTRATION_ICONS = {
  Power: ['bolt', 'shield', 'star', 'trending_up', 'military_tech'],
  Chaos: ['cyclone', 'thunderstorm', 'swap_horiz', 'shuffle', 'crisis_alert'],
  Wild: ['auto_awesome', 'casino', 'psychology', 'swap_calls', 'workspace_premium'],
}

function IllustrationZone({ type, seed = 0 }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.Wild
  const icons = ILLUSTRATION_ICONS[type] ?? ILLUSTRATION_ICONS.Wild
  const centerIcon = icons[seed % icons.length]
  const cornerIcons = icons.filter((_, i) => i !== seed % icons.length).slice(0, 4)

  return (
    <div
      className={`relative mx-3 rounded-lg overflow-hidden aspect-[4/3] ${cfg.illustrationBg} ring-1 ${cfg.illustrationRing} flex items-center justify-center`}
    >
      {/* Corner decoration icons */}
      {cornerIcons.map((icon, i) => {
        const positions = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2']
        return (
          <span
            key={i}
            className={`material-symbols-outlined absolute ${positions[i]} ${cfg.accentText} opacity-20 text-2xl`}
          >
            {icon}
          </span>
        )
      })}

      {/* Center icon */}
      <span
        className={`material-symbols-outlined ${cfg.accentText} opacity-70`}
        style={{ fontSize: '4rem' }}
      >
        {centerIcon}
      </span>

      {/* Subtle diagonal pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            currentColor 0px,
            currentColor 1px,
            transparent 1px,
            transparent 8px
          )`,
        }}
      />
    </div>
  )
}

export default function GameCard({ card, seed = 0, compact = false }) {
  const { name, type, target, description, assignedToName } = card
  // Fall back to static deck definition for point fields — Firestore docs seeded
  // before these fields were added won't have them on the card object.
  const staticDef = DEFAULT_DECK.find((c) => c.name === card.name && c.target === card.target) ?? {}
  const pointsGain    = card.pointsGain    ?? staticDef.pointsGain
  const pointsLoss    = card.pointsLoss    ?? staticDef.pointsLoss
  const completionPts = card.completionPts ?? staticDef.completionPts
  const refusalPts    = card.refusalPts    ?? staticDef.refusalPts
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.Wild

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl overflow-hidden
        border-2 ${cfg.border} ${cfg.outerBg}
        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        ${compact ? 'w-44' : 'w-64'}
        select-none
      `}
    >
      {/* ── Title bar ─────────────────────────── */}
      <div className={`${cfg.titleBg} px-3 py-2.5 flex items-center justify-between gap-2`}>
        <div className="flex-1 min-w-0">
          <span
            className={`font-headline font-black leading-tight ${cfg.titleText} ${compact ? 'text-sm' : 'text-base'} block truncate`}
          >
            {name}
          </span>
          {assignedToName && (
            <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.titleText} opacity-75 block truncate`}>
              → {assignedToName}
            </span>
          )}
        </div>
        <span
          className={`material-symbols-outlined ${cfg.titleText} opacity-80 flex-shrink-0`}
          style={{ fontSize: compact ? '1.1rem' : '1.3rem' }}
        >
          {cfg.icon}
        </span>
      </div>

      {/* ── Illustration ──────────────────────── */}
      <div className="pt-3 pb-2">
        <IllustrationZone type={type} seed={seed} />
      </div>

      {/* ── Type divider ──────────────────────── */}
      <div className={`mx-3 mb-2 flex items-center gap-2 border-t ${cfg.divider} pt-2`}>
        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${cfg.accentText}`}>
          {type} Card
        </span>
        {target === 'Individual' && (
          <span className="text-[9px] font-black uppercase tracking-wider bg-on-surface/8 text-on-surface-variant px-1.5 py-0.5 rounded-full">
            Individual
          </span>
        )}
        <div className={`flex-1 h-px ${cfg.divider} border-t`} />
      </div>

      {/* ── Description ───────────────────────── */}
      <div className="mx-3 mb-3 flex-1">
        <div className="bg-surface-container-lowest/80 rounded-lg px-3 py-2.5 min-h-[72px] flex flex-col justify-between">
          <p
            className={`font-body text-on-surface leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'}`}
          >
            {description}
          </p>

          {/* ── Points footer ─────────────────── */}
          {(pointsGain || pointsLoss || completionPts || refusalPts) && (
            <div className="flex flex-col items-end mt-2 gap-0.5">
              {pointsGain && (
                <span className={`font-headline font-black text-xs ${cfg.pointGain}`}>
                  +{pointsGain} pts
                </span>
              )}
              {pointsLoss && (
                <span className="font-headline font-black text-xs text-error">
                  -{pointsLoss} pts
                </span>
              )}
              {completionPts && (
                <span className="font-headline font-black text-xs text-tertiary">
                  ✓ +{completionPts} pts
                </span>
              )}
              {refusalPts && (
                <span className="font-headline font-black text-xs text-error">
                  ✗ +{refusalPts} pts
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
