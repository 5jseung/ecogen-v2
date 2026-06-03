// V2 prompt assembly.
// Decides whether a section counts as "filled" (for the character animation)
// and turns the whole form state into a single prompt string for Gemini.

import { SECTIONS } from '../data/sections.js'

const flatten = (val) => {
  if (val == null) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  if (typeof val === 'string') return val.trim() ? [val.trim()] : []
  if (typeof val === 'object') {
    return Object.values(val).flatMap(flatten)
  }
  return []
}

export function isSectionFilled(section, value) {
  if (value == null) return false
  if (section.type === 'group') {
    return section.fields.some((f) => flatten(value?.[f.id]).length > 0)
  }
  return flatten(value).length > 0
}

export function countFilledSections(state) {
  return SECTIONS.reduce(
    (n, s) => n + (isSectionFilled(s, state[s.id]) ? 1 : 0),
    0,
  )
}

// V2 builds a Korean-flavored draft. The Gemini call later rewrites this
// into a polished Korean paragraph. The draft is only shown as a fallback
// when Gemini isn't reachable.
export function buildPrompt(state) {
  const positiveParts = []
  let negative = ''
  let extras = ''

  for (const s of SECTIONS) {
    const v = state[s.id]
    if (!isSectionFilled(s, v)) continue

    if (s.id === 'negative') {
      negative = flatten(v).join(', ')
      continue
    }
    if (s.id === 'extras') {
      extras = flatten(v).join(', ')
      continue
    }

    if (s.type === 'group') {
      const sub = s.fields
        .map((f) => {
          const vals = flatten(v?.[f.id])
          if (!vals.length) return null
          return `${f.label}: ${vals.join(', ')}`
        })
        .filter(Boolean)
        .join('; ')
      if (sub) positiveParts.push(`[${s.title}] ${sub}`)
    } else {
      positiveParts.push(`[${s.title}] ${flatten(v).join(', ')}`)
    }
  }

  let out = positiveParts.join('\n')
  if (extras) out += `\n\n추가 요청 사항: ${extras}`
  if (negative) out += `\n\nNegative prompt: ${negative}`
  return out.trim()
}
