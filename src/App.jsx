import { useMemo, useState } from 'react'
import { SECTIONS } from './data/sections.js'
import { buildPrompt, countFilledSections } from './utils/buildPrompt.js'
import Section from './components/Section.jsx'
import Character from './components/Character.jsx'

export default function App() {
  const [form, setForm] = useState({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cheered, setCheered] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})

  const filled = useMemo(() => countFilledSections(form), [form])
  const prompt = useMemo(() => buildPrompt(form), [form])

  const setSection = (id, v) => setForm((f) => ({ ...f, [id]: v }))
  const collapseAllSections = () => {
    setCollapsedSections(Object.fromEntries(SECTIONS.map((s) => [s.id, true])))
  }
  const toggleSection = (id) => {
    setCollapsedSections((s) => ({ ...s, [id]: !s[id] }))
  }

  const handleGenerate = async () => {
    setOutput(prompt)
    setError('')
    setCheered(true)
    setTimeout(() => setCheered(false), 1800)
    if (!prompt) return
    collapseAllSections()

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, form, sections: SECTIONS }),
      })
      if (!res.ok) {
        if (res.status === 404) {
          // No backend in dev → fall back to local draft.
        } else {
          const t = await res.text()
          setError(`프롬프트 생성 실패: ${t.slice(0, 200)}`)
        }
        return
      }
      const data = await res.json()
      if (data.text) setOutput(data.text)
    } catch (e) {
      // No /api in dev → silently fall back to text output
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!output) return
    try { await navigator.clipboard.writeText(output) } catch {}
  }

  const required = SECTIONS.filter((s) => s.required)
  const optional = SECTIONS.filter((s) => !s.required)

  return (
    <div className={(output || error) ? 'min-h-screen pb-80' : 'min-h-screen pb-20'}>
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/seal/seal-3.png" alt="" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-base font-semibold text-slate-900">PromptGen — 이미지 프롬프트 빌더</h1>
              <p className="text-xs text-slate-500">v2 · 자유 입력 + 참고 단어 · 한국어 출력</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-eco-600 bg-eco-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-eco-500" />
            ON
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-3">
          <Progress filled={filled} total={SECTIONS.length} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Column title="[필수 섹션] REQUIRED" tone="required">
            {required.map((s) => (
              <Section
                key={s.id}
                section={s}
                value={form[s.id]}
                onChange={(v) => setSection(s.id, v)}
                collapsed={Boolean(output && collapsedSections[s.id])}
                onToggle={() => toggleSection(s.id)}
                reviewMode={Boolean(output)}
              />
            ))}
          </Column>
          <Column title="[선택 섹션] OPTIONAL" tone="optional">
            {optional.map((s) => (
              <Section
                key={s.id}
                section={s}
                value={form[s.id]}
                onChange={(v) => setSection(s.id, v)}
                collapsed={Boolean(output && collapsedSections[s.id])}
                onToggle={() => toggleSection(s.id)}
                reviewMode={Boolean(output)}
              />
            ))}
          </Column>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200">
        {(output || error) && (
          <div className="max-w-6xl mx-auto px-6 pt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-800">생성된 프롬프트 (한국어)</h2>
              {output && <span className="text-xs text-slate-500">{output.length}자</span>}
            </div>
            {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
            {output && (
              <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={5}
                className="h-32 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-800 focus:border-seal focus:outline-none"
              />
            )}
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!prompt || loading}
            className="px-4 py-2 rounded-lg bg-seal text-white text-sm font-medium hover:bg-seal-dark disabled:opacity-40"
          >
            {loading ? '생성 중…' : '프롬프트 생성하기'}
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:border-seal disabled:opacity-40"
          >
            복사
          </button>
          <div className="text-xs text-slate-500 flex-1 truncate">
            {output ? `${output.length}자 / ${filled}/${SECTIONS.length} 섹션 완료` : '템플릿 내용이 여기에 출력됩니다.'}
          </div>
        </div>
      </footer>

      <Character filledCount={filled} justCheered={cheered} isComplete={filled === SECTIONS.length} />
    </div>
  )
}

function Column({ title, tone, children }) {
  return (
    <div>
      <h2 className={'text-xs font-semibold mb-3 ' + (tone === 'required' ? 'text-red-600' : 'text-slate-500')}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Progress({ filled, total }) {
  const pct = Math.round((filled / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-eco-500 to-seal transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-slate-600 tabular-nums">
        {filled}/{total} 섹션 · {pct}%
      </div>
    </div>
  )
}
