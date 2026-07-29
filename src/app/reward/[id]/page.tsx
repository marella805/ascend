'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { RewardEnvelope } from '@/lib/db/queries';

const ATTR_COLORS: Record<string, string> = {
  str: '#FF5A3C',
  end: '#3CC5FF',
  mob: '#B57BFF',
  con: '#FFC53C',
};

export default function RewardPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const [reward, setReward] = useState<RewardEnvelope | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`reward-${sessionId}`);
    if (cached) {
      setReward(JSON.parse(cached));
    } else {
      // Fallback: fetch from a hypothetical GET endpoint
      router.push('/');
    }
  }, [sessionId, router]);

  if (!reward) {
    return (
      <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8A939C', fontFamily: "'Oswald',sans-serif", letterSpacing: '.14em' }}>LOADING…</div>
      </main>
    );
  }

  const baselinePct = Math.round((reward.baselineRatio - 1) * 100);
  const xpPct = Math.min(100, (reward.levelInfo.levelXp / reward.levelInfo.levelXpRequired) * 100);

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '24px 24px 32px' }}>

        {/* XP burst */}
        <div className="anim-pop" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", marginBottom: 8 }}>
            SESSION COMPLETE
          </div>
          <div style={{ fontSize: 80, fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: '#C6F135', lineHeight: 0.9 }}>
            +{reward.xpEarned}
          </div>
          <div style={{ fontSize: 16, fontFamily: "'Oswald',sans-serif", color: '#C6F135', marginTop: 4 }}>XP</div>
        </div>

        {/* Baseline comparison */}
        <div className="anim-rise" style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '16px 20px', marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", marginBottom: 6 }}>VS. YOUR 4-WEEK BASELINE</div>
          <div style={{ fontSize: 36, fontFamily: "'Oswald',sans-serif", color: baselinePct >= 0 ? '#C6F135' : '#FF5A3C', fontWeight: 700 }}>
            {baselinePct >= 0 ? '+' : ''}{baselinePct}%
          </div>
        </div>

        {/* Level bar */}
        <div className="anim-rise" style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', fontFamily: "'Oswald',sans-serif" }}>
                {reward.leveledUp ? '⬆ LEVEL UP!' : 'LEVEL'}
              </div>
              <div style={{ fontSize: 40, fontFamily: "'Oswald',sans-serif", fontWeight: 700, lineHeight: 1, marginTop: 2 }}>
                {reward.newLevel}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontFamily: "'Oswald',sans-serif", color: '#C6F135' }}>
                {reward.levelInfo.levelXp.toLocaleString()} / {reward.levelInfo.levelXpRequired.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>
                {reward.levelInfo.xpToNext.toLocaleString()} to next
              </div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: '#23282F', overflow: 'hidden' }}>
            <div
              className="anim-grow"
              style={{ height: '100%', width: `${xpPct.toFixed(1)}%`, background: '#C6F135', borderRadius: 6 }}
            />
          </div>
        </div>

        {/* Attribute deltas */}
        {Object.entries(reward.attrDeltas).some(([, d]) => d !== 0) && (
          <div className="anim-flip" style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '14px 20px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", marginBottom: 10 }}>
              ATTRIBUTE CHANGES
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {(Object.entries(reward.attrDeltas) as Array<[string, number]>).map(([attr, delta]) => (
                <div key={attr} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, letterSpacing: '.14em', color: '#8A939C', marginBottom: 4, fontFamily: "'Oswald',sans-serif" }}>
                    {attr.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: 16, fontFamily: "'Oswald',sans-serif", fontWeight: 600,
                    color: delta > 0 ? ATTR_COLORS[attr] ?? '#C6F135' : delta < 0 ? '#FF5A3C' : '#4A5260',
                  }}>
                    {delta > 0 ? '+' : ''}{delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak */}
        <div className="anim-rise" style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="ph-fill ph-fire" style={{ color: '#FFC53C', fontSize: 22 }} />
            <div>
              <div style={{ fontSize: 24, fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>{reward.streak.length}</div>
              <div style={{ fontSize: 10, color: '#8A939C' }}>day streak</div>
            </div>
          </div>
          <div style={{ flex: 1, background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="ph ph-shield-check" style={{ color: '#C6F135', fontSize: 22 }} />
            <div>
              <div style={{ fontSize: 24, fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>{reward.streak.restTokens}</div>
              <div style={{ fontSize: 10, color: '#8A939C' }}>rest tokens</div>
            </div>
          </div>
        </div>

        {/* Quest progress */}
        {reward.questXp > 0 && (
          <div className="anim-rise" style={{ background: 'linear-gradient(135deg,#171C22,#12161B)', border: '1px solid #C6F13530', borderRadius: 16, padding: '14px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProgressRing value={100} color="#C6F135" size={40} />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.14em', color: '#C6F135', fontFamily: "'Oswald',sans-serif" }}>QUEST COMPLETE</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>+{reward.questXp} bonus XP</div>
            </div>
          </div>
        )}

        {/* Badge unlocks */}
        {reward.badges.map(badge => (
          <div key={badge.slug} className="anim-pop" style={{
            background: 'linear-gradient(135deg,#1A1020,#130D1A)',
            border: '1px solid #B57BFF40', borderRadius: 16, padding: '14px 20px',
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, background: '#B57BFF20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-medal" style={{ color: '#B57BFF', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.14em', color: '#B57BFF', fontFamily: "'Oswald',sans-serif" }}>
                BADGE UNLOCKED · {badge.rarity.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{badge.name}</div>
            </div>
          </div>
        ))}

        {/* Next session targets */}
        {reward.nextTargets && reward.nextTargets.length > 0 && (
          <div className="anim-rise" style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '14px 20px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", marginBottom: 10 }}>
              NEXT SESSION TARGETS
            </div>
            {reward.nextTargets.map(t => (
              <div key={t.exerciseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #1E2530' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.exerciseName}</div>
                  <div style={{ fontSize: 11, color: '#4A5260', marginTop: 2 }}>
                    was {t.lastWeightLb} lb × {t.lastReps}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, color: '#C6F135' }}>
                    {t.nextWeightLb} lb × {t.nextReps}
                  </div>
                  <div style={{ fontSize: 10, color: '#4A5260', marginTop: 1 }}>
                    {t.nextWeightLb > t.lastWeightLb ? '↑ WEIGHT UP' : t.nextReps > t.lastReps ? '↑ REP UP' : 'HOLD'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Done CTA */}
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', background: '#C6F135', color: '#0B0D10',
            borderRadius: 15, height: 56, marginTop: 8,
            fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 16,
            letterSpacing: '.06em', textDecoration: 'none',
          }}
        >
          BACK TO CHARACTER SHEET
        </Link>
      </div>
    </main>
  );
}
