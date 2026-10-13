// /workspaces/auto-character-design/backend/src/services/imageGen/index.js
const { generateImage } = require('./pollinationsImageGen');
const { translateToEnglish } = require('../../constants'); 

async function generateCharacterImage({ characterConfig, stylePrompt }) {
  // 💡 [오타 수정] 변수명을 personalityEn으로 명확하게 정의합니다.
  const personalityEn = Array.isArray(characterConfig.personality)
    ? characterConfig.personality.map(translateToEnglish).join(', ')
    : '';

  const genreEn = translateToEnglish(characterConfig.genre) || '';
  const bodyTypeEn = translateToEnglish(characterConfig.appearance?.bodyType) || 'standard heroic body type';
  const hairColorEn = translateToEnglish(characterConfig.appearance?.hairColor) || '';
  const hairStyleEn = translateToEnglish(characterConfig.appearance?.hairStyle) || '';
  
  const outfitEn = translateToEnglish(characterConfig.outfit) || '';
  const accessoriesEn = translateToEnglish(characterConfig.accessories) || '';
  const paletteStr = Array.isArray(characterConfig.colorPalette) 
    ? characterConfig.colorPalette.join(', ') 
    : '';

  const promptParts = [
    // 💡 [레이아웃 및 일관성 마스터 지시문]
    `A unified 2D anime character reference sheet, exact design consistency across all panels, strict identical character blueprint`,
    
    // 💡 [좌우 상속 관계 명시] 오른쪽은 왼쪽의 '완벽한 복제 도면'임을 주입
    `Left side: A complete full-body front view portrait of the character, showcasing the precise ${bodyTypeEn} silhouette, detailed outfit, and hairstyle.`,
    `Right side: Technical callout sections that MUST mirror the exact same character from the left side, showing an identical back-view of the head with matching ${hairColorEn} hair, and close-up detail boxes of the same costume pieces.`,
    
    // 💡 디자인 유실 및 변형 차단 장치 (짝짝이 방지)
    `Absolute perfect match in colors, fabric textures, clothing lines, and patterns between the full-body view and the detail callouts, no layout discrepancy, no random variations`,
    
    // 💡 이목구비 완전 노출
    `The main character face is 100% visible, explicit sharp defined anime eyes, prominent clear irises, perfectly drawn narrow nose and mouth lips, distinct clean facial contours, absolute zero blur`,
    
    // 💡 머리카락 및 의상 구체 스펙 결합 (상수 동적 데이터)
    `Hair features: highly detailed ${hairColorEn} ${hairStyleEn}, sharp layered tips, distinctly visible split strands.`,
    `Costume specifications: ${outfitEn}, emphasizing explicit structural fabric folds, deep creases, sharp garment seams. Accessories: ${accessoriesEn}`,
    
    // 💡 화풍 락인 (Zimage 전용 2D 클린 라인아트)
    `2D anime vector artwork, clean flat color fills, strict cel-shaded block coloring, crisp rich ink outlines, highly defined black borders, no soft gradients, no 3D volumetric shadows, no painterly textures`,
    
    // 배경 순백색 격리
    `isolated entirely on a plain solid flat clean white background, zero noise artifacts`,
    // 💡 정의된성 personalityEn 변수를 안전하게 주입
    `Theme: ${genreEn}, pose vibe: ${personalityEn}, color swatches: ${paletteStr}, art style: ${stylePrompt || 'anime visual'}`
  ].filter(Boolean);

  const finalPrompt = promptParts.join(', ');

  return generateImage(finalPrompt);
}

module.exports = { generateCharacterImage };
