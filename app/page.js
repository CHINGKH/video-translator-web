'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [targetLang, setTargetLang] = useState('Khmer');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
      setTranscript('');
      setTranslation('');
      setStatus('');
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      alert('សូមជ្រើសរើសឯកសារវីដេអូជាមុនសិន');
      return;
    }

    setLoading(true);
    setStatus('កំពុងបង្ហោះ និងវិភាគវីដេអូ...');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('targetLang', targetLang);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'ការបកប្រែបរាជ័យ');
      }

      setTranscript(data.transcript || '');
      setTranslation(data.translation || '');
      setStatus('បកប្រែរួចរាល់!');
    } catch (err) {
      setStatus('កំហុស៖ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>🎬 កម្មវិធីបកប្រែវីដេអូ</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>ជ្រើសរើសវីដេអូ៖</label>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          style={{ width: '100%', maxHeight: 400, marginBottom: 20, background: '#000' }}
        />
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 8 }}>បកប្រែជា៖</label>
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
          <option value="Khmer">ភាសាខ្មែរ</option>
          <option value="Chinese">ភាសាចិន</option>
          <option value="English">ភាសាអង់គ្លេស</option>
          <option value="Thai">ភាសាថៃ</option>
          <option value="Vietnamese">ភាសាវៀតណាម</option>
        </select>
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading || !file}
        style={{ padding: '10px 24px', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'កំពុងដំណើរការ...' : 'ចាប់ផ្តើមបកប្រែ'}
      </button>

      {status && <p style={{ marginTop: 10, color: '#666' }}>{status}</p>}

      {transcript && (
        <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
          <h3>អត្ថបទដើម (ធ្វើត្រាប់តាមការបំប្លែងសំឡេងជាអក្សរ)៖</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{transcript}</p>
        </div>
      )}

      {translation && (
        <div style={{ marginTop: 20, padding: 15, background: '#e8f4fd', borderRadius: 8 }}>
          <h3>លទ្ធផលបកប្រែ ({targetLang})៖</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{translation}</p>
        </div>
      )}
    </main>
  );
  }
