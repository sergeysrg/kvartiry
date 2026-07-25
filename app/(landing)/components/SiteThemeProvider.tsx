import type { CSSProperties } from 'react';
import type { ThemeColors } from '@/app/types';

/** Прокидывает цвета темы площадки в CSS-переменные (--accent, --navy, --cta …). */
export function SiteThemeProvider({
  theme,
  children,
}: {
  theme: ThemeColors;
  children: React.ReactNode;
}) {
  const style = {
    '--accent': theme.accentColor,
    '--accent-dark': theme.accentDark,
    '--navy': theme.navyColor,
    '--navy-dark': theme.navyDark,
    '--cta': theme.ctaColor,
    '--cta-hover': theme.ctaHover,
  } as CSSProperties;

  return (
    <div className="landing" style={style}>
      {children}
    </div>
  );
}
