import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const document = await uploadDocument(file, owner.trim() || 'anonymous');
      onUploaded(document);
      setFile(null);
      setOwner('');
      form.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="owner">Responsável</label>
        <input
          id="owner"
          name="owner"
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome do usuário"
          type="text"
          value={owner}
        />
      </div>

      <div className="field-group">
        <label htmlFor="document">Documento</label>
        <input
          id="document"
          name="document"
          onChange={(event) => setFile(event.target.files[0] || null)}
          type="file"
        />
      </div>

      <button className="upload-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>

      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}