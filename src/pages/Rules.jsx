import QuickRefCard from '../components/rules/QuickRefCard'
import CollapsibleSection from '../components/rules/CollapsibleSection'

export default function Rules() {
  return (
    <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto space-y-5">
      {/* Title */}
      <section className="mb-6">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Rulebook</h2>
        <p className="font-body text-on-surface-variant mt-1">The official guide to The St. Pete Invitational.</p>
      </section>

      {/* Quick Ref */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
        <QuickRefCard
          icon="paid"
          color="primary"
          title="Prize Pool"
          lines={[
            '1st place team: 50% of pot',
            '2nd place team: 25% of pot',
            '3rd place team: nothing',
            'MVP (top scorer): 25% of pot',
          ]}
        />
        <QuickRefCard
          icon="sports"
          color="secondary"
          title="Activity Points"
          lines={[
            'Golf / Bar Golf: 10/7/5 team',
            'Volleyball: 10/7/5 team',
            'Beach Game: 5/3/1 team',
            'Beer Game: 5/3/1 team',
            'Drinks: +2 pts each',
          ]}
        />
        <QuickRefCard
          icon="style"
          color="tertiary"
          title="Card Draws"
          lines={[
            'Every 50 pts → draw a card',
            'Max 2 cards active',
            'Captains only can activate',
            'Rare cards: special effects',
          ]}
        />
      </div>

      {/* Collapsible sections */}
      <div className="space-y-3">
        <CollapsibleSection title="Overview & Teams" defaultOpen>
          <p>15 players split into 3 teams of 5. Teams compete across all 3 days in activities, drink logs, and the card meta-game.</p>
          <p>One player per team is designated the <strong>Captain</strong>. Captains can activate cards and award Captain Bank points.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Scoring System">
          <p><strong>Team Points</strong> are the primary currency for competition standings.</p>
          <p><strong>Individual Points</strong> track personal performance for bragging rights.</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Golf / Bar Golf / Volleyball: 1st 10 pts, 2nd 7 pts, 3rd 5 pts</li>
            <li>Beach / Beer Games: 1st 5 pts, 2nd 3 pts, 3rd 1 pt</li>
            <li>Drinks: 2 pts each, individual only</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Day 3 Multiplier">
          <p>When activated by the admin, all points scored on Day 3 are doubled (2×).</p>
          <p>This creates a comeback mechanic for trailing teams.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Captain Bank">
          <p>Each captain has a 150-point bank to award to <em>other</em> teams' players throughout the event.</p>
          <p>Awards must be 1–50 pts per transaction. Captains cannot award their own team.</p>
          <p>Use this to reward exceptional sportsmanship, memorable moments, or side bets.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Card Meta-Game">
          <p>Teams earn a card draw every time they cross a multiple of 50 points.</p>
          <p>Cards are drawn from a shared deck. Only captains can activate cards.</p>
          <p>Maximum 2 active cards per team at once. Cards types:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Power Up</strong> — Buffs your team</li>
            <li><strong>Wild Card</strong> — Tactical plays</li>
            <li><strong>Chaos</strong> — Shakes up the standings</li>
            <li><strong>Rare</strong> — High-impact, unique effects</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Prize Pool">
          <p>Team standings at end of Day 3 determine payouts:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>1st place team:</strong> 50% of the pot</li>
            <li><strong>2nd place team:</strong> 25% of the pot</li>
            <li><strong>3rd place team:</strong> nothing</li>
          </ul>
          <p className="mt-3"><strong>MVP Individual:</strong> The single player with the most individual points wins 25% of the pot — regardless of which team they're on.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Tiebreakers">
          <p>If teams are tied on total points at end of Day 3:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Most individual 1st-place activity finishes</li>
            <li>Highest Day 3 points scored</li>
            <li>Commissioner's discretion</li>
          </ol>
        </CollapsibleSection>
      </div>
    </main>
  )
}
