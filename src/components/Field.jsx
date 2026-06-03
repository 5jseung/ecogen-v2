// V2 field primitives.
import { useRef, useState } from 'react'

const isOther = (opt) => opt === 'Other' || opt === '기타'

// === MultiCheck (kept from V1) ============================================
// Used by COMPOSITION (Shot / Distance) and LIGHTING in V2.
export function MultiCheck({ options, value = [], onChange, custom = false }) {
  const inputRef = useRef(null)
  const otherExists = options.some(isOther)

  const customVals = value.filter((v) => !options.includes(v))
  const customStr = customVals.join(', ')
  const [customInput, setCustomInput] = useState(customStr)
  const hasCustom = customVals.length > 0

  const [otherClicked, setOtherClicked] = useState(false)
  const showCustom = custom && (!otherExists || hasCustom || otherClicked)

  const toggle = (opt) => {
    if (custom && isOther(opt)) {
      const turningOn = !(hasCustom || otherClicked)
      if (turningOn) {
        setOtherClicked(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      } else {
        setOtherClicked(false)
        setCustomInput('')
        if (hasCustom) {
          onChange(value.filter((v) => options.includes(v) && !isOther(v)))
        }
      }
      return
    }
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt))
    else onChange([...value, opt])
  }

  const isOn = (opt) => {
    if (custom && isOther(opt)) return hasCustom || otherClicked
    return value.includes(opt)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = isOn(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={
                'px-3 py-1.5 rounded-full text-sm border transition ' +
                (on
                  ? 'bg-seal text-white border-seal'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-seal')
              }
            >
              {opt}
            </button>
          )
        })}
      </div>
      {showCustom && (
        <input
          ref={inputRef}
          type="text"
          placeholder="직접 입력 (쉼표로 여러 개 입력 가능)"
          value={customInput}
          onChange={(e) => {
            const raw = e.target.value
            setCustomInput(raw)
            const fixed = value.filter((v) => options.includes(v) && !isOther(v))
            const extras = raw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            onChange([...fixed, ...extras])
          }}
          className="w-full mt-1 px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-seal"
        />
      )}
    </div>
  )
}

// === ReferenceTextField (NEW in V2) =======================================
// A free-text textarea with a 더보기 button that expands a read-only list of
// reference words. Users type freely; the reference list is just inspiration.
export function ReferenceTextField({ value = '', onChange, placeholder, references = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm leading-6 focus:outline-none focus:border-seal resize-none"
      />
      {references.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-eco-600 hover:text-eco-500 inline-flex items-center gap-1"
          >
            {open ? '▾ 접기' : '▸ 더보기 — 참고할 만한 단어들'}
          </button>
          {open && (
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-600">
              <div className="mb-1.5 font-medium text-slate-500">
                참고만 하세요. 위 입력칸에 자유롭게 적으시면 됩니다.
              </div>
              <ul className="space-y-1">
                {references.map((line, i) => (
                  <li key={i}>· {line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
