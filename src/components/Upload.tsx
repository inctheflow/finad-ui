import { useState } from 'react';
import { uploadPdf } from '../api';

export default function Upload() {
  // useState tracks three pieces of state
  const [message, setMessage] = useState<string>('');
  const [error, setError]     = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await uploadPdf(file);
      setMessage(result.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      // finally runs whether try succeeded or failed
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Upload Statement</h1>
      <p className="subtitle">Upload an Apple Card PDF statement to import transactions</p>

      <div className="upload-box">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFile}
          disabled={loading}
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          {loading ? 'Processing...' : 'Choose PDF file'}
        </label>
      </div>

      {/* conditional rendering — only show if message exists */}
      {message && <div className="success">{message}</div>}
      {error   && <div className="error">{error}</div>}
    </div>
  );
}