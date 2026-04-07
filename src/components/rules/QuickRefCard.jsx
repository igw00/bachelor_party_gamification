export default function QuickRefCard({ icon, title, lines = [], color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'bg-primary-fixed/30', icon: 'text-primary', title: 'text-primary', text: 'text-on-primary-container' },
    secondary: { bg: 'bg-secondary-fixed/40', icon: 'text-secondary', title: 'text-secondary', text: 'text-on-secondary-container' },
    tertiary: { bg: 'bg-tertiary-container/10', icon: 'text-tertiary', title: 'text-tertiary', text: 'text-on-tertiary-container' },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <div className={`flex-shrink-0 w-52 ${c.bg} p-5 rounded-xl`}>
      <span className={`material-symbols-outlined ${c.icon} mb-2 block`}>{icon}</span>
      <p className={`text-xs font-bold ${c.title} uppercase tracking-wider`}>{title}</p>
      <ul className={`mt-2 space-y-1 text-[11px] ${c.text}`}>
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  )
}
