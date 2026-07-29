export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/db/index';
import { getQuests } from '@/lib/db/queries';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AppNav } from '@/components/AppNav';

export default async function QuestsPage() {
  await ensureDb();
  const quests = await getQuests();

  const weekly = quests.filter(q => q.kind === 'weekly');
  const season = quests.filter(q => q.kind === 'season_goal');

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 24px 104px' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginTop: 6 }}>THIS WEEK</div>
        <div className="font-oswald" style={{ fontSize: 24, marginBottom: 20, marginTop: 3 }}>QUESTS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {weekly.length === 0 && (
            <div style={{ color: '#4A5260', fontSize: 13, padding: 16 }}>No weekly quests yet — log a session to unlock quests.</div>
          )}
          {weekly.map(q => {
            const pct = q.target > 0 ? (q.current / q.target) * 100 : 0;
            return (
              <div key={q.id} style={{
                background: q.completed ? 'linear-gradient(135deg,#141A10,#101510)' : '#14181D',
                border: `1px solid ${q.completed ? '#C6F13540' : '#23282F'}`,
                borderRadius: 16, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14, opacity: q.completed ? 0.7 : 1,
              }}>
                <ProgressRing value={pct} color={q.completed ? '#C6F135' : '#C6F135'} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{q.name}</div>
                  <div style={{ fontSize: 11, color: '#8A939C', marginTop: 3 }}>
                    {q.current} / {q.target} · +{q.xpReward} XP
                    {q.completed && <span style={{ color: '#C6F135', marginLeft: 8 }}>✓ Done</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {season.length > 0 && (
          <>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginBottom: 12 }}>SEASON GOAL</div>
            {season.map(q => {
              const pct = q.target > 0 ? (q.current / q.target) * 100 : 0;
              return (
                <div key={q.id} style={{
                  background: 'linear-gradient(135deg,#16181D,#131620)',
                  border: '1px solid #3CC5FF30',
                  borderRadius: 16, padding: '18px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <ProgressRing value={pct} color="#3CC5FF" size={52} strokeWidth={4} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{q.name}</div>
                    <div style={{ fontSize: 12, color: '#8A939C', marginTop: 3 }}>
                      {q.current} / {q.target} · +{q.xpReward} XP season reward
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <AppNav />
    </main>
  );
}
