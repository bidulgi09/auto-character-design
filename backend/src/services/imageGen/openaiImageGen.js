const { getOpenAIClient } = require('../openaiClient');

async function generateImage(prompt) {
  const client = getOpenAIClient();
  if (!client) {
    // 한국어 주석: API 키가 없을 때는 프론트에서 안내할 수 있는 더미 이미지를 반환한다.
    return {
      imageUrl:
        'https://placehold.co/1024x1024/png?text=Set+OPENAI_API_KEY+to+generate+real+images',
    };
  }

  const response = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    prompt,
    size: '1024x1024',
  });

  return {
    imageUrl: response.data?.[0]?.url || null,
    b64Json: response.data?.[0]?.b64_json || null,
  };
}

module.exports = { generateImage };
