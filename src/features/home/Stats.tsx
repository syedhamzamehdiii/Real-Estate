import { Reveal } from '../../components/ui'
import { stats } from '../../data/stats'
import { useCountUp } from '../../hooks/useCountUp'
import type { StatItem } from '../../types'
import './Stats.css'

function Stat({ item }: { item: StatItem }) {
  const { ref, display } = useCountUp(item.value, item.decimals ?? 0)
  return (
    <div className="stat">
      <h3 ref={ref}>
        {display}
        {item.suffix ?? ''}
      </h3>
      <p>{item.label}</p>
    </div>
  )
}

export function Stats() {
  return (
    <Reveal className="stats" as="div">
      {stats.map((item) => (
        <Stat key={item.id} item={item} />
      ))}
    </Reveal>
  )
}
