const express = require('express');
const path = require('node:path');
const DocumentController = require('./controllers/documentController');
const { NotFoundError, ValidationError } = require('./errors/applicationErrors');
const DocumentRepository = require('./repositories/documentRepository');
const createDocumentRouter = require('./routes/documentRoutes');
const DocumentService = require('./services/documentService');

const app = express();
const PORT = process.env.PORT || 3000;
const storagePath = process.env.STORAGE_PATH || path.resolve(__dirname, '../storage');

const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
const documentController = new DocumentController(documentService);

app.use(express.json());
app.use(createDocumentRouter(documentController, storagePath));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  const statusCodeByError = new Map([
    [ValidationError, 400],
    [NotFoundError, 404],
  ]);
  const statusCode = statusCodeByError.get(error.constructor) || error.statusCode || 500;

  return response.status(statusCode).json({
    error: statusCode < 500 ? error.message : 'Erro interno do servidor.',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
