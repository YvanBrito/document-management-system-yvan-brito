class DocumentRepository {
  constructor() {
    this.documents = new Map();
  }

  save(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findAll() {
    return Array.from(this.documents.values());
  }

  findById(id) {
    return this.documents.get(id) || null;
  }
}

module.exports = DocumentRepository;