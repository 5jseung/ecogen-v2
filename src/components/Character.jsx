import { useEffect, useRef, useState } from 'react'

// Map filled section count → animation stage (1..5).
// V2 has 9 sections so we re-bucket. Threshold tuning is intentionally similar
// to V1 so the seal hits "happy" before all sections are filled.
function stageFor(filled) {
  if (filled <= 0) return 1
  if (filled <= 3) return 2
  if (filled === 4) return 3
  if (filled === 5) return 4
  return 5
}

const SPECIES = {
  name: '남극 물개 (Antarctic Fur Seal)',
  reason: '해빙 감소 · 해수온 상승으로 크릴 먹이 부족',
  population: '약 94만 마리 (1999년 대비 50% ↓)',
  habitat: '남극 사우스조지아 섬 일대',
  source: 'https://iucn.org/press-release/202604/emperor-penguin-and-antarctic-fur-seal-now-endangered-due-climate-change-iucn',
  article: 'https://brunch.co.kr/@greenpeacekorea/391',
  articleLabel: '효율적인 프롬프팅이 기후위기에 주는 영향 →',
}

const STAGE_ANIM_MS = 1500
const CELEBRATION_MS = 2000

// V2 changes:
//  - The seal floats on the right side and chases the scroll position with a
//    smooth easing lag, mimicking the old Korean side-banner ads.
//  - Same hover info-card + once-only animation logic as V1.
//
// Implementation: we keep position: fixed, but offset the seal vertically
// using a JS-driven `transform` that eases toward the latest scroll-derived
// target. Updating transform via ref avoids re-rendering on every frame.
export default function Character({ filledCount, justCheered, isComplete = false }) {
  const stage = stageFor(filledCount)

  const [mode, setMode] = useState('static')
  const prevStage = useRef(stage)
  const [hover, setHover] = useState(false)
  const [animToken, setAnimToken] = useState(0)

  // --- floating scroll-lag --------------------------------------------------
  const wrapperRef = useRef(null)
  useEffect(() => {
    let raf
    let current = 0       // current rendered offset (px)
    let target = 0        // where we want to be (driven by scroll)

    const computeTarget = () => {
      // Place the seal somewhere in the lower-middle of the viewport, then
      // shift it by a fraction of how far the user has scrolled. This makes
      // it drift gently down the page instead of being glued to one spot.
      const y = window.scrollY
      // Cap so it doesn't keep drifting off-screen on very long pages.
      target = Math.min(y * 0.15, 120)
    }
    const onScroll = () => computeTarget()
    computeTarget()
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      // Spring toward the target with easing — the lower the factor, the
      // more lag/lazier the chase. 0.06 looks like the classic 광고 banner.
      current += (target - current) * 0.06
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translateY(${current.toFixed(1)}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  // --------------------------------------------------------------------------

  // Stage changed → play once.
  useEffect(() => {
    if (stage === prevStage.current) return
    prevStage.current = stage
    setMode('stage-anim')
    setAnimToken((n) => n + 1)
    const t = setTimeout(() => setMode('static'), STAGE_ANIM_MS)
    return () => clearTimeout(t)
  }, [stage])

  // 프롬프트 생성하기 → celebrate if complete, else replay stage anim.
  useEffect(() => {
    if (!justCheered) return
    const nextMode = isComplete ? 'celebrating' : 'stage-anim'
    setMode(nextMode)
    setAnimToken((n) => n + 1)
    const duration = isComplete ? CELEBRATION_MS : STAGE_ANIM_MS
    const t = setTimeout(() => setMode('static'), duration)
    return () => clearTimeout(t)
  }, [justCheered, isComplete])

  let src
  let key
  if (mode === 'celebrating') {
    src = '/seal/anim/final_celebration.png'
    key = `cheer-${animToken}`
  } else if (mode === 'stage-anim') {
    src = `/seal/anim/stage${stage}.png`
    key = `stage-anim-${stage}-${animToken}`
  } else {
    src = `/seal/seal-${stage}.png`
    key = `static-${stage}`
  }

  return (
    <div
      ref={wrapperRef}
      // Anchor near top-right; the JS transform pushes it down with the page.
      // Pointer events stay on so the user can actually hover/click it.
      className="fixed top-32 right-4 z-50 will-change-transform"
      style={{ transition: 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Subtle pulse ring so people actually notice the seal */}
      <div className="absolute inset-2 rounded-full bg-eco-500/10 animate-ping pointer-events-none" />

      {hover && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs text-slate-700 z-10">
          <div className="font-semibold text-slate-900 mb-1.5">{SPECIES.name}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            <span className="text-slate-400">서식지</span>
            <span>{SPECIES.habitat}</span>
            <span className="text-slate-400">개체수</span>
            <span>{SPECIES.population}</span>
            <span className="text-slate-400">멸종위기 이유</span>
            <span>{SPECIES.reason}</span>
          </div>
          <a
            href={SPECIES.article}
            target="_blank"
            rel="noreferrer noopener"
            className="block mt-2 pt-2 border-t border-slate-100 text-eco-600 hover:underline"
          >
            {SPECIES.articleLabel}
          </a>
          <a
            href={SPECIES.source}
            target="_blank"
            rel="noreferrer noopener"
            className="block mt-0.5 text-[10px] text-slate-400 hover:underline"
          >
            출처: IUCN
          </a>
        </div>
      )}
      <img
        key={key}
        src={src}
        alt={`seal stage ${stage}`}
        className="relative w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow cursor-pointer"
      />
    </div>
  )
}
