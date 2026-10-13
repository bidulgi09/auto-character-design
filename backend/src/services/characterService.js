const {
  GENRES,
  PERSONALITY_POOL,
  HAIR_COLORS,
  HAIR_STYLES,
  EYE_COLORS,
  BODY_TYPES,
  OUTFITS,
  ACCESSORIES,
} = require('../constants');
const { pick, randomInt, randomHexColor, withFallback } = require('../utils');
const { getOpenAIClient } = require('./openaiClient');

function buildRandomConfig(genreInput) {
  const genre = genreInput === '랜덤' || !genreInput ? pick(GENRES) : genreInput;
  const personality = Array.from(new Set(Array.from({ length: 3 }, () => pick(PERSONALITY_POOL))));
  while (personality.length < 3) personality.push(pick(PERSONALITY_POOL));

  return {
    name: `${pick(['루나', '카이', '하린', '시온', '미라', '진'])}${pick(['벨', '온', '아', '린', '노', '크'])}`,
    age: randomInt(16, 45),
    gender: pick(['여성', '남성', '논바이너리']),
    race: pick(genre === 'SF' ? ['안드로이드', '개조 인간', '외계인'] : ['인간', '엘프', '수인', '마도사 혈통']),
    role: pick(genre === '학원물' ? ['전학생', '학생회', '동아리장', '선도부'] : ['마법사', '정찰병', '기술자', '의무관', '정보원']),
    personality,
    appearance: {
      hairColor: pick(HAIR_COLORS),
      hairStyle: pick(HAIR_STYLES),
      eyeColor: pick(EYE_COLORS),
      bodyType: pick(BODY_TYPES),
      height: `${randomInt(150, 190)}cm`,
    },
    outfit: pick(OUTFITS),
    accessories: pick(ACCESSORIES),
    background: `${genre} 세계관에서 중요한 임무를 맡고 있으며, 최근 큰 사건의 단서를 쫓고 있다.`,
    colorPalette: Array.from({ length: 5 }, () => randomHexColor()),
    genre,
  };
}

function mergeWithLocks(baseConfig, currentConfig = {}, lockedFields = {}) {
  const merged = { ...baseConfig };
  Object.entries(lockedFields).forEach(([field, locked]) => {
    if (!locked) return;
    if (field === 'appearance' || field === 'personality' || field === 'colorPalette') {
      merged[field] = currentConfig[field] || merged[field];
      return;
    }
    merged[field] = withFallback(currentConfig[field], merged[field]);
  });
  return merged;
}

function normalizeConfig(data, fallbackGenre = '랜덤') {
  const base = buildRandomConfig(fallbackGenre);
  return {
    ...base,
    ...data,
    personality: Array.isArray(data?.personality) ? data.personality.slice(0, 3) : base.personality,
    appearance: {
      ...base.appearance,
      ...(data?.appearance || {}),
    },
    colorPalette: Array.isArray(data?.colorPalette)
      ? data.colorPalette.slice(0, 5)
      : base.colorPalette,
  };
}

async function generateFromInput({ text, imageBase64, genre }) {
  const client = getOpenAIClient();
  if (!client) {
    const draft = buildRandomConfig(genre);
    return {
      ...draft,
      background: text
        ? `${text} 분위기를 바탕으로 사건 직전의 긴장감을 담은 캐릭터 설정.`
        : `${draft.background} 참고 이미지를 반영한 색감 중심 캐릭터 설정.`,
    };
  }

  const messages = [
    {
      role: 'system',
      content:
        '캐릭터 디자이너처럼 동작하고 반드시 JSON만 반환해. 키는 name,age,gender,race,role,personality(3개 배열),appearance(hairColor,hairStyle,eyeColor,bodyType,height),outfit,accessories,background,colorPalette(HEX 5개),genre',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: `장르: ${genre || '랜덤'}\n입력 텍스트: ${text || '없음'}` },
        ...(imageBase64
          ? [
              {
                type: 'image_url',
                image_url: { url: imageBase64 },
              },
            ]
          : []),
      ],
    },
  ];

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
    temperature: 0.9,
    messages,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
  return normalizeConfig(parsed, genre);
}

module.exports = {
  buildRandomConfig,
  mergeWithLocks,
  generateFromInput,
  normalizeConfig,
};
