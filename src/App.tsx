import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AppWindow, Bot, Building2, Code2, Cpu, Headset, LifeBuoy, MonitorCog, ServerCog, ShieldCheck, Sparkles, UserRoundCog, Workflow } from 'lucide-react'
import { Button, Card, GlassPanel, Input, SectionLabel, SiteBackground, Tag, Textarea } from 'auralith-ui'

import { SiteHeader } from './components/SiteHeader'

type Language = 'en' | 'pt'
type ThemeMode = 'dark' | 'light' | 'system'
type FormStatus = { type: 'idle' | 'success' | 'error'; message: string }

const LANGUAGE_STORAGE_KEY = 'devtech:language'
const THEME_STORAGE_KEY = 'devtech:theme'
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || ''
const formSubmitToken = import.meta.env.VITE_FORMSUBMIT_TOKEN?.trim()
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabaseContactFunction = import.meta.env.VITE_SUPABASE_CONTACT_FUNCTION?.trim() || 'contact-lead'

function formatPhoneMask(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const dictionary = {
  pt: {
    menu: {
      home: 'Inicio',
      services: 'Servicos',
      supportTi: 'Suporte TI',
      method: 'Metodo',
      contact: 'Contato',
      descHome: 'Visao geral da DevTech',
      descServices: 'Software e suporte tecnico',
      descMethod: 'Nosso fluxo de execucao',
      descContact: 'Solicite uma proposta',
      language: 'Idioma',
      theme: 'Tema',
      account: 'Conta',
      project: 'Projeto DevTech',
    },
    hero: {
      title: 'Software Solutions e Suporte Tecnico para Operacoes Criticas',
      subtitle: 'A DevTech combina desenvolvimento sob medida com suporte tecnico recorrente para reduzir paradas, acelerar entregas e dar previsibilidade para sua operacao.',
      ctaPrimary: 'Solicitar diagnostico',
      ctaSecondary: 'Falar com especialista',
    },
    metrics: [
      ['tempo de resposta', '30 min', 'SLA para chamados urgentes em horario comercial.'],
      ['entrega continua', '+40', 'Melhorias tecnicas por trimestre em media por cliente ativo.'],
      ['cobertura', '360o', 'Software, suporte, processos e governanca tecnica no mesmo parceiro.'],
    ],
    servicesHeader: 'Solucao tecnica para software e suporte',
    servicesTag: 'foco em resultado operacional',
    solutions: {
      title: 'Solucoes para software e informatica no seu negocio',
      subtitle: 'Organizei em duas frentes para ficar claro: desenvolvimento de produto e suporte tecnico de operacao.',
    },
    development: {
      eyebrow: 'desenvolvimento',
      title: 'Solucoes que posso desenvolver para o seu negocio ou produto',
      cards: [
        {
          title: 'Full stack',
          description: 'Plataformas web sob medida com front moderno, API organizada e experiencia clara para o usuario.',
          bullets: ['Arquitetura escalavel', 'Fluxos claros', 'Entrega responsiva'],
        },
        {
          title: 'Dados e automacao',
          description: 'Dashboards, formularios inteligentes e integracoes para transformar processos em fluxos simples.',
          bullets: ['Visao operacional', 'Integracoes conectadas', 'Automacao de tarefas'],
        },
        {
          title: 'UI engineering',
          description: 'Interfaces responsivas para desktop e mobile com desempenho, consistencia visual e navegacao objetiva.',
          bullets: ['Performance visual', 'Consistencia mobile', 'Navegacao objetiva'],
        },
      ],
    },
    support: {
      eyebrow: 'informatica',
      title: 'Servicos de informatica para manter sua operacao estavel',
      cards: [
        {
          title: 'Suporte tecnico recorrente',
          description: 'Atendimento remoto e presencial para usuarios, maquinas, perifericos e rotina operacional.',
          bullets: ['Help desk ativo', 'Atendimento rapido', 'Padrao de operacao'],
        },
        {
          title: 'Infraestrutura e redes',
          description: 'Configuracao e manutencao de rede, servidores e recursos para reduzir interrupcoes no dia a dia.',
          bullets: ['Rede organizada', 'Servidores monitorados', 'Capacidade planejada'],
        },
        {
          title: 'Seguranca e continuidade',
          description: 'Backup, controle de acesso e rotina preventiva para proteger dados e manter disponibilidade.',
          bullets: ['Backup confiavel', 'Acesso seguro', 'Continuidade operacional'],
        },
      ],
    },
    supportSection: {
      eyebrow: 'suporte de ti',
      title: 'Suporte remoto e presencial para sua equipe',
      subtitle: 'Organizamos dois formatos de atendimento para cobrir incidentes rapidos e demandas de infraestrutura local.',
      remote: {
        title: 'Suporte remoto',
        description: 'Atendimento rapido para incidentes operacionais, ajustes de sistema, acesso, e orientacao de usuarios sem deslocamento.',
        bullets: ['Resposta agil', 'Acesso remoto seguro', 'Acompanhamento continuo'],
        sla: 'SLA remoto: ate 30 min',
        window: 'Janela: seg-sex, 08h as 18h',
      },
      onsite: {
        title: 'Suporte presencial',
        description: 'Visitas tecnicas para rede local, estacoes de trabalho, servidores e ajustes fisicos que exigem atuacao no local.',
        bullets: ['Visita tecnica planejada', 'Infraestrutura local', 'Padronizacao de ambiente'],
        sla: 'Agendamento presencial: ate 24h',
        window: 'Janela: comercial ou plantao sob demanda',
      },
      ctaPrimary: 'Abrir chamado',
      ctaSecondary: 'Agendar visita tecnica',
    },
    methodTitle: 'Metodo claro para reduzir incidentes e acelerar entregas',
    methodSteps: [
      ['1. Diagnostico tecnico', 'Mapeamento do ambiente, gargalos e pontos de risco.'],
      ['2. Plano de acao', 'Roadmap com prioridades, SLA e melhorias de curto prazo.'],
      ['3. Execucao assistida', 'Suporte continuo, manutencao e evolucao dos sistemas.'],
    ],
    contact: {
      title: 'Receba uma proposta para software e suporte',
      name: 'Nome',
      namePlaceholder: 'Seu nome',
      email: 'Email corporativo',
      emailPlaceholder: 'contato@empresa.com',
      phone: 'Telefone',
      phonePlaceholder: '(11) 99999-9999',
      subject: 'Assunto',
      subjectPlaceholder: 'Ex.: Suporte mensal e sistema interno',
      message: 'Descreva sua necessidade',
      messagePlaceholder: 'Ex.: suporte de TI, sistema interno, automacao de atendimento...',
      send: 'Enviar briefing',
      schedule: 'Agendar reuniao',
      submitting: 'Enviando contato...',
      success: 'Mensagem enviada com sucesso. Em breve retornaremos.',
      error: 'Nao foi possivel enviar agora. Tente novamente em instantes.',
      missing: 'Configure VITE_CONTACT_EMAIL ou variaveis do Supabase para receber contatos.',
    },
    badges: ['suporte confiavel', 'software customizado', 'melhoria continua'],
  },
  en: {
    menu: {
      home: 'Home',
      services: 'Services',
      supportTi: 'IT Support',
      method: 'Method',
      contact: 'Contact',
      descHome: 'DevTech overview',
      descServices: 'Software and support services',
      descMethod: 'Our delivery flow',
      descContact: 'Request a proposal',
      language: 'Language',
      theme: 'Theme',
      account: 'Account',
      project: 'DevTech project',
    },
    hero: {
      title: 'Software Solutions and Technical Support for Critical Operations',
      subtitle: 'DevTech combines custom software delivery with recurring technical support to reduce downtime, accelerate execution, and add operational predictability.',
      ctaPrimary: 'Request assessment',
      ctaSecondary: 'Talk to a specialist',
    },
    metrics: [
      ['response time', '30 min', 'SLA for urgent support tickets during business hours.'],
      ['continuous delivery', '+40', 'Technical improvements per quarter on average for each active client.'],
      ['coverage', '360o', 'Software, support, process, and governance under one partner.'],
    ],
    servicesHeader: 'Technical solutions for software and IT support',
    servicesTag: 'focused on operational results',
    solutions: {
      title: 'Solutions across software and IT operations',
      subtitle: 'I split this into two clear fronts: product/software delivery and technical IT support.',
    },
    development: {
      eyebrow: 'development',
      title: 'Solutions I can build for your business or product',
      cards: [
        {
          title: 'Full stack',
          description: 'Custom web platforms with modern front-end, organized APIs, and clear user experience.',
          bullets: ['Scalable architecture', 'Clear user flows', 'Responsive delivery'],
        },
        {
          title: 'Data and automation',
          description: 'Dashboards, smart forms, and integrations to turn manual processes into simple flows.',
          bullets: ['Operational visibility', 'Connected integrations', 'Task automation'],
        },
        {
          title: 'UI engineering',
          description: 'Responsive interfaces for desktop and mobile with performance, consistency, and objective navigation.',
          bullets: ['Visual performance', 'Mobile consistency', 'Objective navigation'],
        },
      ],
    },
    support: {
      eyebrow: 'it support',
      title: 'IT services to keep your operation stable',
      cards: [
        {
          title: 'Recurring technical support',
          description: 'Remote and on-site support for users, workstations, peripherals, and daily operations.',
          bullets: ['Active help desk', 'Fast response', 'Operational standards'],
        },
        {
          title: 'Infrastructure and network',
          description: 'Network and server setup plus maintenance to reduce downtime and bottlenecks.',
          bullets: ['Organized network', 'Monitored servers', 'Planned capacity'],
        },
        {
          title: 'Security and continuity',
          description: 'Backups, access control, and preventive routines to protect data and keep systems available.',
          bullets: ['Reliable backup', 'Secure access', 'Business continuity'],
        },
      ],
    },
    supportSection: {
      eyebrow: 'it support',
      title: 'Remote and on-site support for your team',
      subtitle: 'We structure two service formats to cover quick incidents and local infrastructure needs.',
      remote: {
        title: 'Remote support',
        description: 'Fast assistance for operational incidents, system adjustments, access issues, and user guidance without travel.',
        bullets: ['Fast response', 'Secure remote access', 'Continuous follow-up'],
        sla: 'Remote SLA: up to 30 min',
        window: 'Support window: Mon-Fri, 8am to 6pm',
      },
      onsite: {
        title: 'On-site support',
        description: 'Technical visits for local network, workstations, servers, and physical setup tasks that require in-person execution.',
        bullets: ['Planned technical visit', 'Local infrastructure', 'Environment standardization'],
        sla: 'On-site scheduling: up to 24h',
        window: 'Window: business hours or on-demand duty',
      },
      ctaPrimary: 'Open support ticket',
      ctaSecondary: 'Schedule on-site visit',
    },
    methodTitle: 'A clear method to reduce incidents and accelerate delivery',
    methodSteps: [
      ['1. Technical diagnosis', 'Assessment of environment, bottlenecks, and risk points.'],
      ['2. Action plan', 'Roadmap with priorities, SLA, and short-term improvements.'],
      ['3. Assisted execution', 'Ongoing support, maintenance, and system evolution.'],
    ],
    contact: {
      title: 'Get a proposal for software and support',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Business email',
      emailPlaceholder: 'contact@company.com',
      phone: 'Phone',
      phonePlaceholder: '+1 (555) 123-4567',
      subject: 'Subject',
      subjectPlaceholder: 'e.g. Monthly support and internal platform',
      message: 'Describe your needs',
      messagePlaceholder: 'Ex.: IT support, internal systems, service automation...',
      send: 'Send brief',
      schedule: 'Schedule meeting',
      submitting: 'Sending your message...',
      success: 'Message sent successfully. We will reach out soon.',
      error: 'Unable to send right now. Please try again shortly.',
      missing: 'Set VITE_CONTACT_EMAIL or Supabase variables to receive contact requests.',
    },
    badges: ['reliable support', 'custom software', 'continuous improvement'],
  },
} as const

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'pt'
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'pt' || stored === 'en') return stored
  return window.navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'dark'
}

function getInitialSection() {
  if (typeof window === 'undefined') return 'home'
  return window.location.hash.replace('#', '') || 'home'
}

function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches

  if (mode === 'light' || (mode === 'system' && prefersLight)) {
    root.setAttribute('data-theme', 'light')
    return
  }

  root.removeAttribute('data-theme')
}

function App() {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage())
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialTheme())
  const [activeSection, setActiveSection] = useState(() => getInitialSection())
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const text = dictionary[language]
  const [contactStatus, setContactStatus] = useState<FormStatus>({
    type: 'idle',
    message: text.contact.missing,
  })

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    applyThemeMode(themeMode)

    if (themeMode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = () => applyThemeMode('system')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [themeMode])

  useEffect(() => {
    function handleHashChange() {
      setActiveSection(window.location.hash.replace('#', '') || 'home')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    setContactStatus((current) => (current.type === 'idle' ? { type: 'idle', message: text.contact.missing } : current))
  }, [text.contact.missing])

  async function submitViaSupabase(formData: FormData) {
    if (!supabaseUrl || !supabasePublishableKey) return false

    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      subject: String(formData.get('subject') || ''),
      message: String(formData.get('message') || ''),
      source: 'devtech',
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${supabaseContactFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabasePublishableKey}`,
        apikey: supabasePublishableKey,
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  }

  async function submitViaFormSubmit(formData: FormData) {
    const formSubmitEndpoint = formSubmitToken
      ? `https://formsubmit.co/ajax/${formSubmitToken}`
      : contactEmail
        ? `https://formsubmit.co/ajax/${contactEmail}`
        : ''

    if (!formSubmitEndpoint) return false

    const response = await fetch(formSubmitEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })

    return response.ok
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!contactEmail && (!supabaseUrl || !supabasePublishableKey)) {
      setContactStatus({ type: 'error', message: text.contact.missing })
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    setIsSubmittingContact(true)
    setContactStatus({ type: 'idle', message: text.contact.submitting })

    try {
      const sentViaSupabase = await submitViaSupabase(formData)
      const sentViaFormSubmit = (contactEmail || formSubmitToken) ? await submitViaFormSubmit(formData) : false

      if (!sentViaSupabase && !sentViaFormSubmit) {
        throw new Error('submit-failed')
      }

      form.reset()
      setContactStatus({ type: 'success', message: text.contact.success })
    } catch {
      setContactStatus({ type: 'error', message: text.contact.error })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  function navigateToHash(nextHash: string) {
    const hash = nextHash.startsWith('#') ? nextHash : `#${nextHash}`
    const id = hash.replace('#', '')
    const element = document.getElementById(id)
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
    setActiveSection(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const headerLinks = useMemo(
    () => [
      {
        id: 'home',
        label: text.menu.home,
        icon: <Cpu size={16} />,
        href: '#home',
      },
      {
        id: 'services',
        label: text.menu.services,
        icon: <Workflow size={16} />,
        href: '#services',
      },
      {
        id: 'method',
        label: text.menu.method,
        icon: <UserRoundCog size={16} />,
        href: '#method',
      },
      {
        id: 'support-ti',
        label: text.menu.supportTi,
        icon: <Headset size={16} />,
        href: '#support-ti',
      },
      {
        id: 'contact',
        label: text.menu.contact,
        icon: <LifeBuoy size={16} />,
        href: '#contact',
      },
    ],
    [text],
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)] text-[color:var(--text-main)]">
      <SiteBackground
        settings={{
          showDiffuse: true,
          showGrid: true,
          intensity: 'soft',
          gridStyle: 'orthogonal',
        }}
      />

      <SiteHeader
        activeSection={activeSection}
        brandName="DevTech"
        brandRole="Tech Support & Software Solutions"
        language={language}
        links={headerLinks}
        onNavigate={navigateToHash}
        onSelectLanguage={setLanguage}
        onSelectTheme={setThemeMode}
        themeMode={themeMode}
      />

      <div className="relative min-h-screen w-full">
        <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center gap-12 px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-28 lg:pb-8">
          <GlassPanel className="relative w-full max-w-[980px] overflow-hidden border border-[color:var(--card-border)] bg-[color:var(--surface-panel-1)] p-6 sm:p-10" id="home">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(111,224,255,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[rgba(104,126,255,0.12)] blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="mx-auto flex w-full max-w-[460px] items-center justify-center border-[rgba(111,224,255,0.22)] bg-[rgba(8,16,40,0.55)] p-6" variant="elevated">
                <div className="relative flex w-full max-w-[360px] items-center justify-center">
                  <img
                    alt="DevTech logo"
                    className="h-auto w-full object-contain drop-shadow-[0_0_20px_rgba(111,224,255,0.28)]"
                    src={`${import.meta.env.BASE_URL}logo.png`}
                  />

                  <div className="absolute bottom-[-45px] left-1/2 w-max -translate-x-1/2">
                    <p className="text-center font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[2.7rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                      Dev<span className="bg-[linear-gradient(90deg,#22d6ff_0%,#4a86ff_45%,#d45cff_100%)] bg-clip-text text-transparent">Tech</span>
                    </p>
                    <p className="-mt-0.5 text-center text-[0.7rem] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Tech Support & Software Solutions</p>
                  </div>
                </div>
              </Card>

              <div className="text-center lg:text-left">
                <Tag className="border-[rgba(111,224,255,0.2)] bg-[rgba(111,224,255,0.06)] text-[color:var(--accent-line)]">DevTech</Tag>
                <h1 className="mt-4 font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[color:var(--text-main)]">
                  {text.hero.title}
                </h1>
                <p className="mx-auto mt-4 max-w-[650px] text-[1rem] leading-7 text-[color:var(--text-soft)] sm:text-[1.08rem] lg:mx-0">
                  {text.hero.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  <Button onClick={() => navigateToHash('#contact')}>{text.hero.ctaPrimary}</Button>
                  <Button onClick={() => navigateToHash('#contact')} variant="secondary">{text.hero.ctaSecondary}</Button>
                </div>
              </div>
            </div>
          </GlassPanel>

          <section className="grid w-full max-w-[980px] gap-4 sm:grid-cols-3">
            {text.metrics.map((metric) => (
              <Card className="p-4" key={metric[0]} variant="subtle">
                <SectionLabel>{metric[0]}</SectionLabel>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text-main)]">{metric[1]}</p>
                <p className="mt-1 text-sm text-[color:var(--text-soft)]">{metric[2]}</p>
              </Card>
            ))}
          </section>

          <section className="grid w-full max-w-[980px] gap-5" id="services">
            <div className="text-center lg:text-left">
              <SectionLabel>{language === 'pt' ? 'o que fazemos' : 'what we do'}</SectionLabel>
              <h2 className="mt-2 font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[clamp(1.8rem,3.3vw,2.4rem)] font-semibold tracking-[-0.03em] text-[color:var(--text-main)]">
                {text.solutions.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-7 text-[color:var(--text-soft)]">{text.solutions.subtitle}</p>
            </div>

            <GlassPanel className="border border-[color:var(--card-border)] bg-[color:var(--surface-panel-1)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="border-[rgba(139,102,255,0.28)] bg-[rgba(139,102,255,0.08)] text-[color:var(--text-main)]">{text.development.eyebrow}</Tag>
              </div>
              <h3 className="mb-4 font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[1.35rem] font-semibold tracking-[-0.02em] text-[color:var(--text-main)]">
                {text.development.title}
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {[Code2, AppWindow, Bot].map((Icon, index) => (
                  <Card className="h-full p-4" key={text.development.cards[index].title} variant="subtle">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgba(139,102,255,0.3)] bg-[rgba(139,102,255,0.09)] text-[color:var(--text-main)]">
                      <Icon size={17} />
                    </span>
                    <h4 className="mt-3 text-[1rem] font-semibold text-[color:var(--text-main)]">{text.development.cards[index].title}</h4>
                    <p className="mt-1.5 text-[0.86rem] leading-6 text-[color:var(--text-soft)]">{text.development.cards[index].description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {text.development.cards[index].bullets.map((bullet) => (
                        <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[0.65rem]" key={bullet}>{bullet}</Tag>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="border border-[color:var(--card-border)] bg-[color:var(--surface-panel-1)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="border-[rgba(111,224,255,0.2)] bg-[rgba(111,224,255,0.06)] text-[color:var(--accent-line)]">{text.support.eyebrow}</Tag>
              </div>
              <h3 className="mb-4 font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[1.35rem] font-semibold tracking-[-0.02em] text-[color:var(--text-main)]">
                {text.support.title}
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {[MonitorCog, ShieldCheck, ServerCog].map((Icon, index) => (
                  <Card className="h-full p-4" key={text.support.cards[index].title} variant="subtle">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgba(111,224,255,0.25)] bg-[rgba(111,224,255,0.08)] text-[color:var(--accent-line)]">
                      <Icon size={17} />
                    </span>
                    <h4 className="mt-3 text-[1rem] font-semibold text-[color:var(--text-main)]">{text.support.cards[index].title}</h4>
                    <p className="mt-1.5 text-[0.86rem] leading-6 text-[color:var(--text-soft)]">{text.support.cards[index].description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {text.support.cards[index].bullets.map((bullet) => (
                        <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[0.65rem]" key={bullet}>{bullet}</Tag>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </GlassPanel>
          </section>

          <section className="grid w-full max-w-[980px] gap-5" id="support-ti">
            <div className="text-center lg:text-left">
              <SectionLabel>{text.supportSection.eyebrow}</SectionLabel>
              <h2 className="mt-2 font-[Space_Grotesk,Trebuchet_MS,sans-serif] text-[clamp(1.8rem,3.3vw,2.4rem)] font-semibold tracking-[-0.03em] text-[color:var(--text-main)]">
                {text.supportSection.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-7 text-[color:var(--text-soft)]">{text.supportSection.subtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-full p-5" variant="elevated">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(111,224,255,0.25)] bg-[rgba(111,224,255,0.08)] text-[color:var(--accent-line)]">
                  <Headset size={18} />
                </span>
                <h3 className="mt-4 text-[1.15rem] font-semibold text-[color:var(--text-main)]">{text.supportSection.remote.title}</h3>
                <p className="mt-2 text-[0.9rem] leading-6 text-[color:var(--text-soft)]">{text.supportSection.remote.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Tag className="border-[rgba(121,242,192,0.25)] bg-[rgba(121,242,192,0.08)] text-[#79f2c0] text-[0.65rem]">{text.supportSection.remote.sla}</Tag>
                  <Tag className="border-[rgba(111,224,255,0.2)] bg-[rgba(111,224,255,0.06)] text-[color:var(--accent-line)] text-[0.65rem]">{text.supportSection.remote.window}</Tag>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {text.supportSection.remote.bullets.map((bullet) => (
                    <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[0.65rem]" key={bullet}>{bullet}</Tag>
                  ))}
                </div>
              </Card>

              <Card className="h-full p-5" variant="elevated">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(139,102,255,0.28)] bg-[rgba(139,102,255,0.09)] text-[color:var(--text-main)]">
                  <Building2 size={18} />
                </span>
                <h3 className="mt-4 text-[1.15rem] font-semibold text-[color:var(--text-main)]">{text.supportSection.onsite.title}</h3>
                <p className="mt-2 text-[0.9rem] leading-6 text-[color:var(--text-soft)]">{text.supportSection.onsite.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Tag className="border-[rgba(121,242,192,0.25)] bg-[rgba(121,242,192,0.08)] text-[#79f2c0] text-[0.65rem]">{text.supportSection.onsite.sla}</Tag>
                  <Tag className="border-[rgba(139,102,255,0.22)] bg-[rgba(139,102,255,0.08)] text-[color:var(--text-main)] text-[0.65rem]">{text.supportSection.onsite.window}</Tag>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {text.supportSection.onsite.bullets.map((bullet) => (
                    <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[0.65rem]" key={bullet}>{bullet}</Tag>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              <Button onClick={() => navigateToHash('#contact')}>{text.supportSection.ctaPrimary}</Button>
              <Button onClick={() => navigateToHash('#contact')} variant="secondary">{text.supportSection.ctaSecondary}</Button>
            </div>
          </section>

          <section className="grid w-full max-w-[980px] gap-4 lg:grid-cols-[1.05fr_0.95fr]" id="method">
            <GlassPanel className="border border-[color:var(--card-border)] bg-[color:var(--surface-panel-1)] p-6">
              <SectionLabel>{language === 'pt' ? 'como atuamos' : 'how we operate'}</SectionLabel>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[color:var(--text-main)]">{text.methodTitle}</h2>
              <div className="mt-5 grid gap-3">
                {text.methodSteps.map((step) => (
                  <Card className="p-3" key={step[0]} variant="subtle">
                    <p className="font-medium text-[color:var(--text-main)]">{step[0]}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-soft)]">{step[1]}</p>
                  </Card>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="border border-[color:var(--card-border)] bg-[color:var(--surface-panel-1)] p-6" id="contact">
              <SectionLabel>{language === 'pt' ? 'contato rapido' : 'quick contact'}</SectionLabel>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[color:var(--text-main)]">{text.contact.title}</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleContactSubmit}>
                <input name="_subject" type="hidden" value="[DevTech] Novo contato do landing" />
                <input name="_captcha" type="hidden" value="false" />
                <input name="_template" type="hidden" value="table" />

                <Input label={text.contact.name} name="name" placeholder={text.contact.namePlaceholder} required />
                <Input label={text.contact.email} name="email" placeholder={text.contact.emailPlaceholder} required type="email" />
                <Input
                  label={text.contact.phone}
                  name="phone"
                  onInput={(event) => {
                    const input = event.currentTarget
                    input.value = formatPhoneMask(input.value)
                  }}
                  pattern="\(\d{2}\)\s\d{4,5}-\d{4}"
                  placeholder={text.contact.phonePlaceholder}
                  required
                  type="tel"
                />
                <Input label={text.contact.subject} name="subject" placeholder={text.contact.subjectPlaceholder} required />
                <Textarea label={text.contact.message} name="message" placeholder={text.contact.messagePlaceholder} required rows={4} />

                <div className="flex flex-wrap items-center gap-2">
                  <Button disabled={isSubmittingContact} type="submit">{isSubmittingContact ? text.contact.submitting : text.contact.send}</Button>
                  <Button onClick={() => navigateToHash('#contact')} type="button" variant="secondary">{text.contact.schedule}</Button>
                </div>

                <p
                  className={[
                    'text-sm',
                    contactStatus.type === 'success'
                      ? 'text-emerald-300'
                      : contactStatus.type === 'error'
                        ? 'text-rose-300'
                        : 'text-[color:var(--text-muted)]',
                  ].join(' ')}
                >
                  {contactStatus.message}
                </p>
              </form>
            </GlassPanel>
          </section>

          <footer className="flex w-full max-w-[980px] flex-wrap items-center justify-between gap-3 border-t border-[color:var(--card-border)] pt-6 text-sm text-[color:var(--text-muted)]">
            <span>DevTech - Tech Support & Software Solutions</span>
            <div className="flex items-center gap-2">
              <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"><ShieldCheck size={13} /> {text.badges[0]}</Tag>
              <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"><Cpu size={13} /> {text.badges[1]}</Tag>
              <Tag className="border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"><Sparkles size={13} /> {text.badges[2]}</Tag>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default App
