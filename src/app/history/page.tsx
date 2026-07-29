export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/db/index';
import { getHistory } from '@/lib/db/queries';
import { AppNav } from '@/components/AppNav';

const MODALITY_COLORS: Record<string, string> = {
  strength: '#FF5A3C',
  endurance: '#3CC5FF',
  mobility: '#B57BFF',
};

const MODALITY_ICONS: Record<string, string> = {
  strength: 'ph-fill ph-barbell',
  endurance: 'ph-fill ph-heartbeat',
  mobility: 'ph-fill ph-person-simple-walk',
};

export default async function HistoryPage() {
  await ensureDb();
  const { sessions } = await getHistory();

  // Build heatmap: last 84 days (12 weeks)
  const today = new Date();
  const heatmapDays: Array<{ date: string; count: number }> = [];
  const sessionsByDate: Record<string, number> = {};

  for (const s of sessions as Array<Record<string, unknown>>) {
    const d = String(s.local_date);
    sessionsByDate[d] = (sessionsByDate[d] ?? 0) + 1;
  }

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    heatmapDays.push({ date: dateStr, count: sessionsByDate[dateStr] ?? 0 });
  }

  // Align to Monday
  const startDow = new Date(heatmapDays[0].date).getDay();
  const mondayOffset = (startDow + 6) % 7;
  const paddedDays = [
    ...Array.from({ length: mondayOffset }, () => ({ date: '', count: -1 })),
    ...heatmapDays,
  ];

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 24px 104px' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginTop: 6 }}>YOUR PROGRESS</div>
        <div className="font-oswald" style={{ fontSize: 24, marginBottom: 20, marginTop: 3 }}>HISTORY</div>

        {/* Heatmap */}
        <div style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '14px 14px', marginBottom: 16 }}>
          <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#8A939C', marginBottom: 10 }}>
            12-WEEK ACTIVITY
          </div>
          <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Day headers */}
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ width: 'calc(100% / 7 - 1px)', textAlign: 'center', fontSize: 8, color: '#4A5260', marginBottom: 2 }}>
                {d}
              </div>
            ))}
            {paddedDays.map((day, i) => {
              const opacity = day.count < 0 ? 0 : day.count === 0 ? 0.15 : Math.min(1, 0.4 + day.count * 0.3);
              const bg = day.count > 0 ? `rgba(198,241,53,${opacity})` : day.count === 0 ? '#23282F' : 'transparent';
              return (
                <div
                  key={i}
                  title={day.date ? `${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}` : ''}
                  style={{
                    width: 'calc(100% / 7 - 1px)', aspectRatio: '1',
                    background: bg, borderRadius: 2,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Session list */}
        <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#8A939C', marginBottom: 10 }}>
          RECENT SESSIONS
        </div>

        {sessions.length === 0 && (
          <div style={{ color: '#4A5260', fontSize: 13, padding: '16px 0' }}>
            No sessions logged yet. <a href="/log" style={{ color: '#C6F135', textDecoration: 'none' }}>Log your first session.</a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(sessions as Array<Record<string, unknown>>).slice(0, 20).map(session => {
            const modality = String(session.modality);
            const color = MODALITY_COLORS[modality] ?? '#8A939C';
            const icon = MODALITY_ICONS[modality] ?? 'ph ph-activity';
            const durationMin = session.duration_s ? Math.round(Number(session.duration_s) / 60) : null;
            const date = new Date(String(session.local_date) + 'T12:00:00');

            return (
              <div key={String(session.id)} style={{
                background: '#14181D', border: '1px solid #23282F',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ph ${icon}`} style={{ color, fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {session.title ? String(session.title) : `${modality.charAt(0).toUpperCase() + modality.slice(1)} Session`}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {durationMin && ` · ${durationMin} min`}
                    {Number(session.set_count) > 0 && ` · ${session.set_count} sets`}
                  </div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              </div>
            );
          })}
        </div>
      </div>
      <AppNav />
    </main>
  );
}
