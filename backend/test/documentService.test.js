const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NotFoundError, ValidationError } = require('../src/errors/applicationErrors');
const createDocument = require('../src/services/documentFactory');
const DocumentService = require('../src/services/documentService');

test('cria metadados de documento com dependências determinísticas', () => {
  const file = {
    originalname: 'relatorio.txt',
    path: '/storage/documento.txt',
    size: 21,
  };
  const uploadedAt = new Date('2026-09-23T14:00:00.000Z');

  const document = createDocument(file, 'usuario-1', {
    generateId: () => 'documento-1',
    getCurrentDate: () => uploadedAt,
  });

  assert.deepEqual(document, {
    id: 'documento-1',
    originalName: 'relatorio.txt',
    size: 21,
    uploadedAt: uploadedAt.toISOString(),
    owner: 'usuario-1',
    storagePath: '/storage/documento.txt',
  });
});

test('rejeita a criação sem arquivo', () => {
  assert.throws(
    () => createDocument(),
    (error) => error instanceof ValidationError && error.message === 'Arquivo é obrigatório.',
  );
});

test('delega criação e persistência do documento', () => {
  const expectedDocument = { id: 'documento-1' };
  const file = { originalname: 'relatorio.txt' };
  const documentFactory = (receivedFile, owner) => {
    assert.equal(receivedFile, file);
    assert.equal(owner, 'usuario-1');
    return expectedDocument;
  };
  const repository = {
    save(document) {
      assert.equal(document, expectedDocument);
      return document;
    },
  };
  const service = new DocumentService(repository, documentFactory);

  assert.equal(service.create(file, 'usuario-1'), expectedDocument);
});

test('retorna erro específico quando o documento não existe', () => {
  const service = new DocumentService({
    findById: () => null,
  });

  assert.throws(
    () => service.findById('inexistente'),
    (error) => error instanceof NotFoundError && error.message === 'Documento não encontrado.',
  );
});
