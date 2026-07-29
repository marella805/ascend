import { ensureDb } from '@/lib/db/index';
import { getPRs } from '@/lib/db/queries';
import { AppNav } from '@/components/AppNav';

export default async function PRsPage() {
  await ensureDb();
  const prs = await getPRs();

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '20px 24px 104px' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginBottom: 4 }}>STRENGTH</div>
        <div className="font-oswald" style={{ fontSize: 28, marginBottom: 20 }}>Personal Records</div>

        {prs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#4A5260' }}>
            <i className="ph ph-barbell" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
            <div className="font-oswald" style={{ letterSpacing: '.14em', fontSize: 14 }}>LOG A SESSION TO SET YOUR FIRST PR</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prs.map((pr, i) => (
              <div
                key={pr.exerciseId}
                style={{
                  background: '#14181D', border: '1px solid #23282F', borderRadius: 14,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: i < 3 ? '#FF5A3C18' : '#23282F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="font-oswald" style={{ fontSize: 14, color: i < 3 ? '#FF5A3C' : '#4A5260' }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{pr.name}</div>
                  <div style={{ fontSize: 11, color: '#4A5260', marginTop: 2 }}>achieved {pr.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, color: '#FF5A3C', lineHeight: 1 }}>{pr.weightLb}</div>
                  <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>lb × {pr.reps}</div>
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
