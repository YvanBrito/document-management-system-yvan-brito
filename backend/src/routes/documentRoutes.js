const { randomUUID } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

function createDocumentRouter(documentController, storagePath) {
  mkdirSync(storagePath, { recursive: true });

  const storage = multer.diskStorage({
    destination: storagePath,
    filename: (request, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  });
  const upload = multer({ storage });
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = createDocumentRouter;