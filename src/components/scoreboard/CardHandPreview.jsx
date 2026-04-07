export default function CardHandPreview({ held = 0, active = 0 }) {
  if (held === 0 && active === 0) return null
  return (
    <span className="text-[10px] font-medium text-on-secondary-container bg-secondary-fixed px-2 py-0.5 rounded-full">
      {held} held · {active} active
    </span>
  )
}
