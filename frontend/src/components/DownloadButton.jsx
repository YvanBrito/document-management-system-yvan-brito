import { getDocumentDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ documentId }) {
  return (
    <a className="download-button" href={getDocumentDownloadUrl(documentId)}>
      Baixar
    </a>
  );
}