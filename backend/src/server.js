require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { upload } = require('./middleware/upload');
const { IMAGE_STYLES } = require('./constants');
const {
  buildRandomConfig,
  mergeWithLocks,
  generateFromInput,
} = require('./services/characterService');
const { generateCharacterImage } = require('./services/imageGen');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/character/random', (req, res, next) => {
  try {
    const { genre, currentConfig, lockedFields, includeProfileInfo } = req.body || {};
    const generated = buildRandomConfig(genre, {
      includeProfileInfo: includeProfileInfo !== false,
    });
    const merged = mergeWithLocks(generated, currentConfig, lockedFields);
    res.json({ characterConfig: merged });
  } catch (error) {
    next(error);
  }
});

app.post('/api/character/from-input', upload.single('image'), async (req, res, next) => {
  try {
    const image = req.file;
    const imageBase64 = image
      ? `data:${image.mimetype};base64,${image.buffer.toString('base64')}`
      : null;

    const characterConfig = await generateFromInput({
      text: req.body?.text,
      genre: req.body?.genre,
      imageBase64,
      includeProfileInfo: req.body?.includeProfileInfo !== 'false',
    });

    res.json({ characterConfig });
  } catch (error) {
    next(error);
  }
});

app.post('/api/image/generate', async (req, res, next) => {
  try {
    const { characterConfig, style } = req.body || {};
    if (!characterConfig) {
      res.status(400).json({ message: '캐릭터 설정이 없어 이미지를 생성할 수 없습니다.' });
      return;
    }

    const stylePrompt = IMAGE_STYLES[style] || IMAGE_STYLES['애니풍'];
    const result = await generateCharacterImage({ characterConfig, stylePrompt });

    res.json({ imageUrl: result.imageUrl });
  } catch (error) {
    next(error);
  }
});

// 한국어 주석: 사용자에게 이해하기 쉬운 에러 메시지로 변환한다.
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: '이미지 용량은 5MB 이하만 업로드할 수 있습니다.' });
    return;
  }

  if (error.message?.includes('지원하지 않는 이미지 형식')) {
    res.status(400).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
