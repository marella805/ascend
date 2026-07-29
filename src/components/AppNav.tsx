'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', icon: 'ph ph-user', label: 'SELF' },
  { href: '/log', icon: 'ph ph-plus-circle', label: 'LOG' },
  { href: '/prs', icon: 'ph ph-barbell', label: 'PRs' },
  { href: '/quests', icon: 'ph ph-target', label: 'QUESTS' },
  { href: '/history', icon: 'ph ph-chart-bar', label: 'HISTORY' },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(11,13,16,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid #23282F',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {LINKS.map(l => {
        const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, color: active ? '#C6F135' : '#4A5260',
              textDecoration: 'none', padding: '4px 16px',
              transition: 'color 0.15s',
            }}
          >
            <i className={l.icon} style={{ fontSize: 22 }} />
            <span style={{ fontSize: 9, fontFamily: "'Oswald', sans-serif", letterSpacing: '.14em' }}>
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
