import '@fontsource-variable/unbounded/index.css'
import '@fontsource-variable/manrope/index.css'
import '@fontsource-variable/newsreader/standard-italic.css'
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
    return { open: true, text: left <= 60 ? `Aberto agora · fecha em ${span(left)}` : 'Aberto agora · até as 18h' }
  }
  if (t && minutes < t[0]) return { open: false, text: 'Fechado · abre hoje às 9h' }
  let d = (day + 1) % 7
  while (!HOURS[d]) d = (d + 1) % 7
  return { open: false, text: `Fechado · abre ${d === (day + 1) % 7 ? 'amanhã' : DAY_NAMES[d]} às 9h` }
}

function updateStatus() {
  const now = spNow()
  const st = status(now)
  html.classList.toggle('is-open-now', st.open)
  html.classList.toggle('is-closed-now', !st.open)
  $('[data-status-short]').textContent = st.text
  $('[data-ticket-date]').textContent = now.date
}
updateStatus()
setInterval(updateStatus, 30000)

/* --------------------------------------------------------------------------
   Avaliações: troca sozinha (pausa no mouse/foco); os traços escolhem
   -------------------------------------------------------------------------- */
const qs = $$('[data-q]')
const dots = $$('[data-dot]')
let qi = 0
const showQ = (i) => {
  qi = (i + qs.length) % qs.length
  qs.forEach((q, k) => q.classList.toggle('is-active', k === qi))
  dots.forEach((d, k) => { d.classList.toggle('is-active', k === qi); d.setAttribute('aria-pressed', String(k === qi)) })
}
dots.forEach((d, k) => d.addEventListener('click', () => showQ(k)))
showQ(0)
if (!reduceMotion) {
  const box = $('.trio__quote')
  let paused = false
  box.addEventListener('mouseenter', () => { paused = true })
  box.addEventListener('mouseleave', () => { paused = false })
  box.addEventListener('focusin', () => { paused = true })
  box.addEventListener('focusout', () => { paused = false })
  setInterval(() => { if (!paused && !document.hidden) showQ(qi + 1) }, 6500)
}

/* --------------------------------------------------------------------------
   Agendar: a ordem de serviço se preenche enquanto a pessoa digita
   e a mensagem vai pronta para o WhatsApp da oficina
   -------------------------------------------------------------------------- */
const book = $('[data-book]')
$$('[data-in]', book).forEach((input) => {
  const out = $(`[data-out="${input.dataset.in}"]`)
  input.addEventListener('input', () => { out.textContent = input.value.trim() || '—' })
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
  if (lenis) lenis.scrollTo(y, { duration: 1.2, onComplete: done })
  else { window.scrollTo(0, y); done?.() }
}
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY - (window.matchMedia('(max-width: 1023.98px)').matches ? 64 : 76), () => el.focus({ preventScroll: true }))

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
  document.body.style.overflow = 'hidden'
  lenis?.stop()
  if (!reduceMotion) gsap.fromTo($$('.mmenu__links li, .mmenu__cta, .mmenu__foot', mmenu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.045, delay: 0.08 })
  $('a', mmenu).focus({ preventScroll: true })
}
function closeMenu({ restoreFocus = true } = {}) {
  if (mmenu.hidden) return
  mmenu.classList.remove('is-open')
  burger.setAttribute('aria-expanded', 'false')
  $('[data-burger-label]').textContent = 'Menu'
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
   Abertura e scroll
   -------------------------------------------------------------------------- */
async function intro() {
  if (reduceMotion) { html.classList.remove('js-intro'); return }
  await Promise.race([document.fonts?.ready, wait(1200)])
  gsap.timeline({ onStart: () => html.classList.remove('js-intro'), defaults: { ease: 'power4.out' } })
    .fromTo('[data-hero-photo]', { opacity: 0, clipPath: 'inset(0 0 0 100%)' }, { opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 1.4, ease: 'power3.inOut' }, 0)
    .fromTo('.hero__media img', { scale: 1.3 }, { scale: 1.1, duration: 2.2, ease: 'power3.out' }, 0)
    .fromTo('[data-hero-line]', { opacity: 0, yPercent: 50 }, { opacity: 1, yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.2)
    .fromTo('[data-hero-fade]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.45)
}

if (!reduceMotion) {
  gsap.matchMedia().add('(min-width: 0px)', () => {
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    })
    gsap.from('[data-svc]', { x: -24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.svc-list', start: 'top 85%', once: true } })
    gsap.from('.thumbs li', { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.thumbs', start: 'top 92%', once: true } })
    gsap.from('[data-ticket]', { yPercent: -25, opacity: 0, duration: 0.9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.agendar', start: 'top 75%', once: true } })
  })
}

/* --------------------------------------------------------------------------
   Navegação: esconde ao descer; menu ativo; CTA fixo no mobile
   -------------------------------------------------------------------------- */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
    const busy = nav.contains(document.activeElement) || !mmenu.hidden
    nav.classList.toggle('is-hidden', self.scroll() > window.innerHeight * 0.8 && self.direction === 1 && !busy)
  },
})
nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'))

const navLinks = $$('[data-nav-link]')
$$('[data-section]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle(self) {
      if (!self.isActive) return
      navLinks.forEach((l) => (l.getAttribute('href') === `#${section.id}` ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')))
    },
  })
})

const sticky = $('[data-sticky-cta]')
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom 70%', endTrigger: '#agendar', end: 'top 85%',
  onToggle: (self) => sticky.classList.toggle('is-visible', self.isActive),
})

intro()
window.addEventListener('load', () => ScrollTrigger.refresh())
