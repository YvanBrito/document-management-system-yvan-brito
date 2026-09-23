import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/documentApi.js';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    listDocuments()
      .then((data) => {
        if (isActive) {
          setDocuments(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [...currentDocuments, document]);
    setError('');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">D</div>
        <div>
          <span className="eyebrow">Arquivo interno</span>
          <h1>Documentos</h1>
        </div>
        <div className="document-count">
          <strong>{documents.length}</strong>
          <span>{documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
        </div>
      </header>

      <section className="content-section" aria-labelledby="upload-title">
        <div className="section-heading">
          <span>01</span>
          <div>
            <h2 id="upload-title">Novo documento</h2>
            <p>Registre um arquivo no armazenamento local.</p>
          </div>
        </div>
        <UploadComponent onUploaded={handleUploaded} />
      </section>

      <section className="content-section library" aria-labelledby="library-title">
        <div className="section-heading">
          <span>02</span>
          <div>
            <h2 id="library-title">Biblioteca</h2>
            <p>Documentos disponíveis para consulta e download.</p>
          </div>
        </div>
        <div>
          {error && <p className="request-error" role="alert">{error}</p>}
          <DocumentList documents={documents} isLoading={isLoading} />
        </div>
      </section>
    </main>
  );
}
