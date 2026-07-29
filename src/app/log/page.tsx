'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import { TEMPLATES, type TemplateKey } from '@/lib/templates';

type Exercise = {
  id: string;
  name: string;
  modality: string;
  default_unit: string;
  is_compound: number;
  movement_pattern: string | null;
  slug: string;
};

type LogSet = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  weight?: number;
  reps?: number;
  durationS?: number;
  distanceM?: number;
  isWarmup: boolean;
};

type Modality = 'strength' | 'endurance' | 'mobility';

type LastSetHint = {
  weightKg: number;
  reps: number;
  nextWeightLb: number;
  nextReps: number;
} | null;

function ulid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function kgToLb(kg: number) { return Math.round(kg * 2.20462 * 10) / 10; }

export default function LogPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'pick-modality' | 'pick-template' | 'logging'>('pick-modality');
  const [modality, setModality] = useState<Modality>('strength');
  const [template, setTemplate] = useState<TemplateKey>('free');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<LogSet[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [lastSetHint, setLastSetHint] = useState<LastSetHint>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'logging') return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [phase, startTime]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleModalitySelect = useCallback((m: Modality) => {
    setModality(m);
    if (m === 'strength') {
      setPhase('pick-template');
    } else {
      startLogging(m, 'free');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startLogging = useCallback(async (m: Modality, tKey: TemplateKey) => {
    setTemplate(tKey);
    const id = ulid();
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, modality: m, startedAt: new Date().toISOString(), localDate: localDate() }),
    });
    setSessionId(id);
    if (tKey !== 'free') {
      await fetch('/api/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey: tKey }),
      });
    }
    const res = await fetch(`/api/exercises?modality=${m}`);
    const data: Exercise[] = await res.json();
    setExercises(data);
    setPhase('logging');
  }, []);

  const handleExerciseSelect = useCallback(async (ex: Exercise) => {
    setActiveExercise(ex);
    setLastSetHint(null);
    const res = await fetch(`/api/exercises/${ex.id}/last-set`);
    if (res.ok) {
      const hint = await res.json();
      setLastSetHint(hint);
    }
  }, []);

  const addSetToSession = useCallback(async (set: LogSet) => {
    if (!sessionId) return;
    await fetch(`/api/session/${sessionId}/sets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: set.id,
        exerciseId: set.exerciseId,
        setIndex: set.setIndex,
        weightKg: set.weight ? (modality === 'strength' ? set.weight * 0.453592 : set.weight) : undefined,
        reps: set.reps,
        durationS: set.durationS,
        distanceM: set.distanceM ? set.distanceM * 1609.34 : undefined,
        isWarmup: set.isWarmup,
      }),
    });
    setSets(prev => [...prev, set]);
  }, [sessionId, modality]);

  const finishSession = useCallback(async () => {
    if (!sessionId || finishing) return;
    setFinishing(true);
    const res = await fetch(`/api/session/${sessionId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localDate: localDate() }),
    });
    const envelope = await res.json();
    sessionStorage.setItem(`reward-${sessionId}`, JSON.stringify(envelope));
    router.push(`/reward/${sessionId}`);
  }, [sessionId, finishing, router]);

  // ── Template filter for exercise list ──────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<TemplateKey | 'all'>('all');

  const getFilteredExercises = () => {
    let list = exercises;
    const filterKey = template !== 'free' && activeFilter === 'all' ? template : activeFilter;
    if (filterKey !== 'all' && filterKey !== 'free') {
      const tmpl = TEMPLATES[filterKey];
      list = exercises.filter(e =>
        (e.movement_pattern && tmpl.patterns.includes(e.movement_pattern)) ||
        tmpl.accessorySlugs.includes(e.slug)
      );
    }
    if (searchQuery) {
      list = list.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list.slice(0, 25);
  };

  // ── Phase: pick modality ───────────────────────────────────────────────────
  if (phase === 'pick-modality') {
    return <PickModality onSelect={handleModalitySelect} />;
  }

  // ── Phase: pick template ───────────────────────────────────────────────────
  if (phase === 'pick-template') {
    const pplKeys: TemplateKey[] = ['push', 'pull', 'legs'];
    const ulKeys: TemplateKey[] = ['upper', 'lower'];

    return (
      <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
        <div style={{ padding: '32px 24px' }}>
          <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginBottom: 4 }}>STRENGTH SESSION</div>
          <div className="font-oswald" style={{ fontSize: 26, marginBottom: 6 }}>What's the plan?</div>
          <div style={{ fontSize: 13, color: '#8A939C', marginBottom: 24 }}>Pick a split to see your target exercises, or go free-form.</div>

          <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260', marginBottom: 8 }}>PUSH / PULL / LEGS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {pplKeys.map(k => {
              const t = TEMPLATES[k];
              return (
                <button key={k} onClick={() => startLogging('strength', k)} style={{
                  background: '#14181D', border: '1px solid #23282F', borderRadius: 14,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ph ${t.icon}`} style={{ fontSize: 20, color: t.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-oswald" style={{ fontSize: 16 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>{t.patterns.join(', ')}</div>
                  </div>
                  <i className="ph ph-caret-right" style={{ color: '#4A5260', fontSize: 16 }} />
                </button>
              );
            })}
          </div>

          <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260', marginBottom: 8 }}>UPPER / LOWER</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ulKeys.map(k => {
              const t = TEMPLATES[k];
              return (
                <button key={k} onClick={() => startLogging('strength', k)} style={{
                  background: '#14181D', border: '1px solid #23282F', borderRadius: 14,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ph ${t.icon}`} style={{ fontSize: 20, color: t.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-oswald" style={{ fontSize: 16 }}>{t.name}</div>
                  </div>
                  <i className="ph ph-caret-right" style={{ color: '#4A5260', fontSize: 16 }} />
                </button>
              );
            })}
          </div>

          <button onClick={() => startLogging('strength', 'free')} style={{
            width: '100%', background: 'transparent', border: '1px solid #23282F',
            borderRadius: 14, padding: '14px 16px', color: '#8A939C',
            fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: '.06em',
          }}>
            SKIP — FREE WORKOUT
          </button>
        </div>
        <AppNav />
      </main>
    );
  }

  // ── Phase: logging ─────────────────────────────────────────────────────────
  if (phase === 'logging') {
    if (activeExercise) {
      const exerciseSets = sets.filter(s => s.exerciseId === activeExercise.id);
      return (
        <SetLogger
          exercise={activeExercise}
          modality={modality}
          previousSets={exerciseSets}
          lastSetHint={lastSetHint}
          onAdd={addSetToSession}
          onBack={() => { setActiveExercise(null); setLastSetHint(null); }}
        />
      );
    }

    const filtered = getFilteredExercises();
    const templateDef = template !== 'free' ? TEMPLATES[template] : null;
    const filterTabs: Array<{ key: TemplateKey | 'all'; label: string }> = templateDef
      ? [
          { key: 'all', label: 'All' },
          { key: template, label: templateDef.shortName },
        ]
      : [];

    return (
      <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
        <div style={{ padding: '16px 24px 120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C' }}>
                {templateDef ? templateDef.name.toUpperCase() : modality.toUpperCase() + ' SESSION'}
              </div>
              <div className="font-oswald" style={{ fontSize: 22 }}>{formatTime(elapsed)}</div>
            </div>
            <button
              onClick={finishSession}
              disabled={finishing || sets.length === 0}
              style={{
                background: sets.length > 0 ? '#C6F135' : '#23282F',
                color: sets.length > 0 ? '#0B0D10' : '#4A5260',
                borderRadius: 12, padding: '10px 18px',
                fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '.06em',
                opacity: finishing ? 0.6 : 1,
              }}
            >
              {finishing ? 'SAVING…' : 'FINISH'}
            </button>
          </div>

          {sets.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {Array.from(new Set(sets.map(s => s.exerciseId))).map(eid => {
                const exSets = sets.filter(s => s.exerciseId === eid);
                return (
                  <div key={eid} style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#8A939C', marginBottom: 4 }}>{exSets[0].exerciseName}</div>
                    {exSets.map((s, i) => (
                      <div key={s.id} style={{ fontSize: 13, color: '#F2F5F7', display: 'flex', gap: 8 }}>
                        <span style={{ color: s.isWarmup ? '#4A5260' : '#C6F135', minWidth: 20 }}>
                          {s.isWarmup ? 'W' : `${i + 1}`}
                        </span>
                        {s.weight && s.reps && <span>{s.weight} lb × {s.reps}</span>}
                        {s.durationS && <span>{Math.round(s.durationS / 60)} min</span>}
                        {s.distanceM && <span>{s.distanceM.toFixed(2)} mi</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', marginBottom: 8 }}>
            ADD EXERCISE
          </div>

          {filterTabs.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    borderRadius: 8, padding: '5px 12px', fontSize: 12,
                    fontFamily: "'Oswald',sans-serif", letterSpacing: '.08em',
                    background: activeFilter === tab.key ? '#C6F135' : '#14181D',
                    color: activeFilter === tab.key ? '#0B0D10' : '#8A939C',
                    border: '1px solid #23282F',
                  }}
                >
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Search exercises…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: '#14181D', border: '1px solid #23282F', borderRadius: 10,
              padding: '10px 14px', color: '#F2F5F7', fontSize: 14, marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleExerciseSelect(ex)}
                style={{
                  background: '#14181D', border: '1px solid #23282F', borderRadius: 10,
                  padding: '12px 14px', textAlign: 'left', color: '#F2F5F7', fontSize: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>{ex.name}</span>
                {Boolean(ex.is_compound) && (
                  <span style={{ fontSize: 9, color: '#C6F135', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>COMPOUND</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <AppNav />
      </main>
    );
  }

  return null;
}

function PickModality({ onSelect }: { onSelect: (m: Modality) => void }) {
  const options: Array<{ id: Modality; label: string; icon: string; color: string; desc: string }> = [
    { id: 'strength', label: 'Strength', icon: 'ph-bold ph-barbell', color: '#FF5A3C', desc: 'Sets, reps, weight' },
    { id: 'endurance', label: 'Cardio', icon: 'ph-bold ph-heartbeat', color: '#3CC5FF', desc: 'Distance, time, pace' },
    { id: 'mobility', label: 'Mobility', icon: 'ph-bold ph-person-simple-walk', color: '#B57BFF', desc: 'Stretching, yoga' },
  ];

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '32px 24px' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginBottom: 4 }}>LOG A SESSION</div>
        <div className="font-oswald" style={{ fontSize: 26, marginBottom: 28 }}>What are you training?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map(o => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{
                background: '#14181D', border: '1px solid #23282F', borderRadius: 16,
                padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 16,
                textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${o.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ph ${o.icon}`} style={{ fontSize: 24, color: o.color }} />
              </div>
              <div>
                <div className="font-oswald" style={{ fontSize: 18, letterSpacing: '.02em' }}>{o.label}</div>
                <div style={{ fontSize: 12, color: '#8A939C', marginTop: 2 }}>{o.desc}</div>
              </div>
              <i className="ph ph-caret-right" style={{ color: '#4A5260', fontSize: 18, marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      </div>
      <AppNav />
    </main>
  );
}

function SetLogger({
  exercise,
  modality,
  previousSets,
  lastSetHint,
  onAdd,
  onBack,
}: {
  exercise: Exercise;
  modality: Modality;
  previousSets: LogSet[];
  lastSetHint: LastSetHint;
  onAdd: (set: LogSet) => Promise<void>;
  onBack: () => void;
}) {
  const workingSets = previousSets.filter(s => !s.isWarmup);
  const lastSet = workingSets[workingSets.length - 1];

  const [weight, setWeight] = useState(lastSet?.weight?.toString() ?? '');
  const [reps, setReps] = useState(lastSet?.reps?.toString() ?? '');
  const [minutes, setMinutes] = useState('');
  const [miles, setMiles] = useState('');
  const [isWarmup, setIsWarmup] = useState(false);
  const [adding, setAdding] = useState(false);

  const canAdd = modality === 'strength'
    ? (weight !== '' && reps !== '')
    : modality === 'endurance'
    ? (minutes !== '' || miles !== '')
    : minutes !== '';

  const handleAdd = async () => {
    if (!canAdd || adding) return;
    setAdding(true);
    const setIndex = previousSets.length;
    await onAdd({
      id: ulid(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setIndex,
      weight: weight ? Number(weight) : undefined,
      reps: reps ? Number(reps) : undefined,
      durationS: minutes ? Number(minutes) * 60 : undefined,
      distanceM: miles ? Number(miles) : undefined,
      isWarmup,
    });
    setAdding(false);
    if (modality === 'strength') {
      setReps('');
    }
  };

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 24px 120px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A939C', marginBottom: 16 }}>
          <i className="ph ph-caret-left" style={{ fontSize: 18 }} />
          <span style={{ fontSize: 13 }}>Back to exercises</span>
        </button>

        <div className="font-oswald" style={{ fontSize: 22, marginBottom: 4 }}>{exercise.name}</div>

        {/* Last session target hint */}
        {lastSetHint && previousSets.length === 0 && (
          <div style={{
            background: '#0F1A10', border: '1px solid #C6F13530', borderRadius: 10,
            padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <i className="ph ph-arrow-up-right" style={{ color: '#C6F135', fontSize: 16, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: '#8A939C' }}>
                Last: {kgToLb(lastSetHint.weightKg)} lb × {lastSetHint.reps}
              </div>
              <div style={{ fontSize: 13, color: '#C6F135', fontFamily: "'Oswald',sans-serif" }}>
                Target: {lastSetHint.nextWeightLb} lb × {lastSetHint.nextReps}
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: '#8A939C', marginBottom: 20 }}>
          {previousSets.length} set{previousSets.length !== 1 ? 's' : ''} logged this session
        </div>

        {previousSets.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {previousSets.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', gap: 10, fontSize: 13, color: s.isWarmup ? '#4A5260' : '#F2F5F7' }}>
                <span style={{ minWidth: 20, color: s.isWarmup ? '#4A5260' : '#C6F135' }}>
                  {s.isWarmup ? 'W' : `${i + 1}`}
                </span>
                {s.weight && s.reps && <span>{s.weight} lb × {s.reps}</span>}
                {s.durationS && <span>{Math.round(s.durationS / 60)} min</span>}
                {s.distanceM && <span>{s.distanceM} mi</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {modality === 'strength' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", display: 'block', marginBottom: 6 }}>
                    WEIGHT (lb)
                  </label>
                  <input
                    type="number" inputMode="decimal" placeholder="0"
                    value={weight} onChange={e => setWeight(e.target.value)}
                    style={{
                      width: '100%', background: '#0B0D10', border: '1px solid #2D3540', borderRadius: 8,
                      padding: '12px 12px', color: '#F2F5F7', fontSize: 20, fontFamily: "'Oswald',sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", display: 'block', marginBottom: 6 }}>
                    REPS
                  </label>
                  <input
                    type="number" inputMode="numeric" placeholder="0"
                    value={reps} onChange={e => setReps(e.target.value)}
                    style={{
                      width: '100%', background: '#0B0D10', border: '1px solid #2D3540', borderRadius: 8,
                      padding: '12px 12px', color: '#F2F5F7', fontSize: 20, fontFamily: "'Oswald',sans-serif",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsWarmup(v => !v)}
                style={{
                  background: isWarmup ? '#23282F' : 'transparent', border: '1px solid #23282F',
                  borderRadius: 8, padding: '8px 14px', color: isWarmup ? '#F2F5F7' : '#4A5260',
                  fontSize: 12, fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em',
                  alignSelf: 'flex-start',
                }}
              >
                {isWarmup ? '✓ WARM-UP' : 'MARK AS WARM-UP'}
              </button>
            </>
          )}

          {modality === 'endurance' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", display: 'block', marginBottom: 6 }}>
                  DURATION (min)
                </label>
                <input
                  type="number" inputMode="decimal" placeholder="30"
                  value={minutes} onChange={e => setMinutes(e.target.value)}
                  style={{
                    width: '100%', background: '#0B0D10', border: '1px solid #2D3540', borderRadius: 8,
                    padding: '12px 12px', color: '#F2F5F7', fontSize: 20, fontFamily: "'Oswald',sans-serif",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", display: 'block', marginBottom: 6 }}>
                  DISTANCE (mi)
                </label>
                <input
                  type="number" inputMode="decimal" placeholder="3.1"
                  value={miles} onChange={e => setMiles(e.target.value)}
                  style={{
                    width: '100%', background: '#0B0D10', border: '1px solid #2D3540', borderRadius: 8,
                    padding: '12px 12px', color: '#F2F5F7', fontSize: 20, fontFamily: "'Oswald',sans-serif",
                  }}
                />
              </div>
            </div>
          )}

          {modality === 'mobility' && (
            <div>
              <label style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', fontFamily: "'Oswald',sans-serif", display: 'block', marginBottom: 6 }}>
                DURATION (min)
              </label>
              <input
                type="number" inputMode="decimal" placeholder="30"
                value={minutes} onChange={e => setMinutes(e.target.value)}
                style={{
                  width: '100%', background: '#0B0D10', border: '1px solid #2D3540', borderRadius: 8,
                  padding: '12px 12px', color: '#F2F5F7', fontSize: 20, fontFamily: "'Oswald',sans-serif",
                }}
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!canAdd || adding}
            style={{
              width: '100%', background: canAdd ? '#C6F135' : '#23282F', color: canAdd ? '#0B0D10' : '#4A5260',
              borderRadius: 12, height: 52,
              fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '.06em',
              opacity: adding ? 0.6 : 1,
            }}
          >
            {adding ? 'ADDING…' : '+ LOG SET'}
          </button>
        </div>
      </div>
    </main>
  );
}
