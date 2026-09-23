const { test } = require('node:test');
const assert = require('node:assert/strict');
const DocumentError = require('../src/errors/documentError');
const DocumentService = require('../src/services/documentService');

function createRepository() {
  return {
    documents: [],
    save(document) {
      this.documents.push(document);
      return document;
    },
    findAll() {
      return this.documents;
    },
    findById(id) {
      return this.documents.find((document) => document.id === id) || null;
    },
  };
}

test('cria metadados sem depender do formato de arquivo do Multer', () => {
  const repository = createRepository();
  const service = new DocumentService(repository);
  const documentData = {
    originalName: 'relatorio.txt',
    size: 21,
    storagePath: '/storage/generated.txt',
  };

  const document = service.create(documentData, 'usuario-1');

  assert.match(document.id, /^[0-9a-f-]{36}$/);
  assert.ok(Date.parse(document.uploadedAt));
  assert.equal(document.originalName, documentData.originalName);
  assert.equal(document.size, documentData.size);
  assert.equal(document.storagePath, documentData.storagePath);
  assert.equal(document.owner, 'usuario-1');
  assert.deepEqual(repository.documents, [document]);
});

test('rejeita criação sem dados de arquivo usando erro de negócio', () => {
  const repository = createRepository();
  const service = new DocumentService(repository);

  assert.throws(
    () => service.create(null, 'usuario-1'),
    (error) => error instanceof DocumentError && error.code === DocumentError.codes.FILE_REQUIRED,
  );
  assert.deepEqual(repository.documents, []);
});

test('lista documentos delegando ao repositório', () => {
  const repository = createRepository();
  const service = new DocumentService(repository);
  repository.documents.push({ id: 'documento-1' });

  assert.equal(service.list(), repository.documents);
});

test('busca documento existente e sinaliza documento ausente', () => {
  const repository = createRepository();
  const service = new DocumentService(repository);
  const document = { id: 'documento-1' };
  repository.documents.push(document);

  assert.equal(service.findById(document.id), document);
  assert.throws(
    () => service.findById('inexistente'),
    (error) => error instanceof DocumentError && error.code === DocumentError.codes.DOCUMENT_NOT_FOUND,
  );
});
