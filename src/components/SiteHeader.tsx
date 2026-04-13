import { useState } from 'react'
import type { ReactNode } from 'react'

import { Languages, Monitor, MoonStar, SunMedium } from 'lucide-react'

type Theme = 'dark' | 'light'
type ThemeMode = Theme | 'system'
type Language = 'en' | 'pt'

type NavItem = {
  href: string
  icon: ReactNode
  id: string
  label: string
}

type SiteHeaderProps = {
  activeSection: string
  brandName: string
  brandRole: string
  language: Language
  links: NavItem[]
  onNavigate: (href: string) => void
  onSelectLanguage: (language: Language) => void
  onSelectTheme: (themeMode: ThemeMode) => void
  themeMode: ThemeMode
}

function BrandMark({ sizeClass }: { sizeClass: string }) {
  return (
    <span className={[sizeClass, 'inline-flex items-center justify-center overflow-hidden rounded-[12px]'].join(' ')}>
      <img
        alt="DevTech logo"
        aria-hidden="true"
        className="h-[145%] w-[145%] object-contain"
        src={`${import.meta.env.BASE_URL}logo.png`}
      />
    </span>
  )
}

function ThemeIcon({ effectiveTheme, themeMode }: { effectiveTheme: Theme; themeMode: ThemeMode }) {
  if (themeMode === 'system') return <Monitor className="h-5 w-5" strokeWidth={1.8} />
  if (effectiveTheme === 'dark') return <MoonStar className="h-5 w-5" strokeWidth={1.8} />
  return <SunMedium className="h-5 w-5" strokeWidth={1.8} />
}

function DesktopRailButton({
  expanded,
  href,
  icon,
  isActive,
  label,
  onBlur,
  onClick,
  onFocus,
  onMouseEnter,
  onMouseLeave,
}: {
  expanded: boolean
  href?: string
  icon: ReactNode
  isActive: boolean
  label: string
  onBlur?: () => void
  onClick: () => void
  onFocus?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const Component = href ? 'a' : 'button'

  return (
    <Component
      {...(href ? { href, onClick } : { onClick, type: 'button' as const })}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative flex h-14 items-center overflow-hidden rounded-[20px] border border-[color:var(--nav-border)] bg-[var(--nav-bg)] text-[color:var(--text-main)] shadow-[0_14px_40px_rgba(0,0,0,0.16)] transition-[width,background-color,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-line)]/55',
        expanded ? 'w-44' : 'w-14',
        isActive ? 'bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] text-white shadow-[0_0_28px_var(--accent-shadow)]' : '',
      ].join(' ')}
      onBlur={onBlur}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">{icon}</span>
      <span className={['min-w-max whitespace-nowrap pr-5 text-sm font-medium tracking-[0.08em] uppercase transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0'].join(' ')}>
        {label}
      </span>
    </Component>
  )
}

export function SiteHeader({
  activeSection,
  brandName,
  brandRole,
  language,
  links,
  onNavigate,
  onSelectLanguage,
  onSelectTheme,
  themeMode,
}: SiteHeaderProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const effectiveTheme: Theme =
    themeMode === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : themeMode

  const nextThemeMode: ThemeMode = themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system'

  return (
    <>
      <header className="hidden lg:block">
        <div className="fixed left-6 top-6 z-30 flex h-[calc(100vh-3rem)] flex-col justify-between py-2">
          <a className="flex h-16 w-72 items-center overflow-hidden rounded-[24px] border border-[color:var(--nav-border)] bg-[var(--nav-bg)] text-[color:var(--text-main)] shadow-[0_20px_48px_rgba(0,0,0,0.18)]" href="#home" onClick={() => onNavigate('#home')}>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center">
              <BrandMark sizeClass="h-[3.15rem] w-[3.15rem]" />
            </span>
            <span className="min-w-max whitespace-nowrap pr-6 opacity-100">
              <strong className="block whitespace-nowrap text-[0.95rem] font-semibold">{brandName}</strong>
              <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">{brandRole}</span>
            </span>
          </a>

          <nav aria-label="Navegacao principal" className="flex flex-col gap-3">
            {links.map((item) => (
              <DesktopRailButton
                expanded={expandedItem === item.id || activeSection === item.id}
                href={item.href}
                icon={item.icon}
                isActive={activeSection === item.id}
                key={item.id}
                label={item.label}
                onBlur={() => setExpandedItem((current) => (current === item.id ? null : current))}
                onClick={() => onNavigate(item.href)}
                onFocus={() => setExpandedItem(item.id)}
                onMouseEnter={() => setExpandedItem(item.id)}
                onMouseLeave={() => setExpandedItem((current) => (current === item.id ? null : current))}
              />
            ))}
          </nav>

          <DesktopRailButton
            expanded={expandedItem === 'theme'}
            icon={<ThemeIcon effectiveTheme={effectiveTheme} themeMode={themeMode} />}
            isActive
            label={themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
            onBlur={() => setExpandedItem((current) => (current === 'theme' ? null : current))}
            onClick={() => onSelectTheme(nextThemeMode)}
            onFocus={() => setExpandedItem('theme')}
            onMouseEnter={() => setExpandedItem('theme')}
            onMouseLeave={() => setExpandedItem((current) => (current === 'theme' ? null : current))}
          />
        </div>

        <div className="fixed bottom-8 right-6 z-30">
          <div className="inline-flex items-center gap-2 rounded-[20px] border border-[color:var(--nav-border)] bg-[var(--nav-bg)] px-3 py-2 text-[color:var(--text-main)] shadow-[0_18px_46px_rgba(0,0,0,0.16)]">
            <Languages size={14} />
            <button className={language === 'pt' ? 'text-[color:var(--accent-line)]' : 'text-[color:var(--text-soft)]'} onClick={() => onSelectLanguage('pt')} type="button">PT</button>
            <span className="text-[color:var(--text-muted)]">/</span>
            <button className={language === 'en' ? 'text-[color:var(--accent-line)]' : 'text-[color:var(--text-soft)]'} onClick={() => onSelectLanguage('en')} type="button">EN</button>
          </div>
        </div>
      </header>
    </>
  )
}
