import '@fontsource-variable/unbounded/index.css'
import '@fontsource-variable/manrope/index.css'
import '@fontsource-variable/geist-mono/index.css'
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

const WA = '5511992158526'

/* --------------------------------------------------------------------------
   Horário real (fuso de São Paulo): seg. a sex. 9h–18h, fim de semana fechado
   Fontes: reel de 21/07/2025 e ficha do Google Maps
   -------------------------------------------------------------------------- */
const HOURS = { 0: null, 1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], 6: null }
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const span = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return h ? `${h}h${m ? ` ${String(m).padStart(2, '0')}min` : ''}` : `${m} min` }

function spNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]))
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), date: `${parts.day}/${parts.month}` }
}

function status({ day, minutes }) {
  const t = HOURS[day]
  if (t && minutes >= t[0] && minutes < t[1]) {
    const left = t[1] - minutes
    return { open: true, title: 'Aberto agora', text: left <= 60 ? `Fecha em ${span(left)}` : 'Até as 18h, hoje' }
  }
  if (t && minutes < t[0]) return { open: false, title: 'Fechado', text: 'Abre hoje às 9h' }
  let d = (day + 1) % 7
  while (!HOURS[d]) d = (d + 1) % 7
  return { open: false, title: 'Fechado', text: `Abre ${d === (day + 1) % 7 ? 'amanhã' : DAY_NAMES[d]} às 9h` }
}

function updateStatus() {
  const now = spNow()
  const st = status(now)
  html.classList.toggle('is-open-now', st.open)
  html.classList.toggle('is-closed-now', !st.open)
  $('[data-status-title]').textContent = st.title
  $('[data-status-short]').textContent = st.text
  $('[data-footer-state]').textContent = `${st.title} · ${st.text.toLowerCase()}`
  $('[data-ticket-date]').textContent = now.date
  $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').map(Number).includes(now.day)))
}
updateStatus()
setInterval(updateStatus, 30000)

/* --------------------------------------------------------------------------
   Agendar: a ordem de serviço se preenche enquanto a pessoa digita
   e a mensagem vai pronta para o WhatsApp da oficina
   -------------------------------------------------------------------------- */
const book = $('[data-book]')
$$('[data-in]', book).forEach((input) => {
  const out = $(`[data-out="${input.dataset.in}"]`)
  input.addEventListener('input', () => {
    const v = input.value.trim()
    out.textContent = v || '—'
    out.classList.toggle('is-typed', !!v)
  })
})
book.addEventListener('submit', (e) => {
  e.preventDefault()
  const carro = book.carro.value.trim()
  const sintoma = book.sintoma.value.trim()
  const lines = ['Olá, Oficina 3L! Quero agendar um diagnóstico.']
  if (carro) lines.push(`Carro: ${carro}`)
  if (sintoma) lines.push(`O que está acontecendo: ${sintoma}`)
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
})

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
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY - (el.id === 'visite' ? 0 : 0), () => el.focus({ preventScroll: true }))

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
  if (!reduceMotion) gsap.fromTo($$('.mmenu__links li, .mmenu__cta, .mmenu__foot', mmenu), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.045, delay: 0.08 })
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
  setTimeout(() => { mmenu.hidden = true }, reduceMotion ? 0 : 350)
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

/* --------------------------------------------------------------------------
   Abertura: o "3L" sobe, a foto abre como uma porta de garagem
   -------------------------------------------------------------------------- */
async function intro() {
  if (reduceMotion) { html.classList.remove('js-intro'); return }
  await Promise.race([document.fonts?.ready, wait(1200)])
  const tl = gsap.timeline({ onStart: () => html.classList.remove('js-intro'), defaults: { ease: 'power4.out' } })
  tl.fromTo('[data-hero-photo]', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    .fromTo('.hero__bg img', { scale: 1.3 }, { scale: 1.12, duration: 2.2, ease: 'power3.out' }, 0)
    .fromTo('[data-hero-line]', { opacity: 0, yPercent: 50 }, { opacity: 1, yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.25)
    .fromTo('[data-hero-fade]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.5)
    .fromTo('[data-status-card]', { opacity: 0, xPercent: 40 }, { opacity: 1, xPercent: 0, duration: 1, ease: 'power3.out' }, 0.8)
    .fromTo('[data-spec]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.9)
    .add(() => $$('[data-count]').forEach(countUp), 0.95)
}

function countUp(el) {
  const end = Number(el.dataset.count); const dec = Number(el.dataset.decimals || 0); const o = { v: 0 }
  gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ',') } })
}

/* --------------------------------------------------------------------------
   Coreografia ligada ao scroll
   -------------------------------------------------------------------------- */
const mm = gsap.matchMedia()
if (!reduceMotion) {
  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' }, (ctx) => {
    const { desktop } = ctx.conditions

    // Fotos com parallax dentro da própria moldura (nunca saem dela)
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })

    // Por que a 3L: checks entram um a um; os ícones dos serviços sobem
    gsap.from('[data-check]', { x: -30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.checks', start: 'top 80%', once: true } })
    gsap.from('[data-tile]', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.tiles', start: 'top 88%', once: true } })

    // Cards de serviço sobem sobre o painel preto
    gsap.from('[data-card]', { y: 80, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.08, grid: 'auto' }, scrollTrigger: { trigger: '.cards', start: 'top 85%', once: true } })

    // Agendar: o ticket "sai da impressora"
    gsap.from('[data-ticket]', { yPercent: -30, opacity: 0, duration: 0.9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.agendar', start: 'top 70%', once: true } })

    // Como funciona: o trilho enche e cada etapa acende ao ser alcançada
    const vertical = !desktop
    gsap.fromTo('[data-rail]', vertical ? { scaleY: 0 } : { scaleX: 0 }, {
      ...(vertical ? { scaleY: 1 } : { scaleX: 1 }), ease: 'none',
      scrollTrigger: { trigger: '.steps-wrap', start: vertical ? 'top 70%' : 'top 75%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: 0.5 },
    })
    const steps = $$('[data-step]')
    steps.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: vertical ? s : '.steps-wrap',
        start: vertical ? 'top 65%' : () => `top ${75 - (i / (steps.length - 1)) * 45}%`,
        end: 'max',
        onToggle: (self) => s.classList.toggle('is-done', self.isActive),
      })
    })
    gsap.from(steps, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } })

    // Galeria: fotos revelam de baixo para cima; a coluna da direita anda mais devagar
    $$('[data-shot]').forEach((s, i) => {
      gsap.fromTo($('.shot__img', s), { clipPath: 'inset(100% 0 0 0 round 22px)' }, { clipPath: 'inset(0% 0 0 0 round 22px)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: s, start: 'top 88%', once: true } })
      if (desktop && i % 2) gsap.to(s, { y: -60, ease: 'none', scrollTrigger: { trigger: '.mosaic', start: 'top bottom', end: 'bottom top', scrub: true } })
    })

    gsap.from('[data-review]', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.reviews', start: 'top 85%', once: true } })
    gsap.from('.score b', { yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.score', start: 'top 85%', once: true } })
  })
} else {
  $$('[data-step]').forEach((s) => s.classList.add('is-done'))
}

/* --------------------------------------------------------------------------
   Estado da navegação, menu ativo e CTA fixo
   -------------------------------------------------------------------------- */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
    const y = self.scroll()
    nav.classList.toggle('is-solid', y > 30)
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
  trigger: '.hero', start: 'bottom 70%', endTrigger: '#agendar', end: 'top 80%',
  onToggle: (self) => sticky.classList.toggle('is-visible', self.isActive),
})
ScrollTrigger.create({
  trigger: '.processo', start: 'top 80%', endTrigger: '.footer', end: 'top 90%',
  onToggle: (self) => { if (self.isActive) sticky.classList.add('is-visible') },
  onLeave: () => sticky.classList.remove('is-visible'),
  onLeaveBack: () => sticky.classList.remove('is-visible'),
})

intro()
window.addEventListener('load', () => ScrollTrigger.refresh())
