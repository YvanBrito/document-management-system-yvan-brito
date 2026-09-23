function toResponse(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload = (request, response, next) => {
    try {
      const document = this.documentService.create(request.file, request.body.owner);
      response.status(201).json(toResponse(document));
    } catch (error) {
      next(error);
    }
  };

  list = (request, response, next) => {
    try {
      response.json(this.documentService.list().map(toResponse));
    } catch (error) {
      next(error);
    }
  };

  download = (request, response, next) => {
    try {
      const document = this.documentService.findById(request.params.id);
      response.download(document.storagePath, document.originalName, (error) => {
        if (error && !response.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DocumentController;