const ACTIVITY_TYPES = [
  { value: 'golf', label: 'Golf' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'beachGame', label: 'Beach Game' },
  { value: 'beerGame', label: 'Beer Game' },
  { value: 'barGolf', label: 'Bar Golf' },
]

export default function AdvancedOptions({ form, setForm }) {
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Activity Type
        </label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, activityType: a.value }))}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                form.activityType === a.value
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Placement
        </label>
        <div className="flex gap-2">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm((f) => ({ ...f, placement: p }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                form.placement === p
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {p === 1 ? '🥇 1st' : p === 2 ? '🥈 2nd' : '🥉 3rd'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Drink Log (each drink = +2 pts)
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, drinks: Math.max(0, (f.drinks || 0) - 1) }))}
            className="w-10 h-10 rounded-full bg-surface-container text-on-surface font-bold text-lg active:scale-90 transition-transform"
          >
            −
          </button>
          <span className="font-headline font-bold text-2xl text-on-surface w-8 text-center">
            {form.drinks || 0}
          </span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, drinks: (f.drinks || 0) + 1 }))}
            className="w-10 h-10 rounded-full bg-surface-container text-on-surface font-bold text-lg active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Captain Bank Award (pts)
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={form.captainAward || ''}
          onChange={(e) => setForm((f) => ({ ...f, captainAward: Number(e.target.value) }))}
          placeholder="0–50 pts to another team"
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:bg-surface-container-lowest transition-colors"
        />
      </div>
    </div>
  )
}
