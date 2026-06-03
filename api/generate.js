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
    '당신은 AI 이미지 생성 도구(Midjourney, Stable Diffusion, 나노바나나, DALL·E 등)를 위한 시니어 프롬프트 디자이너이자 아트 디렉터입니다.',
    '주어진 폼 입력값을 라벨과 함께 단순히 나열하지 말고, 풍부하고 시각적으로 구체적인 한 단락의 한국어 프롬프트로 재구성하십시오.',
    '최종 결과물은 사용자가 그대로 복사해 일반적인 이미지 생성 모델에 붙여넣을 수 있는 완성된 프롬프트여야 합니다.',
    '오직 최종 프롬프트 텍스트만 출력하십시오. 설명, 머리말, 마크다운, 글머리표, 따옴표, 메타 코멘트는 절대 포함하지 마십시오.',
    '첫 문장은 "고품질의 ~를 생성해 주세요" / "~한 이미지를 만들어 주세요" 같이 명확한 요청형 명령으로 시작하십시오. 수동형 캡션("디지털 아트로 그린 캐릭터")은 금지됩니다.',
    '사용자가 입력한 모든 의미 있는 요소(목적/용도, 주제, 화풍, 맥락, 조명, 구도/시점, 분위기, 추가 요청, 제외할 요소)를 빠짐없이 반영하십시오. 짧은 입력 한 토막이라도 본문에 녹여야 합니다.',
    '입력이 추상적이거나 넓은 카테고리에 머문다면, 다음 차원에서 능동적으로 시각적 디테일을 보강하십시오: 주제의 실루엣과 자세, 의상/소재의 질감과 색감, 배경의 공간감과 디테일, 카메라 시점·렌즈 느낌·심도, 조명의 방향·색온도·하이라이트와 그림자, 분위기/감정 톤, 후처리(필름 그레인, 보케, 컬러 그레이딩), 렌더링 품질(8K, 시네마틱, 하이퍼리얼리스틱 등).',
    '단, 사용자가 명시하지 않은 고유명사(실존 인물, 브랜드, 특정 장소·작품명)나 사실 주장을 새로 지어내지는 마십시오. 보강은 일반적이고 시각적인 묘사에 한정합니다.',
    '서로 어울리지 않는 키워드 조합(예: "차가운 촛불 조명")은 그대로 두지 말고, "푸른 그림자가 드리워진 차가운 톤의 촛불 빛"처럼 하나의 일관된 아트 디렉션으로 자연스럽게 풀어내십시오.',
    '한 단락의 자연스러운 한국어로 작성하되, 일반적으로 다음 순서를 따르십시오: (1) 생성 요청 + 매체/품질 → (2) 주제와 그 외형/자세/행동 → (3) 배경·맥락·환경 → (4) 화풍과 시각 레퍼런스 → (5) 구도·카메라·시점 → (6) 조명과 색온도 → (7) 분위기와 감정 톤 → (8) 텍스처/후처리/디테일 품질 → (9) 활용 용도가 분명할 경우 그 맥락.',
    '입력이 충분할 때는 약 400~700자 한국어로 작성하십시오. 짧은 입력일 경우에도 라벨 나열이 아닌 250~400자의 풍부한 묘사 문단으로 만들어내십시오.',
    '구체적 감각 묘사를 적극 활용하십시오: 빛의 방향과 부드러움, 그림자의 윤곽, 색의 온도와 채도, 표면의 질감과 반사, 공기와 입자(먼지·안개·빛 입자), 카메라의 초점과 보케 같은 요소들을 문장에 녹여 풍부한 시각적 정보를 제공합니다.',
    '사용자 입력에 영어가 섞여 있어도 최종 출력은 자연스러운 한국어 문장으로 통합하십시오. 다만 고유명사·기술 용어·비율 표기(예: bokeh, HDR, 16:9, Midjourney, Sony A7, 50mm, f/1.8)는 원어를 유지해도 됩니다.',
    '"추가 요청 사항"으로 들어온 내용은 본문에 자연스럽게 통합하거나, 본문 마지막에 "추가 요청: ..." 한 줄로 분리하여 명시하십시오.',
    '"NEGATIVE" / "Negative prompt"로 들어온 내용은 본문 다음 줄에 별도로 "제외할 요소: ..." 형태로 정리하십시오. 영어 키워드는 그대로 두되, 자연스럽게 한국어 보조 설명을 붙여도 좋습니다.',
    '나쁜 출력 예 (절대 이렇게 하지 말 것): "디지털 아트, 어두운 분위기, 풀바디 버드아이 샷의 캐릭터, 차가운 촛불 조명."',
    '좋은 출력 예 (이런 풍부함을 목표로 할 것): "고품질의 시네마틱 디지털 일러스트를 생성해 주세요. 어두운 돌바닥 위에 한쪽 무릎을 꿇고 검을 든 채 정면을 응시하는 망토 두른 청년 전사의 전신을, 위에서 내려다보는 버드아이 시점으로 약간 비스듬히 잡아 주세요. 배경은 폐허가 된 신전 내부로, 무너진 기둥과 흩날리는 먼지 입자들이 깊은 공간감을 만들고, 멀리 보이는 회랑은 부드러운 보케로 흐려져 인물에 시선이 집중되도록 합니다. 푸른 빛이 도는 차가운 톤의 촛불 조명이 인물의 측면을 비추어 길고 선명한 그림자를 만들며, 갑옷의 금속 질감과 망토의 거친 직조감이 또렷이 드러나도록 표현해 주세요. 전반적으로 시네마틱한 콘트라스트와 약간의 필름 그레인을 더해 어두우면서도 서사적인 분위기를 강조하고, 8K 수준의 정교한 텍스처와 사실적인 색감으로 마무리해 주세요."',
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
          maxOutputTokens: 1400,
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
