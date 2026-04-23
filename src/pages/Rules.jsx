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
          icon="sports_golf"
          color="secondary"
          title="Golf Points"
          lines={[
            'Individual winner: +75 pts',
            'Team lowest score: +200 pts',
            'Eagle: +20 pts',
            'Birdie: +12 pts',
            'Par: +5 pts',
          ]}
        />
        <QuickRefCard
          icon="sports"
          color="tertiary"
          title="Activity Points"
          lines={[
            'Pickleball game win: +20 pts/player',
            'Volleyball game win: +20 pts/player',
            'Beer game win: +15 pts',
            'Drink: +5 pts',
          ]}
        />
        <QuickRefCard
          icon="style"
          color="primary"
          title="Card Draws"
          lines={[
            'Every 50 pts → draw a card',
            'Max 2 cards active',
            'Captains only can activate',
            'Deck reshuffles when empty',
          ]}
        />
      </div>

      {/* Collapsible sections */}
      <div className="space-y-3">
        <CollapsibleSection title="Overview & Teams" defaultOpen>
          <p>15 players split into 3 teams of 5. Teams compete across all 3 days in activities, drink logs, and the card meta-game.</p>
          <p>One player per team is designated the <strong>Captain</strong>. Captains can activate cards and award Captain Bank points.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Golf">
          <p><strong>Individual performance</strong> earns points on every hole:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 mb-3">
            <li>Eagle: <strong>+20 pts</strong></li>
            <li>Birdie: <strong>+12 pts</strong></li>
            <li>Par: <strong>+5 pts</strong></li>
          </ul>
          <p><strong>Winning outright</strong> (lowest individual score) earns the winner <strong>+75 individual pts</strong>.</p>
          <p className="mt-2"><strong>Team victory</strong>: If your team collectively has the lowest total score, every member earns <strong>+200 team pts</strong>.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Pickleball & Volleyball">
          <p>Points are awarded <strong>per game won</strong> — not just for the overall match result.</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Each game won: <strong>+20 pts</strong> for every player on the winning side</li>
          </ul>
          <p className="mt-2 text-sm text-on-surface-variant">Win 3 games in a session and each player on your side earns 60 pts total.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Beer Games">
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Win any beer game: <strong>+15 pts</strong> for each winner</li>
          </ul>
          <p className="mt-2 text-sm text-on-surface-variant">Applies to cornhole, flip cup, beer pong, and any other recognized beer game.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Drinks">
          <p>Every drink consumed earns <strong>+5 pts</strong> as individual points.</p>
          <p className="mt-1 text-sm text-on-surface-variant">Log each drink via the quick-add button. Honor system — drink responsibly.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Scoring System">
          <p><strong>Team Points</strong> are the primary currency for competition standings.</p>
          <p className="mt-1"><strong>Individual Points</strong> track personal performance and determine the MVP prize.</p>
          <p className="mt-2 text-sm text-on-surface-variant">Both point types are awarded simultaneously for most activities.</p>
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
          <p>Teams earn a card draw every time they cross a multiple of 50 points. Each team starts with 1 draw.</p>
          <p>Cards are drawn from a shared 66-card deck. Only captains can activate cards.</p>
          <p>Maximum 2 active cards per team at once. When the deck runs out it reshuffles automatically.</p>
          <p className="mt-2">Card types:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Power</strong> — Buffs your team or an individual</li>
            <li><strong>Wild</strong> — Tactical plays and economy moves</li>
            <li><strong>Chaos</strong> — Imposed on other teams; complete for big pts or refuse for a penalty</li>
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
