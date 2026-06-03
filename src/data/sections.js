// V2 section schema.
//
// Differences from V1:
//  - Only COMPOSITION (구도/시점) and LIGHTING (조명) keep the
//    chip-button (multi-select) UI.
//  - All other sections (PURPOSE, SUBJECT, STYLE, CONTEXT, MOOD,
//    NEGATIVE, the new 추가/기타) are free-text textareas with a
//    "더보기" expandable panel that lists reference words.
//
// type values:
//   'multi'      = chip multi-select (used by COMPOSITION + LIGHTING)
//   'group'      = a section with sub-fields (COMPOSITION uses this)
//   'reftext'    = free text + 더보기 reference list   (V2-only)

export const SECTIONS = [
  {
    id: 'purpose',
    title: 'PURPOSE 목적/용도',
    required: true,
    type: 'reftext',
    placeholder: '이미지의 용도를 자유롭게 적어주세요. 예) 발표용 슬라이드 표지 이미지',
    references: [
      'SNS 게시물', '블로그/홈페이지 이미지', '광고/마케팅용', '발표 자료',
      '교육 자료', '개인 소장/취미', '디자인 시안', '아트워크/창작용',
      '카탈로그 사진', '제품 컷', '명함/리플렛', '포스터',
      '캐릭터 디자인', '게임 에셋', '이력서·포트폴리오', '책표지/북커버',
      '비율: 1:1 (정사각)', '비율: 16:9 (와이드)', '비율: 9:16 (세로)', '비율: 4:5 (인스타)',
    ],
  },
  {
    id: 'subject',
    title: 'SUBJECT 주제(주체/대상)',
    required: true,
    type: 'reftext',
    placeholder: '무엇/누가 이미지의 주인공인지 자세히 적어주세요. 예) 20대 여성 1명, 검은 코트, 카메라를 들고 거리를 걷는 모습',
    references: [
      '카테고리 — 인물(Person), 캐릭터(Character), 동물(Animal), 사물(Object), 풍경(Landscape), 추상(Abstract)',
      '인물 — 어린이, 청소년, 청년, 중년, 노년 / 남성, 여성',
      '인물 디테일 — 인원수, 행동/포즈, 의상, 외형, 표정, 시선',
      '동물 — 고양이, 강아지, 토끼, 호랑이, 사슴, 펭귄, 새, 곰, 물개',
      '사물 — 컵, 가방, 자동차, 시계, 카메라, 책, 음식, 꽃, 보석, 가구',
      '풍경 — 도시, 시골, 사막, 숲, 산, 바다, 강, 호수, 해변, 우주, 카페, 사무실',
      '추상 — 패턴, 기하, 색의 흐름, 입자, 빛, 그림자, 텍스처',
    ],
  },
  {
    id: 'style',
    title: 'STYLE 화풍 (스타일)',
    required: true,
    type: 'reftext',
    placeholder: '어떤 화풍/스타일로 그리고 싶은지 적어주세요. 예) 따뜻한 색감의 수채화, 손그림 느낌',
    references: [
      'Medium — 사진(Photorealistic), 유화(Oil), 아크릴(Acrylic), 수채화(Watercolor)',
      'Medium — 디지털 아트, 픽셀아트, 3D 렌더, 일러스트레이션, 만화/애니',
      '시대/사조 — 르네상스, 인상주의, 표현주의, 추상, 팝아트, 미니멀',
      '시대/사조 — 사이버펑크, 솔라펑크, 빈티지, 레트로, 콘셉트 아트',
      '질감 — 손그림, 두꺼운 붓터치, 잉크 드로잉, 콜라주, 종이 질감, 필름 그레인',
      '키워드 — 시네마틱, 드라마틱, 부드러운, 깨끗한, 디테일한, 분위기 있는',
    ],
  },
  {
    id: 'context',
    title: 'CONTEXT 맥락(배경)',
    required: false,
    type: 'reftext',
    placeholder: '배경/시간대/계절/날씨 등 맥락을 적어주세요. 예) 비 오는 도쿄 거리, 늦은 밤',
    references: [
      '시간 — 새벽, 아침, 낮, 오후, 황혼, 밤, 한밤중',
      '계절 — 봄, 여름, 가을, 겨울',
      '날씨 — 화창, 흐림, 비, 눈, 안개, 폭풍, 무지개',
      '배경 — 도쿄 거리, 카페, 아늑한 실내, 사무실, 공원, 해변, 산속, 우주 정거장',
      '시대 — 현대, 과거(1980년대/19세기/중세), 근미래, 미래, 판타지',
      '환경 — 도시, 자연, 실내, 야외, 지하, 상공',
    ],
  },
  // —— chip-based, kept from V1 ——
  {
    id: 'lighting',
    title: 'LIGHTING 조명',
    required: false,
    type: 'multi',
    options: [
      'Natural', 'Studio', 'Neon', 'Candle', 'Dramatic', 'Soft',
      'Color Temperature: Warm', 'Color Temperature: Cool',
      'Backlight', 'Top light', 'Side light', 'Other',
    ],
    custom: true,
  },
  {
    id: 'composition',
    title: 'COMPOSITION 구도/시점',
    required: false,
    type: 'group',
    fields: [
      {
        id: 'shot',
        label: 'Shot (앵글)',
        type: 'multi',
        options: ['Top-down', 'Eye-level', 'Bird-eye', 'Worm-eye', 'Side', 'Three-quarter', 'Other'],
        custom: true,
      },
      {
        id: 'distance',
        label: 'Distance (거리)',
        type: 'multi',
        options: ['Close-up', 'Medium', 'Full-body', 'Wide', 'Extreme Close-up', 'Other'],
        custom: true,
      },
    ],
  },
  // ———————————————————————————
  {
    id: 'mood',
    title: 'MOOD 분위기',
    required: false,
    type: 'reftext',
    placeholder: '전체 분위기/감정을 적어주세요. 예) 잔잔하고 따뜻한, 약간의 외로움',
    references: [
      '평화로운', '신비로운', '어두운', '역동적', '로맨틱한', '향수 어린',
      '에너제틱', '외로운', '아늑한', '행복한', '슬픈', '긴장된',
      '평온한', '신성한', '몽환적인', '황홀한', '권태로운', '환상적인',
      '색감 — 따뜻한 톤, 차가운 톤, 모노크롬, 파스텔, 비비드, 듀오톤',
    ],
  },
  {
    id: 'negative',
    title: 'NEGATIVE 제외할 요소',
    required: false,
    type: 'reftext',
    placeholder: '이미지에 들어가면 안 되는 요소를 적어주세요. 예) 워터마크, 글자, 손가락 이상',
    references: [
      'blurry (흐림)', 'low resolution (저해상도)', 'low quality (저품질)',
      'text (글자)', 'watermark (워터마크)', 'signature (서명)', 'logo (로고)',
      'extra fingers (손가락 이상)', 'distorted (왜곡)', 'deformed (변형)',
      'jpeg artifacts (압축 노이즈)', 'oversaturated (과채도)',
      'grainy (입자감)', 'oversharpened (과샤프닝)', 'NSFW',
      'duplicate (중복)', 'cropped (잘림)', 'out of frame (프레임 밖)',
    ],
  },
  {
    id: 'extras',
    title: '추가/기타 항목',
    required: false,
    type: 'reftext',
    placeholder: '위에서 다 못 적은 추가 요청 사항을 자유롭게 적어주세요. 예) 우측 하단에 작은 "PromptGen" 워터마크 넣기 / 필름 그레인 효과 / 16:9 비율 고정 등',
    references: [
      '비율/해상도 — 16:9, 1:1, 9:16, 4:5, 4K, 8K',
      '카메라 — Sony A7, Canon 5D, Fujifilm X-T4, 50mm 렌즈, 35mm 필름',
      '효과 — 보케(bokeh), 비네팅, 필름 그레인, 모션 블러, HDR, 색수차',
      '포함하고 싶은 텍스트 — 자막, 상호명, 작은 워터마크',
      '색상 팔레트 — 따뜻한 베이지+브라운 / 차가운 블루+화이트 / 듀오톤 등',
      '후처리 — 소프트 필터, 빈티지 톤, 콘트라스트 강조',
      '레퍼런스 분위기 — 영화 제목, 사진작가 이름, 잡지 스타일 등',
    ],
  },
]
