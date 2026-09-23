const codes = Object.freeze({
  FILE_REQUIRED: 'FILE_REQUIRED',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
});

class DocumentError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DocumentError';
    this.code = code;
  }

  static fileRequired() {
    return new DocumentError(codes.FILE_REQUIRED, 'Arquivo é obrigatório.');
  }

  static notFound() {
    return new DocumentError(codes.DOCUMENT_NOT_FOUND, 'Documento não encontrado.');
  }
}

DocumentError.codes = codes;

module.exports = DocumentError;
