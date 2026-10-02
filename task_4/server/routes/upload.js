const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max limit
});

router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const isImage = req.file.mimetype.startsWith('image/');
  const isAudio = req.file.mimetype.startsWith('audio/');
  const type = isImage ? 'image' : isAudio ? 'audio' : 'file';

  res.json({
    message: 'File uploaded successfully',
    file: {
      url: fileUrl,
      filename: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type
    }
  });
});

module.exports = router;
