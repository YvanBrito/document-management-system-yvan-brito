const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

let storagePath;
let server;
let baseUrl;

before(async () => {
  storagePath = await mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  process.env.STORAGE_PATH = storagePath;

  const app = require('../src/app');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(storagePath, { recursive: true, force: true });
  delete process.env.STORAGE_PATH;
});

test('permite enviar, listar e baixar um documento', async () => {
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo do documento'], { type: 'text/plain' }), 'relatorio.txt');
  formData.append('owner', 'usuario-1');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.match(document.id, /^[0-9a-f-]{36}$/);
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.owner, 'usuario-1');
  assert.equal(document.size, 21);
  assert.ok(Date.parse(document.uploadedAt));

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [document]);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.txt/);
  assert.equal(await downloadResponse.text(), 'conteudo do documento');
});

test('trata upload sem arquivo e download inexistente', async () => {
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: new FormData(),
  });
  assert.equal(uploadResponse.status, 400);
  assert.deepEqual(await uploadResponse.json(), { error: 'Arquivo é obrigatório.' });

  const downloadResponse = await fetch(`${baseUrl}/documents/inexistente/download`);
  assert.equal(downloadResponse.status, 404);
  assert.deepEqual(await downloadResponse.json(), { error: 'Documento não encontrado.' });
});
