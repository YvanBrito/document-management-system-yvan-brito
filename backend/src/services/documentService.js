const { randomUUID } = require('node:crypto');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  create(file, owner) {
    if (!file) {
      const error = new Error('Arquivo é obrigatório.');
      error.statusCode = 400;
      throw error;
    }

    return this.documentRepository.save({
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'anonymous',
      storagePath: file.path,
    });
  }

  list() {
    return this.documentRepository.findAll();
  }

  findById(id) {
    const document = this.documentRepository.findById(id);

    if (!document) {
      const error = new Error('Documento não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return document;
  }
}

module.exports = DocumentService;