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

function buildRandomConfig(genreInput, options = {}) {
  const { includeProfileInfo = true } = options;
  const genre = genreInput === '랜덤' || !genreInput ? pick(GENRES) : genreInput;
  const personality = Array.from(new Set(Array.from({ length: 3 }, () => pick(PERSONALITY_POOL))));
  while (personality.length < 3) personality.push(pick(PERSONALITY_POOL));

  return {
    name: includeProfileInfo
      ? `${pick(['루나', '카이', '하린', '시온', '미라', '진'])}${pick(['벨', '온', '아', '린', '노', '크'])}`
      : '',
    age: includeProfileInfo ? randomInt(16, 45) : null,
    gender: includeProfileInfo ? pick(['여성', '남성', '논바이너리']) : '',
    race: includeProfileInfo
      ? pick(genre === 'SF' ? ['안드로이드', '개조 인간', '외계인'] : ['인간', '엘프', '수인', '마도사 혈통'])
      : '',
    role: includeProfileInfo
      ? pick(genre === '학원물' ? ['전학생', '학생회', '동아리장', '선도부'] : ['마법사', '정찰병', '기술자', '의무관', '정보원'])
      : '',
    personality: includeProfileInfo ? personality : [],
    appearance: {
      hairColor: pick(HAIR_COLORS),
      hairStyle: pick(HAIR_STYLES),
      eyeColor: pick(EYE_COLORS),
      bodyType: pick(BODY_TYPES),
      height: `${randomInt(150, 190)}cm`,
    },
    outfit: pick(OUTFITS),
    accessories: pick(ACCESSORIES),
    background: includeProfileInfo
      ? `${genre} 세계관에서 중요한 임무를 맡고 있으며, 최근 큰 사건의 단서를 쫓고 있다.`
      : '',
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

function normalizeConfig(data, fallbackGenre = '랜덤', options = {}) {
  const base = buildRandomConfig(fallbackGenre, options);
  return {
    ...base,
    ...data,
    personality: Array.isArray(data?.personality) ? data.personality.slice(0, 3) : base.personality,
    age:
      typeof data?.age === 'number' || data?.age === null
        ? data.age
        : base.age,
    appearance: {
      ...base.appearance,
      ...(data?.appearance || {}),
    },
    colorPalette: Array.isArray(data?.colorPalette)
      ? data.colorPalette.slice(0, 5)
      : base.colorPalette,
  };
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1];

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    return text.slice(first, last + 1);
  }

  return '{}';
}

async function generateFromInput({ text, imageBase64, genre, includeProfileInfo }) {
  const prompt = [
    '아래 입력을 기반으로 캐릭터 설정 JSON을 생성해줘.',
    '반드시 JSON만 반환하고, 키는 name,age,gender,race,role,personality(3개 배열),appearance(hairColor,hairStyle,eyeColor,bodyType,height),outfit,accessories,background,colorPalette(HEX 5개),genre 를 사용해.',
    includeProfileInfo
      ? '이름/나이/배경/직업 등 프로필 정보도 채워줘.'
      : '이름/나이/성별/종족/직업/성격/배경은 비워두고 외형, 의상, 소품, 색상 중심으로만 생성해.',
    `장르: ${genre || '랜덤'}`,
    `텍스트 입력: ${text || '없음'}`,
    imageBase64
      ? '이미지 입력: 참고 이미지가 제공되었으니 분위기, 색감, 의상 단서를 반영해.'
      : '이미지 입력: 없음',
  ].join('\n');

  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.POLLINATIONS_TEXT_MODEL || 'openai',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('pollinations text api failed');
    }

    const payload = await response.json();
    const rawText = payload?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(extractJson(rawText));
    return normalizeConfig(parsed, genre, { includeProfileInfo });
  } catch (error) {
    const draft = buildRandomConfig(genre, { includeProfileInfo });
    return {
      ...draft,
      background: text
        ? `${text} 분위기를 바탕으로 사건 직전의 긴장감을 담은 캐릭터 설정.`
        : `${draft.background} 참고 이미지를 반영한 색감 중심 캐릭터 설정.`,
    };
  }
}

module.exports = {
  buildRandomConfig,
  mergeWithLocks,
  generateFromInput,
  normalizeConfig,
};
