import { MultiCheck, ReferenceTextField } from './Field.jsx'
import { isSectionFilled } from '../utils/buildPrompt.js'

function renderField(field, value, onChange) {
  if (field.type === 'multi')
    return <MultiCheck options={field.options} value={value} onChange={onChange} custom={field.custom} />
  if (field.type === 'reftext')
    return <ReferenceTextField value={value} onChange={onChange} placeholder={field.placeholder} references={field.references} />
  return null
}

const valuesOf = (val) => {
  if (val == null) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  if (typeof val === 'string') return val.trim() ? [val.trim()] : []
  return []
}

function SummaryValues({ values, text = false }) {
  if (!values.length) return <span className="text-slate-400">미입력</span>
  if (text) {
    return <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{values.join(', ')}</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span key={v} className="rounded-full bg-eco-50 px-2.5 py-1 text-xs font-medium text-eco-600">
          {v}
        </span>
      ))}
    </div>
  )
}

function SectionSummary({ section, value }) {
  if (!isSectionFilled(section, value)) {
    return <div className="text-sm text-slate-400">아직 입력된 내용이 없습니다.</div>
  }

  if (section.type !== 'group') {
    const values = valuesOf(value)
    return <SummaryValues values={values} text={section.type === 'reftext'} />
  }

  const filledFields = section.fields
    .map((field) => ({ field, values: valuesOf(value?.[field.id]) }))
    .filter(({ values }) => values.length > 0)

  return (
    <div className="space-y-2">
      {filledFields.map(({ field, values }) => (
        <div key={field.id}>
          <div className="mb-1 text-xs font-medium text-slate-500">{field.label}</div>
          <SummaryValues values={values} />
        </div>
      ))}
    </div>
  )
}

export default function Section({ section, value, onChange, collapsed = false, onToggle, reviewMode = false }) {
  const filled = isSectionFilled(section, value)
  const setField = (id, v) => onChange({ ...(value || {}), [id]: v })
  const openCollapsed = () => {
    if (collapsed) onToggle?.()
  }

  return (
    <section
      onClick={openCollapsed}
      className={
        'rounded-xl border bg-white p-4 transition shadow-sm ' +
        (collapsed ? 'cursor-pointer hover:border-seal/70 hover:shadow-md ' : '') +
        (filled ? 'border-eco-500/60 ring-1 ring-eco-500/30' : 'border-slate-200')
      }
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-slate-800">
          {section.title}{' '}
          {section.required ? (
            <span className="text-xs text-red-500 ml-1">REQUIRED</span>
          ) : (
            <span className="text-xs text-slate-400 ml-1">OPTIONAL</span>
          )}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {filled && <span className="text-xs text-eco-600 font-medium">완료</span>}
          {reviewMode && !collapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggle?.()
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-seal hover:text-seal"
            >
              접기
            </button>
          )}
        </div>
      </header>

      {collapsed ? (
        <SectionSummary section={section} value={value} />
      ) : section.type === 'group' ? (
        <div className="space-y-3">
          {section.fields.map((f) => (
            <div key={f.id}>
              <div className="text-xs text-slate-500 mb-1">{f.label}</div>
              {renderField(f, value?.[f.id], (v) => setField(f.id, v))}
            </div>
          ))}
        </div>
      ) : (
        renderField(section, value, onChange)
      )}
    </section>
  )
}
