const { NotFoundError } = require('../errors/applicationErrors');
const createDocument = require('./documentFactory');

class DocumentService {
  constructor(documentRepository, documentFactory = createDocument) {
    this.documentRepository = documentRepository;
    this.documentFactory = documentFactory;
  }

  create(file, owner) {
    return this.documentRepository.save(this.documentFactory(file, owner));
  }

  list() {
    return this.documentRepository.findAll();
  }

  findById(id) {
    const document = this.documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError('Documento não encontrado.');
    }

    return document;
  }
}

module.exports = DocumentService;