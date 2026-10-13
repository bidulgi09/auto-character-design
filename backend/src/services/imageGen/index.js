const { generateImage } = require('./openaiImageGen');

async function generateCharacterImage({ characterConfig, stylePrompt }) {
  const prompt = [
    'Create a full-body character illustration.',
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
