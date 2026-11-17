import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import 'lenis/dist/lenis.css'
import './styles.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]
const html = document.documentElement
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
if (reduceMotion) html.classList.add('no-motion')

/* --------------------------------------------------------------------------
   Horário real, no fuso de São Paulo
   Seg. a sex. 9h–18h; fim de semana fechado (post de 21/07/2025 e Google Maps)
   -------------------------------------------------------------------------- */
const HOURS = { 0: null, 1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], 6: null }
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const fmt = (m) => `${Math.floor(m / 60)}h`
const span = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return h ? `${h}h${m ? ` ${String(m).padStart(2, '0')}min` : ''}` : `${m} min` }

function spNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]))
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), hh: parts.hour, mm: parts.minute }
}

function status({ day, minutes }) {
  const t = HOURS[day]
  if (t && minutes >= t[0] && minutes < t[1]) {
    const left = t[1] - minutes
    return { open: true, short: left <= 60 ? `Aberto · fecha em ${span(left)}` : `Aberto agora · até ${fmt(t[1])}` }
  }
  if (t && minutes < t[0]) return { open: false, short: `Fechado · abre hoje às ${fmt(t[0])}` }
  let d = (day + 1) % 7
  while (!HOURS[d]) d = (d + 1) % 7
  return { open: false, short: `Fechado · abre ${d === (day + 1) % 7 ? 'amanhã' : DAY_NAMES[d]} às ${fmt(HOURS[d][0])}` }
}

function updateStatus() {
  const now = spNow()
  const st = status(now)
  html.classList.toggle('is-open-now', st.open)
  html.classList.toggle('is-closed-now', !st.open)
  $('[data-status-short]').textContent = st.short
  $('[data-state-text]').textContent = st.short
  $('[data-clock]').textContent = `${now.hh}:${now.mm}`
  $('[data-day]').textContent = `${DAY_NAMES[now.day]} · São Paulo`
  $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === now.day))
}
updateStatus()
setInterval(updateStatus, 20000)

/* --------------------------------------------------------------------------
   Conta-giros: marcações de 0 a 8 (mil rpm)
   -------------------------------------------------------------------------- */
const ticks = $('[data-ticks]')
if (ticks) {
  const NS = 'http://www.w3.org/2000/svg'
  for (let i = 0; i <= 8; i++) {
    const a = (-180 + (i / 8) * 180) * (Math.PI / 180)
    const line = document.createElementNS(NS, 'line')
    line.setAttribute('x1', 100 + Math.cos(a) * 70); line.setAttribute('y1', 100 + Math.sin(a) * 70)
    line.setAttribute('x2', 100 + Math.cos(a) * 78); line.setAttribute('y2', 100 + Math.sin(a) * 78)
    const text = document.createElementNS(NS, 'text')
    text.setAttribute('x', 100 + Math.cos(a) * 58); text.setAttribute('y', 100 + Math.sin(a) * 58 + 3)
    text.textContent = i
    ticks.append(line, text)
  }
}
const needle = $('[data-needle]')
const IDLE = -70 // ~ marcha lenta
const lamps = $$('[data-lamp]')

/* --------------------------------------------------------------------------
   Lenis + ScrollTrigger
   -------------------------------------------------------------------------- */
let lenis = null
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToY = (y, done) => {
  if (lenis) lenis.scrollTo(y, { duration: 1.3, onComplete: done })
  else { window.scrollTo(0, y); done?.() }
}
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY, () => el.focus({ preventScroll: true }))

/* --------------------------------------------------------------------------
   Navegação e menu mobile (foco preso, Esc)
   -------------------------------------------------------------------------- */
const nav = $('[data-nav]')
const burger = $('[data-burger]')
const mmenu = $('[data-mmenu]')

function openMenu() {
  mmenu.hidden = false
  requestAnimationFrame(() => mmenu.classList.add('is-open'))
  burger.setAttribute('aria-expanded', 'true')
  $('[data-burger-label]').textContent = 'Fechar'
  nav.classList.add('is-open')
  document.body.style.overflow = 'hidden'
  lenis?.stop()
  if (!reduceMotion) gsap.fromTo($$('.mmenu__links li, .mmenu__cta, .mmenu__foot', mmenu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out', stagger: 0.04, delay: 0.1 })
  $('a', mmenu).focus({ preventScroll: true })
}
function closeMenu({ restoreFocus = true } = {}) {
  if (mmenu.hidden) return
  mmenu.classList.remove('is-open')
  burger.setAttribute('aria-expanded', 'false')
  $('[data-burger-label]').textContent = 'Menu'
  nav.classList.remove('is-open')
  document.body.style.overflow = ''
  lenis?.start()
  setTimeout(() => { mmenu.hidden = true }, reduceMotion ? 0 : 400)
  if (restoreFocus) burger.focus({ preventScroll: true })
}
burger.addEventListener('click', () => (mmenu.hidden ? openMenu() : closeMenu()))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mmenu.hidden) closeMenu() })
mmenu.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return
  const items = [burger, ...$$('a', mmenu)]
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus() }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus() }
})
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) closeMenu({ restoreFocus: false }) })

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href').slice(1)
  const target = id && document.getElementById(id)
  if (!target) return
  e.preventDefault()
  const wasOpen = !mmenu.hidden
  closeMenu({ restoreFocus: false })
  const go = () => (id === 'inicio' ? scrollToY(0) : scrollToEl(target))
  wasOpen ? setTimeout(go, 120) : go()
  history.replaceState(null, '', `#${id}`)
})

/* Galeria "do pequeno ao gigante": botões */
const garage = $('[data-garage]')
const step = () => ($('.bay', garage)?.getBoundingClientRect().width || 300) + 18
$('[data-garage-prev]').addEventListener('click', () => garage.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }))
$('[data-garage-next]').addEventListener('click', () => garage.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }))

/* Fotos do palco fixo carregam antes de chegar */
if ('IntersectionObserver' in window) {
  const eager = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return
    $$('img[loading="lazy"]', target).forEach((img) => { img.loading = 'eager' })
    eager.unobserve(target)
  }), { rootMargin: '150% 0px' })
  $$('.servicos, .processo, .garage').forEach((s) => eager.observe(s))
}

/* --------------------------------------------------------------------------
   Partida: o painel faz o autoteste (luzes acendem, ponteiro varre e volta),
   como num carro de verdade ao girar a chave
   -------------------------------------------------------------------------- */
async function ignition() {
  if (reduceMotion) { html.classList.remove('js-intro'); gsap.set(needle, { rotate: IDLE, svgOrigin: '100 100' }); return }
  await Promise.race([document.fonts?.ready, wait(1200)])
  const tl = gsap.timeline({ onStart: () => html.classList.remove('js-intro') })
  tl.set(needle, { svgOrigin: '100 100', rotate: -90 })
    .call(() => lamps.forEach((l) => l.classList.add('is-on')), null, 0.15)
    .to(needle, { rotate: 88, duration: 0.7, ease: 'power2.inOut' }, 0.25)
    .to(needle, { rotate: IDLE, duration: 0.9, ease: 'power3.out' }, 0.95)
    .add(() => {}, 1.3)
  lamps.forEach((l, i) => tl.call(() => l.classList.remove('is-on'), null, 1.15 + i * 0.12))
  tl.fromTo('[data-hero-line]', { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12 }, 0.35)
    .fromTo('[data-hero-fade]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out', stagger: 0.07 }, 0.6)
    .fromTo('[data-hero-photo]', { opacity: 0, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut' }, 0.3)
}

/* O ponteiro "acelera" com a velocidade do scroll */
if (!reduceMotion && needle) {
  const rev = gsap.quickTo(needle, 'rotate', { duration: 0.35, ease: 'power3.out' })
  let calm
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      rev(IDLE + Math.min(150, Math.abs(self.getVelocity()) / 22))
      clearTimeout(calm); calm = setTimeout(() => rev(IDLE), 180)
    },
  })
}

/* Fita zebrada anda sozinha e acelera com o scroll */
const tape = $('[data-tape]')
if (!reduceMotion && tape) {
  const tw = gsap.to(tape, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
  ScrollTrigger.create({
    trigger: '.tape', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => gsap.to(tw, { timeScale: (self.direction || 1) * (1 + Math.min(4, Math.abs(self.getVelocity()) / 400)), duration: 0.2, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1 }) }),
  })
}

/* --------------------------------------------------------------------------
   Coreografia por tamanho de tela
   -------------------------------------------------------------------------- */
const svcs = $$('[data-svc]')
const dash = $$('[data-dash] .lamp')
const svcNum = $('[data-svc-num]')
let current = -1
function showService(i, animate = true) {
  if (i === current) return
  const prev = svcs[current]
  current = i
  svcs.forEach((s, k) => s.classList.toggle('is-active', k === i))
  dash.forEach((l, k) => l.classList.toggle('is-on', k <= i))
  svcNum.textContent = String(i + 1).padStart(2, '0')
  if (!animate || reduceMotion) return
  const s = svcs[i]
  gsap.fromTo($('.svc__photo img', s), { clipPath: 'inset(0 0 100% 0)', scale: 1.08 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 0.7, ease: 'power4.out', overwrite: true })
  gsap.fromTo($$('.svc__body > *', s), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true })
  if (prev) gsap.set(prev, { zIndex: 0 })
  gsap.set(s, { zIndex: 1 })
}

const mm = gsap.matchMedia()
if (!reduceMotion) {
  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' }, (ctx) => {
    const { desktop } = ctx.conditions

    // Ordem de serviço: o marcador de combustível enche e cada etapa é "ticada"
    gsap.fromTo('[data-fuel]', { scaleX: 0.04 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.os', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } })
    $$('[data-step]').forEach((s) => {
      ScrollTrigger.create({ trigger: s, start: 'top 62%', onToggle: (self) => s.classList.toggle('is-done', self.isActive || self.progress === 1), end: 'max' })
      gsap.from($$('h3, blockquote', s), { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: s, start: 'top 80%', once: true } })
    })

    // Números contam
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count); const dec = Number(el.dataset.decimals || 0); const o = { v: 0 }
      gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ',') } })
    })

    gsap.from('.bay', { x: 80, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.garage', start: 'top 80%', once: true } })
    gsap.from('[data-review]', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.reviews', start: 'top 80%', once: true } })
    gsap.from('.board', { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.board', start: 'top 85%', once: true } })

    if (desktop) {
      html.classList.add('has-pin')
      showService(0, false)
      ScrollTrigger.create({
        trigger: '.servicos', start: 'top top', end: () => `+=${window.innerHeight * 3}`,
        pin: true, scrub: true, refreshPriority: 1, invalidateOnRefresh: true,
        onUpdate: (self) => showService(Math.min(svcs.length - 1, Math.floor(self.progress * svcs.length))),
      })
      return () => {
        html.classList.remove('has-pin'); current = -1
        svcs.forEach((s) => { s.classList.remove('is-active'); gsap.set(s, { clearProps: 'zIndex' }); gsap.set($$('.svc__photo img, .svc__body > *', s), { clearProps: 'all' }) })
      }
    }

    // Mobile: o painel do título acende luz por luz; os cartões sobem e a luz de cada um acende ao chegar
    ScrollTrigger.create({ trigger: '.dash', start: 'top 80%', once: true, onEnter: () => dash.forEach((l, k) => setTimeout(() => l.classList.add('is-on'), k * 160)) })
    svcs.forEach((s) => {
      const lamp = $('.svc__tag .lamp', s)
      lamp.classList.remove('is-on')
      gsap.from(s, { y: 50, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true, onEnter: () => setTimeout(() => lamp.classList.add('is-on'), 350) } })
    })
    return () => svcs.forEach((s) => $('.svc__tag .lamp', s).classList.add('is-on'))
  })
} else {
  dash.forEach((l) => l.classList.add('is-on'))
}

/* --------------------------------------------------------------------------
   Estado da navegação, menu ativo e CTA fixo (depois dos pins)
   -------------------------------------------------------------------------- */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
    const y = self.scroll()
    nav.classList.toggle('is-solid', y > 40)
    const busy = nav.contains(document.activeElement) || !mmenu.hidden
    nav.classList.toggle('is-hidden', y > window.innerHeight * 0.8 && self.direction === 1 && !busy)
  },
})
nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'))

const navLinks = $$('[data-nav-link]')
$$('[data-section]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle(self) {
      if (!self.isActive) return
      navLinks.forEach((l) => (l.dataset.navLink === section.dataset.section ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')))
    },
  })
})

const sticky = $('[data-sticky-cta]')
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom 70%', endTrigger: '#visite', end: 'top 60%',
  onToggle: (self) => sticky.classList.toggle('is-visible', self.isActive),
})

ignition()
window.addEventListener('load', () => ScrollTrigger.refresh())
