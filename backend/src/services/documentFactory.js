const { randomUUID } = require('node:crypto');
const { ValidationError } = require('../errors/applicationErrors');

function createDocument(file, owner, dependencies = {}) {
  if (!file) {
    throw new ValidationError('Arquivo é obrigatório.');
  }

  const generateId = dependencies.generateId || randomUUID;
  const getCurrentDate = dependencies.getCurrentDate || (() => new Date());

  return {
    id: generateId(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: getCurrentDate().toISOString(),
    owner: owner || 'anonymous',
    storagePath: file.path,
  };
}

module.exports = createDocument;
