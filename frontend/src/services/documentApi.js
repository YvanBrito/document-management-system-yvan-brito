const API_PREFIX = '/api';

async function parseJsonResponse(response) {
  if (response.ok) {
    return response.json();
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error || 'Não foi possível concluir a operação.');
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`);
  return parseJsonResponse(response);
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseJsonResponse(response);
}

export function getDocumentDownloadUrl(documentId) {
  return `${API_PREFIX}/documents/${encodeURIComponent(documentId)}/download`;
}