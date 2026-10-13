const { generateImage } = require('./pollinationsImageGen');

async function generateCharacterImage({ characterConfig, stylePrompt }) {
  const prompt = [
    'Create a single-page character design sheet.',
    'The sheet must clearly include: 1) full-body front view, 2) hidden/not-visible parts details (back/inner details callout), 3) main signature item close-up, 4) representative color swatches used in the design.',
    'Use a clean layout with labeled sections so an artist can reference all details at once.',
    `Style: ${stylePrompt}`,
    `Name: ${characterConfig.name}`,
    `Role: ${characterConfig.role}`,
    `Race: ${characterConfig.race}`,
    `Personality: ${(characterConfig.personality || []).join(', ')}`,
    `Appearance: hair ${characterConfig.appearance?.hairColor}, ${characterConfig.appearance?.hairStyle}; eyes ${characterConfig.appearance?.eyeColor}; body ${characterConfig.appearance?.bodyType}; height ${characterConfig.appearance?.height}`,
    `Outfit: ${characterConfig.outfit}`,
    `Accessories: ${characterConfig.accessories}`,
    `Background: ${characterConfig.background}`,
    `Color palette: ${(characterConfig.colorPalette || []).join(', ')}`,
  ].join('\n');

  return generateImage(prompt);
}

module.exports = { generateCharacterImage };
