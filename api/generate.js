// Vercel serverless function: POST /api/generate
// Body: { prompt: string, form?: object, sections?: object[] }
// Response: { text: string }
//
// V2: outputs a polished KOREAN prompt paragraph instead of English.
// The participant-facing rewrite happens entirely in Korean so people
// can edit it without translation friction.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { prompt, form, sections } = req.body || {}
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return res.status(200).json({ text: prompt, note: 'GEMINI_API_KEY not configured' })
  }

  const model = 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const instruction = [
    '당신은 AI 이미지 생성 도구를 위한 시니어 프롬프트 디자이너입니다.',
    '주어진 폼 입력값을 단순히 라벨과 함께 나열하지 말고, 하나의 자연스러운 한국어 문단으로 다시 풀어 쓰십시오.',
    '최종 결과물은 사용자가 그대로 복사해서 일반적인 생성형 AI 모델(나노바나나, Midjourney, Stable Diffusion 등)에 붙여넣어 사용할 수 있는 형태여야 합니다.',
    '오직 최종 프롬프트 텍스트만 출력하십시오. 설명, 머리말, 마크다운, 글머리표, 따옴표 등은 절대 포함하지 마십시오.',
    '문장은 "고품질의 ~를 생성해 주세요" 또는 "~한 이미지를 만들어 주세요" 같이 자연스럽고 명확한 요청형으로 시작하십시오.',
    '"디지털 아트로 그린 캐릭터" 같은 수동형 캡션 식 출력은 금지합니다. 무엇을 어떻게 생성해야 하는지 모델에게 명확히 지시해야 합니다.',
    '사용자가 입력한 모든 의미 있는 요소(목적, 주제, 화풍, 맥락, 조명, 구도, 분위기, 추가 요청, 제외할 요소)를 빠뜨리지 말고 활용하십시오.',
    '사용자가 추상적이거나 넓은 카테고리만 적었다면, 실루엣, 재질, 환경, 자세, 분위기, 텍스처, 카메라 워크, 렌더링 품질 등 일반적인 시각적 디테일로 보강해 구체화하십시오.',
    '단, 사용자가 명시하지 않은 중요한 고유명사(실존 인물, 브랜드, 장소 등)나 사실 주장을 새로 만들어내지는 마십시오. 일반적인 시각적 디테일 보강만 허용됩니다.',
    '서로 어울리지 않는 키워드 조합(예: "차가운 촛불 조명")은 기계적으로 나열하지 말고, "푸른 그림자가 드리워진 차가운 톤의 촛불 빛"처럼 하나의 일관된 아트 디렉션으로 풀어내십시오.',
    '한 단락의 자연스러운 한국어로 작성하되, 일반적으로 "생성 요청 → 주제 → 자세/행동 → 배경/맥락 → 화풍/매체 → 구도/카메라 → 조명 → 분위기 → 디테일 품질 → 활용 용도" 순서로 정보를 배치하십시오.',
    '입력이 충분할 경우 약 200~350자 한국어로 작성하십시오. 입력이 적더라도 짧은 라벨 나열이 아닌 100~200자의 자연스러운 문단으로 만들어내십시오.',
    '사용자 입력에 영어 단어가 섞여 있더라도 최종 출력은 자연스러운 한국어로 통합하십시오. 단, 고유명사나 기술 용어(예: bokeh, HDR, 16:9, Midjourney)는 원어를 유지해도 됩니다.',
    '"NEGATIVE" 섹션이나 "Negative prompt"로 들어온 내용은 마지막 줄에 별도로 "제외할 요소: ..." 형태로 한국어로 정리해 덧붙이십시오.',
    '"추가 요청 사항"으로 들어온 내용은 본문에 자연스럽게 녹여 포함하거나, 마지막에 "추가 요청: ..." 줄로 분리해 명시하십시오.',
    '나쁜 출력 예: "디지털 아트, 어두운 분위기, 풀바디 버드아이 샷의 캐릭터."',
    '좋은 출력 예: "어두운 그림자가 깔린 환경 속에서 드라마틱한 포즈를 취한 오리지널 캐릭터의 전신을, 위에서 내려다보는 버드아이 시점으로 그린 고품질 디지털 일러스트를 생성해 주세요. 푸른 빛이 도는 차가운 톤의 촛불 조명과 층층이 쌓인 의상의 디테일, 표현력 있는 실루엣, 시네마틱한 콘트라스트, 정교한 질감, 어두우면서 분위기 있는 톤을 더해 주세요."',
  ].join(' ')

  const payload = {
    assembledPromptDraft: prompt,
    rawFormValues: form || null,
    sectionSchema: Array.isArray(sections)
      ? sections.map(({ id, title, required, type, fields }) => ({
          id,
          title,
          required,
          type,
          fields: fields?.map(({ id, label, type }) => ({ id, label, type })),
        }))
      : null,
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: instruction }],
        },
        contents: [{
          parts: [{
            text: `폼 입력값:\n${JSON.stringify(payload, null, 2)}`,
          }],
        }],
        generationConfig: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 768,
        },
      }),
    })
    if (!r.ok) {
      const text = await r.text()
      return res.status(r.status).send(text)
    }
    const data = await r.json()
    const parts = data?.candidates?.[0]?.content?.parts || []
    const text = parts.map((p) => p.text).filter(Boolean).join('\n').trim()
    return res.status(200).json({ text: text || prompt })
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
