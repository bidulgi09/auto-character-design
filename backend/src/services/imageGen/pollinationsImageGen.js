async function generateImage(prompt) {
  const params = new URLSearchParams({
    width: '1024',
    height: '1024',
    nologo: 'true',
    private: 'true',
    model: process.env.POLLINATIONS_IMAGE_MODEL || 'flux',
  });

  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;

  return {
    imageUrl,
  };
}

module.exports = { generateImage };
