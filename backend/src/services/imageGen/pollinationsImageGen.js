// pollinationsImageGen.js
const BASE_URL = process.env.POLLINATIONS_BASE_URL || 'https://gen.pollinations.ai';
const TIMEOUT_MS = 90_000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_URL_LENGTH = 7500;

// 한국어 주석: 사용자에게 보여줄 메시지를 담은 에러를 만든다.
function userError(status, userMessage) {
  const err = new Error(userMessage);
  err.status = status;
  err.userMessage = userMessage;
  return err;
}

async function generateImage(prompt) {
  // 한국어 주석: 키는 .env에서만 읽는다. 코드에 기본값을 두지 않는다.
  const apiKey = (process.env.POLLINATIONS_API_KEY || '').trim();
  if (!apiKey) {
    console.error('[imageGen] POLLINATIONS_API_KEY is not set');
    throw userError(503, '이미지 생성 설정이 되어 있지 않습니다. 관리자에게 문의해주세요.');
  }

  const params = new URLSearchParams({
    width: '768',
    height: '1024',
    nologo: 'true',
    private: 'true',
    model: process.env.POLLINATIONS_IMAGE_MODEL || 'zimage',
    seed: String(Math.floor(Math.random() * 1_000_000_000)),
  });

  const url = `${BASE_URL}/image/${encodeURIComponent(prompt)}?${params.toString()}`;
  if (url.length > MAX_URL_LENGTH) {
    throw userError(400, '캐릭터 설정이 너무 길어 이미지를 생성할 수 없습니다. 내용을 줄여주세요.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 한국어 주석: 키는 헤더로만 보낸다. URL은 로그에 찍지 않는다.
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      console.error('[imageGen] failed:', response.status, detail);
      throw userError(502, '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0];
    if (!contentType.startsWith('image/')) {
      console.error('[imageGen] unexpected content-type:', contentType);
      throw userError(502, '이미지 생성 결과가 올바르지 않습니다. 다시 시도해주세요.');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw userError(502, '생성된 이미지가 너무 큽니다. 다시 시도해주세요.');
    }

    return { imageUrl: `data:${contentType};base64,${buffer.toString('base64')}` };
  } catch (error) {
    if (error.userMessage) throw error;
    console.error('[imageGen] error:', error.name === 'AbortError' ? 'timeout' : error.message);
    throw userError(504, '이미지 생성이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.');
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { generateImage };