// backend/src/constants.js

const GENRES = ['판타지', 'SF', '현대', '학원물', '동양풍'];

const IMAGE_STYLES = {
  '애니풍': 'anime illustration, clean line art',
  '수채화': 'watercolor painting style, soft texture',
  '픽셀아트': 'pixel art, retro game style',
  '반실사': 'semi-realistic character illustration',
  '라인아트': 'minimal line art, monochrome accent',
};

const PERSONALITY_POOL = [
  '침착함', '활발함', '냉소적', '친절함', '호기심 많음', 
  '고집 셈', '신중함', '유쾌함', '야망가', '의협심'
];

const HAIR_COLORS = ['검정', '은색', '금발', '청록', '적갈색', '백금색'];
const HAIR_STYLES = ['단발', '장발', '포니테일', '웨이브', '숏컷', '투블럭'];
const EYE_COLORS = ['갈색', '파랑', '녹색', '회색', '보라', '호박색'];
const BODY_TYPES = ['슬림', '균형 잡힘', '탄탄함', '왜소함', '큰 체격'];
const OUTFITS = ['전투복', '후드와 코트', '교복', '전통 의복', '정장', '탐험가 복장', '후드티', '크롭후드'];
const ACCESSORIES = ['낡은 책', '기계식 시계', '목걸이', '귀걸이', '장갑', '지도', '헤드셋', '검', '안대', '마스크', '단도', '가방'];

// 후드 무작위 부품 조합 엔진 상수는 그대로 유지
const HOOD_COMPONENTS = {
  fits: ['oversized cyberpunk streetwear', 'loose-fit urban baggy', 'cropped tactical techwear', 'relaxed athletic activewear', 'heavyweight drop-shoulder vintage'],
  types: ['pullover hoodie', 'zip-up tech jacket with a deep cowl hood', 'layered double-hoodie', 'high-collar drawstring hoodie', 'asymmetric buckle hood garment'],
  details: ['heavy dangling dual drawstrings', 'exposed metal zippers and utility straps', 'cargo utility arm pouches with functional buckles', 'thumbhole rib cuffs and a high-neck snood mask', 'tactical d-ring harness accents'],
  graphics: ['minimalist futuristic cybernetic vector print on chest', 'bold high-contrast graphic print on sleeves', 'clean flat solid blocking design', 'subtle monochromatic lines across shoulders', 'distressed vintage edge finish']
};

const translateToEnglish = (text) => {
  // 💡 [버그 원천 차단] 들어온 데이터가 없거나 문자열 타입이 아니라면 .trim()을 호출하지 않고 공백 문자열 안전 반환
  if (!text || typeof text !== 'string') return '';
  
  const cleanText = text.trim();
  const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 후드 조합 기믹 연동
  if (cleanText === '후드티' || cleanText === '크롭후드' || cleanText === '후드와 코트') {
    const randomFit = randomPick(HOOD_COMPONENTS.fits);
    const randomType = randomPick(HOOD_COMPONENTS.types);
    const randomDetail = randomPick(HOOD_COMPONENTS.details);
    const randomGraphic = randomPick(HOOD_COMPONENTS.graphics);

    if (cleanText === '후드와 코트') {
      return `a stylish layers outfit consisting of an ${randomFit} ${randomType} featuring ${randomDetail}, layered perfectly beneath a long structured winter duster coat with deep pockets and explicit fabric folds`;
    }
    if (cleanText === '크롭후드') {
      return `a cropped techwear-style ${randomType} with ${randomDetail}, featuring ${randomGraphic}, exposing a sleek high-contrast midriff silhouette`;
    }
    return `an ${randomFit} ${randomType} designed with ${randomDetail}, decorated with a ${randomGraphic}, showcasing prominent structured fabric creases and heavy realistic folds`;
  }

  const dict = {
    // 1. GENRES
    '판타지': 'epic high-fantasy world theme',
    'SF': 'futuristic sci-fi cyberpunk universe aesthetic',
    '현대': 'modern cinematic urban city background',
    '학원물': 'contemporary anime high school academy background',
    '동양풍': 'ancient traditional eastern oriental mythology theme',

    // 2. PERSONALITY_POOL
    '침착함': 'calm and composed expression, relaxed standing posture, serene aura',
    '활발함': 'vibrant energetic smile, dynamic and confident pose, cheerful expression',
    '냉소적': 'cynical smirk, sharp cold intense gaze, arrogant and aloof posture',
    '친절함': 'gentle warm smile, soft welcoming expression, kind and approachable stance',
    '호기심 많음': 'curious eyes, inquisitive facial expression, slight head tilt with sparkling pupils',
    '고집 셈': 'stubborn determined frown, firm defensive standing posture, resolute sharp gaze',
    '신중함': 'cautious focused expression, calculated elegant posture, alert and intelligent eyes',
    '유쾌함': 'playful mischievous grin, lively confident body language, cheerful anime mood',
    '야망가': 'ambitious sharp smirk, commanding confident posture, fierce driven gaze',
    '의협심': 'righteous heroic expression, proud powerful stance, brave and noble facial contours',

    // 3. HAIR_COLORS
    '검정': 'obsidian black hair', '은색': 'shimmering silver hair', '금발': 'radiant golden blonde hair', 
    '청록': 'vibrant cyan-teal hair', '적갈색': 'deep auburn chestnut hair', '백금색': 'luminescent platinum blonde hair',
    
    // 4. HAIR_STYLES
    '단발': 'sharp blunt bob cut, symmetrical short hair, crisp hair ends',
    '장발': 'flowing sleek long hair, finely detailed loose strands, neat anime hair partition',
    '포니테일': 'high-tied anime ponytail with a distinct sleek hair band, bouncy strands',
    '웨이브': 'elegant soft wavy locks, layered voluminous cartoon waves, clear hair flow',
    '숏컷': 'textured pixie short cut, stylish tomboy hair contours, defined sideburns',
    '투블럭': 'modern undercut with textured messy top hair, sharp clean faded sides',
    '울프컷': 'layered wolf cut, shaggy textured back hair, sharp choppy frames around face',
    '리프컷': 'feathered leaf cut, natural parting curtains hair, soft textured side flows',
    '히메컷': 'classic hime cut, blunt straight face-framing side strands, long flat back hair',
    '양갈래': 'cute twin tails, double pigtails secured with ribbons, symmetrical clear splits',
    '트윈테일': 'long high twin-tails, voluminous bouncy side hair strands',
    '반묶음': 'elegant half-up half-down hairstyle, top tied neatly back, cascading bottom hair',
    '허쉬컷': 'lightweight shaggy hush cut, extreme layered hair ends, wispy air bangs',
    
    // 5. EYE_COLORS
    '갈색': 'warm hazel brown eyes, glossy detailed irises, crystal clear pupils',
    '파랑': 'piercing sapphire blue eyes, glowing distinct irises, explicit sharp anime eyes',
    '녹색': 'brilliant emerald green eyes, deep starry pupils, high visibility anime eyeliner',
    '회색': 'cool misty grey eyes, sharp focused intense gaze, highly defined dark eyelashes',
    '보라': 'mystical amethyst purple eyes, vivid radiant pupils, clear anime expression',
    '호박색': 'sharp amber gold cat-like eyes, highly detailed cat pupils, intense clear gaze',

    // 6. BODY_TYPES
    '슬림': 'slender lean physique, elegant elongated anime proportions, aesthetic slim body lines',
    '균형 잡힘': 'well-proportioned athletic build, perfect symmetrical anatomy, standard heroic body type',
    '탄탄함': 'fit toned muscles, defined athletic core, powerful and sleek body contour',
    '왜소함': 'petite small frame, slender narrow shoulders, delicate low-stature silhouette',
    '큰 체격': 'muscular bulky physique, broad imposing shoulders, tall powerful solid body shape',
    
    // 7. OUTFITS
    '전투복': 'tactical armored combat uniform with utility belts, mechanical buckles, straps, and clean plating',
    '교복': 'tailored high school academy uniform, crisp white collared shirt, sharp necktie, and fitted blazer with stitch line details',
    '전통 의복': 'elegant traditional robe oriental costume, intricate flat geometric line patterns on borders, flowing wide sleeves',
    '정장': 'modern slim-fit formal suit jacket, sharp lapels, neat buttoned vest, and pressed dress shirt seams',
    '탐험가 복장': 'rugged adventurer travel outfit, high-collar utility jacket with zippers, multiple leather harness belts, and reinforced gear pouches',
    
    // 8. ACCESSORIES
    '낡은 책': 'carrying an ancient tattered leather-bound grimoire book with ink runes',
    '기계식 시계': 'wearing an intricate steampunk mechanical pocket watch with detailed internal brass gears',
    '목걸이': 'a delicate metallic chain pendant necklace resting clearly on chest',
    '귀걸이': 'sharp metallic stud earrings glinting distinctly on ears',
    '장갑': 'sleek fingerless tight leather combat gloves',
    '지도': 'holding a rolled antique parchment world map with explicit ink topography lines',
    '헤드셋': 'sleek futuristic neon-lit over-ear headphones resting on neck',
    '검': 'holding a sleek katana sword with a detailed tsuba guard and wrapped hilt wrap',
    '안대': 'wearing a sleek black fabric tactical eyepatch over one eye',
    '마스크': 'wearing a techwear cloth face mask covering mouth and nose',
    '단도': 'sheathed tactical dagger attached to the outer thigh utility harness strap',
    '가방': 'sling messenger bag with multiple custom graphic anime pins and badges'
  };

  return dict[cleanText] || cleanText;
};

module.exports = {
  GENRES,
  IMAGE_STYLES,
  PERSONALITY_POOL,
  HAIR_COLORS,
  HAIR_STYLES,
  EYE_COLORS,
  BODY_TYPES,
  OUTFITS,
  ACCESSORIES,
  translateToEnglish,
};
