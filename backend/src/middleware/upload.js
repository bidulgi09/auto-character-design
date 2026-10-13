const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('지원하지 않는 이미지 형식입니다. jpg/png/webp만 업로드할 수 있습니다.'));
  },
});

module.exports = { upload };
