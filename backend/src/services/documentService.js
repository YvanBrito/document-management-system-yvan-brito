const { randomUUID } = require('node:crypto');
const DocumentError = require('../errors/documentError');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  create(documentData, owner) {
    if (!documentData) {
      throw DocumentError.fileRequired();
    }

    return this.documentRepository.save({
      id: randomUUID(),
      originalName: documentData.originalName,
      size: documentData.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'anonymous',
      storagePath: documentData.storagePath,
    });
  }

  list() {
    return this.documentRepository.findAll();
  }

  findById(id) {
    const document = this.documentRepository.findById(id);

    if (!document) {
      throw DocumentError.notFound();
    }

    return document;
  }
}

module.exports = DocumentService;