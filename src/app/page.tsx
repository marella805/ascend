export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/db/index';
import { getCharacterSheet, getPRs, getTemplateState } from '@/lib/db/queries';
import { TEMPLATES } from '@/lib/templates';
import { RadarChart } from '@/components/ui/RadarChart';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AppNav } from '@/components/AppNav';
import Link from 'next/link';

export default async function CharacterSheetPage() {
  await ensureDb();
  const data = await getCharacterSheet();
  const prs = (await getPRs()).slice(0, 5);
  const templateState = await getTemplateState();

  if (!data) {
    return (
      <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
        <i className="ph ph-mountains" style={{ fontSize: 48, color: '#23282F' }} />
        <span className="font-oswald" style={{ color: '#8A939C', letterSpacing: '.14em', fontSize: 14 }}>NO PROFILE FOUND</span>
        <AppNav />
      </main>
    );
  }

  const { user, level, attributes, streak, todayQuest, season } = data;
  const nextTemplate = templateState.nextTemplate ? TEMPLATES[templateState.nextTemplate] : null;
  const xpPct = Math.min(100, (level.levelXp / level.levelXpRequired) * 100).toFixed(1) + '%';

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 24px 104px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C' }}>
              SEASON {season.ordinal} · WEEK {season.week}
            </div>
            <div className="font-oswald" style={{ fontSize: 17, letterSpacing: '.03em', marginTop: 3 }}>
              {user.displayName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: '7px 11px' }}>
            <i className="ph-fill ph-fire" style={{ color: '#FFC53C', fontSize: 16 }} />
            <span className="font-oswald" style={{ fontSize: 17 }}>{streak.length}</span>
          </div>
        </div>

        {/* Streak protection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#8A939C', fontSize: 11 }}>
          <i className="ph ph-shield-check" style={{ color: '#C6F135', fontSize: 14 }} />
          {streak.restTokens} rest token{streak.restTokens !== 1 ? 's' : ''} available · streak protected
        </div>

        {/* Level row */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.2em', color: '#8A939C' }}>LEVEL</div>
            <div className="font-oswald" style={{ fontWeight: 600, fontSize: 66, lineHeight: .86, letterSpacing: '-.01em' }}>
              {level.level}
            </div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 6 }}>
            <div className="font-oswald" style={{ fontSize: 15, color: '#C6F135' }}>
              {level.levelXp.toLocaleString()} / {level.levelXpRequired.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#8A939C', marginTop: 1 }}>
              {level.xpToNext.toLocaleString()} XP to level {level.level + 1}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, height: 8, borderRadius: 6, background: '#14181D', border: '1px solid #23282F', overflow: 'hidden' }}>
          <div className="anim-grow" style={{ height: '100%', width: xpPct, background: '#C6F135', borderRadius: 6 }} />
        </div>

        {/* Attribute radar */}
        <div style={{ marginTop: 16, background: '#14181D', border: '1px solid #23282F', borderRadius: 18, padding: '12px 12px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C' }}>ATTRIBUTES</span>
            <span style={{ fontSize: 10, color: '#8A939C' }}>this season</span>
          </div>
          <RadarChart {...attributes} size={220} />
        </div>

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {([
            { key: 'STR', val: attributes.str, color: '#FF5A3C' },
            { key: 'END', val: attributes.end, color: '#3CC5FF' },
            { key: 'MOB', val: attributes.mob, color: '#B57BFF' },
            { key: 'CON', val: attributes.con, color: '#FFC53C' },
          ] as const).map(({ key, val, color }) => (
            <div key={key} style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
              <div className="font-oswald" style={{ fontSize: 24, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: '.14em', color: '#8A939C', marginTop: 3 }}>{key}</div>
            </div>
          ))}
        </div>

        {/* Today's quest */}
        {todayQuest && (
          <div style={{ marginTop: 12, background: 'linear-gradient(180deg,#171C22,#12161B)', border: '1px solid #23282F', borderRadius: 16, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProgressRing
              value={(todayQuest.current / todayQuest.target) * 100}
              color="#C6F135"
              size={44}
            />
            <div style={{ flex: 1 }}>
              <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#C6F135' }}>
                TODAY&apos;S QUEST
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{todayQuest.name}</div>
              <div style={{ fontSize: 11, color: '#8A939C', marginTop: 1 }}>
                {todayQuest.current} of {todayQuest.target} done · +{todayQuest.xpReward} XP
              </div>
            </div>
            <i className="ph ph-caret-right" style={{ color: '#8A939C', fontSize: 18 }} />
          </div>
        )}

        {/* Log session CTA */}
        <Link
          href="/log"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 12, width: '100%', background: '#C6F135', color: '#0B0D10',
            borderRadius: 15, height: 56, fontFamily: "'Oswald',sans-serif",
            fontWeight: 600, fontSize: 16, letterSpacing: '.06em', textDecoration: 'none',
          }}
        >
          <i className="ph-bold ph-plus" style={{ fontSize: 20 }} />
          LOG A SESSION
        </Link>

        {/* Next workout recommendation */}
        {nextTemplate && (
          <div style={{ marginTop: 10, background: '#14181D', border: `1px solid ${nextTemplate.color}30`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${nextTemplate.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ph ${nextTemplate.icon}`} style={{ fontSize: 18, color: nextTemplate.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif" }}>NEXT WORKOUT</div>
              <div style={{ fontSize: 15, fontFamily: "'Oswald',sans-serif", color: nextTemplate.color, marginTop: 1 }}>{nextTemplate.name}</div>
            </div>
            <Link href="/log" style={{ fontSize: 11, fontFamily: "'Oswald',sans-serif", color: '#4A5260', letterSpacing: '.1em', textDecoration: 'none' }}>
              START →
            </Link>
          </div>
        )}

        {/* Top Lifts (PRs) */}
        {prs.length > 0 && (
          <div style={{ marginTop: 12, background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '13px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C' }}>TOP LIFTS</span>
              <span style={{ fontSize: 10, color: '#4A5260' }}>all-time PRs</span>
            </div>
            {prs.map(pr => (
              <div key={pr.exerciseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 7, marginBottom: 7, borderBottom: '1px solid #1E2530' }}>
                <div style={{ fontSize: 13 }}>{pr.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, color: '#FF5A3C' }}>{pr.weightLb}</span>
                  <span style={{ fontSize: 10, color: '#8A939C' }}>lb × {pr.reps}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppNav />
    </main>
  );
}
