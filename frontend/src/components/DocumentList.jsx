import DownloadButton from './DownloadButton.jsx';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
  }

  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p className="list-status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhum documento enviado</strong>
        <span>Seus próximos uploads aparecerão aqui.</span>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <article className="document-row" key={document.id}>
          <div className="file-mark" aria-hidden="true">DOC</div>
          <div className="document-details">
            <strong title={document.originalName}>{document.originalName}</strong>
            <span>
              {formatFileSize(document.size)} · {dateFormatter.format(new Date(document.uploadedAt))}
            </span>
          </div>
          <span className="owner">{document.owner}</span>
          <DownloadButton documentId={document.id} />
        </article>
      ))}
    </div>
  );
}