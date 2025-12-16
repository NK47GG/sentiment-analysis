import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, BarElement);

// --- KOMPONEN ANIMASI KOSONG (EMPTY STATE) ---
const EmptyState = ({ message }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px', 
    background: '#1a1a1a', 
    borderRadius: '12px',
    border: '2px dashed #444',
    marginTop: '20px'
  }}>
    <div className="floating-icon" style={{ fontSize: '4rem', marginBottom: '15px' }}>
      🤖
    </div>
    <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Hasil Kosong</h3>
    <p style={{ color: '#888', margin: 0 }}>{message}</p>
    
    {/* Style Animasi In-Component */}
    <style>{`
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      .floating-icon {
        animation: float 3s ease-in-out infinite;
        display: inline-block;
      }
    `}</style>
  </div>
);

function App() {
  const [mode, setMode] = useState('text')
  const [language, setLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Inputs
  const [inputText, setInputText] = useState('')
  const [file, setFile] = useState(null)
  
  // File Params
  const [numKeywords, setNumKeywords] = useState(5)
  const [sentimentFilter, setSentimentFilter] = useState('positive')
  const [ngramMin, setNgramMin] = useState(1)
  const [ngramMax, setNgramMax] = useState(1)

  // Result
  const [result, setResult] = useState(null)

  // --- LOGIKA VALIDASI INPUT (ON BLUR) ---
  const handleNumKeywordsBlur = () => {
    let val = parseInt(numKeywords);
    if (!val || val < 1) val = 1;
    else if (val > 10) val = 10;
    setNumKeywords(val);
  }

  const handleNgramMinBlur = () => {
    let val = parseInt(ngramMin);
    const maxVal = parseInt(ngramMax);
    if (!val || val < 1) val = 1;
    if (val > 3) val = 3;
    if (val > maxVal) val = maxVal; 
    setNgramMin(val);
  }

  const handleNgramMaxBlur = () => {
    let val = parseInt(ngramMax);
    const minVal = parseInt(ngramMin);
    if (!val || val < 1) val = 1;
    if (val > 3) val = 3;
    if (val < minVal) val = minVal;
    setNgramMax(val);
  }

  // --- 1. HANDLE TEXT ---
  const handleAnalyzeText = async () => {
    setIsLoading(true); setError(null); setResult(null);
    const baseUrl = 'https://silvio0-simple-sentiment-analyst.hf.space'
    const endpoint = language === 'en' ? '/predict-sentiment/en' : '/predict-sentiment/id'

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_input: inputText }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || `Server Error: ${response.status}`)
      setResult({ type: 'text', data: data })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // --- 2. HANDLE FILE ---
  const handleAnalyzeFile = async () => {
    if (!file) return;

    setIsLoading(true); setError(null); setResult(null);
    const baseUrl = 'https://silvio0-simple-sentiment-analyst.hf.space'
    
    // Parameter dikirim via FormData (Body)
    const endpoint = language === 'en' 
      ? `/predict-table-sentiment/en` 
      : `/predict-table-sentiment/id`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('num', numKeywords);
    formData.append('sentiment', sentimentFilter);
    formData.append('ngram_min', ngramMin);
    formData.append('ngram_max', ngramMax);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data));
      setResult({ type: 'file', data: data })
    } catch (err) {
      setError(`Gagal: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper Reset
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setFile(null); 
  }

  // --- HELPER RENDERING ---
  const renderTable = (apiData, maxRows = null, maxColumns = null) => {
    let rows = [];
    if (Array.isArray(apiData)) rows = apiData;
    else if (apiData.data && Array.isArray(apiData.data)) rows = apiData.data;
    else if (typeof apiData === 'object') rows = Object.entries(apiData).map(([key, val]) => ({ Keyword: key, Count: val }));

    if (rows.length === 0) return <p style={{ color: '#666', fontStyle: 'italic' }}>Data kosong.</p>;

    if (maxRows) {
      rows = rows.slice(0, maxRows);
    }

    let headers = Object.keys(rows[0]);
    if (maxColumns) {
        headers = headers.slice(0, maxColumns);
    }

    return (
      <div style={{ overflowX: 'auto', marginTop: '15px', border: '1px solid #444', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#ddd' }}>
          <thead style={{ background: '#333' }}>
            <tr>
              {headers.map((h) => (
                <th key={h} style={{ padding: '12px', borderBottom: '2px solid #555', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#1e1e1e' : '#2a2a2a' }}>
                {headers.map((h) => (
                  <td key={h} style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                    {typeof row[h] === 'object' ? JSON.stringify(row[h]) : row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- DOWNLOAD CSV ---
  const handleDownload = () => {
    const data = result.data.predict_result;
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk didownload!");
      return;
    }
    const allHeaders = Object.keys(data[0]);
    const headers = allHeaders.slice(0, 2); 
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'hasil_analisis_sentimen.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getSentimentStyle = (data) => {
    if (!data) return { color: '#888', emoji: '😐', text: 'UNKNOWN' }
    const str = JSON.stringify(data).toLowerCase()
    if (str.includes('pos')) return { color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.2)', emoji: '😁', text: 'POSITIF' }
    if (str.includes('neg')) return { color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.2)', emoji: '😡', text: 'NEGATIF' }
    return { color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.2)', emoji: '😐', text: 'NETRAL' }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank"><img src={viteLogo} className="logo" alt="Vite logo" /></a>
        <a href="https://react.dev" target="_blank"><img src={reactLogo} className="logo react" alt="React logo" /></a>
      </div>
      
      <h1>Sentiment AI</h1>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        
        {/* TAB SWITCHER */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          <button onClick={() => handleModeChange('text')} style={{ flex: 1, background: mode === 'text' ? '#535bf2' : 'transparent' }}>
            📝 Single Text
          </button>
          <button onClick={() => handleModeChange('file')} style={{ flex: 1, background: mode === 'file' ? '#535bf2' : 'transparent' }}>
            📂 Upload Excel/CSV
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>Bahasa Model:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
            <option value="en">Inggris (English)</option>
            <option value="id">Indonesia</option>
          </select>
        </div>

        {/* --- MODE TEXT --- */}
        {mode === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea 
              rows="3" 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              placeholder="Tulis kalimat di sini..." 
              style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}
            />
            <button onClick={handleAnalyzeText} disabled={isLoading || !inputText}>
              {isLoading ? 'Loading...' : 'Analisis Teks'}
            </button>
          </div>
        )}

        {/* --- MODE FILE --- */}
        {mode === 'file' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* 1. AREA UPLOAD */}
            <div style={{ border: '2px dashed #666', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#222' }}>
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }} 
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '2rem' }}>{file ? '📄' : '📂'}</div>
                <div style={{ fontWeight: 'bold', margin: '10px 0' }}>
                  {file ? file.name : "Klik untuk Pilih File CSV / Excel"}
                </div>
              </label>
              
              {!file && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
                  Wajib memiliki kolom header: <b>komentar</b>
                </div>
              )}
            </div>

            {/* 2. PENGATURAN */}
            {file && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <h4 style={{ margin: '10px 0', borderBottom: '1px solid #444' }}>⚙️ Pengaturan Analisis</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Jumlah Keyword (1-10)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={numKeywords} 
                        onChange={e => setNumKeywords(e.target.value)}
                        onBlur={handleNumKeywordsBlur} 
                        style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} 
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Filter Sentimen</label>
                      <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}>
                        <option value="positive">Positive Only</option>
                        <option value="negative">Negative Only</option>
                        <option value="neutral">Neutral Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>N-Gram Range (1-3)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            min="1"
                            max="3"
                            placeholder="Min"
                            value={ngramMin} 
                            onChange={e => setNgramMin(e.target.value)} 
                            onBlur={handleNgramMinBlur}
                            style={{width: '100%', padding: '8px', textAlign: 'center', boxSizing: 'border-box'}} 
                          />
                          <small style={{fontSize: '0.7rem', color: '#888'}}>Min</small>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>-</div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            min="1"
                            max="3"
                            placeholder="Max"
                            value={ngramMax} 
                            onChange={e => setNgramMax(e.target.value)} 
                            onBlur={handleNgramMaxBlur}
                            style={{width: '100%', padding: '8px', textAlign: 'center', boxSizing: 'border-box'}} 
                          />
                          <small style={{fontSize: '0.7rem', color: '#888'}}>Max</small>
                        </div>
                    </div>
                  </div>
                </div>

                <button onClick={handleAnalyzeFile} disabled={isLoading} style={{ width: '100%', padding: '12px', fontWeight: 'bold', fontSize: '1rem' }}>
                  {isLoading ? 'Sedang Memproses...' : '🚀 Mulai Analisis'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- ERROR DISPLAY --- */}
        {error && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#450a0a', color: '#fca5a5', border: '1px solid red', borderRadius: '8px' }}>
            <strong>Gagal:</strong> {error}
          </div>
        )}

        {/* --- RESULT DISPLAY --- */}
        {result && (
          <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s' }}>
            {result.type === 'text' && (
              <div style={{ 
                background: getSentimentStyle(result.data).bgColor, 
                border: `2px solid ${getSentimentStyle(result.data).color}`,
                padding: '20px', borderRadius: '12px', textAlign: 'center'
              }}>
                <h2 style={{ color: getSentimentStyle(result.data).color, margin: 0 }}>
                  {getSentimentStyle(result.data).emoji} {getSentimentStyle(result.data).text}
                </h2>
              </div>
            )}

            {result.type === 'file' && (
              <div>
                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '5px' }}>📜 Data Mentah (Preview 5 Baris Awal)</h3>
                {renderTable(result.data.data_preview, 5, null)}

                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', marginTop: '30px' }}>✨ Hasil Prediksi Sentimen (Preview)</h3>
                {renderTable(result.data.predict_result, 5, 2)}

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button 
                    onClick={handleDownload}
                    style={{
                      padding: '10px 20px', backgroundColor: '#28a745', color: 'white',
                      border: 'none', borderRadius: '5px', cursor: 'pointer',
                      fontSize: '16px', fontWeight: 'bold'
                    }}
                  >
                    📥 Download Full CSV
                  </button>
                </div>

                {result.data.sentiment_count && (
                  <div style={{ marginTop: '40px', maxWidth: '400px', margin: '40px auto' }}>
                    <h3 style={{ textAlign: 'center' }}>📈 Statistik Sentimen Total</h3>
                    <Pie 
                      data={{
                        labels: result.data.sentiment_count.map(item => item.Sentiment), 
                        datasets: [{
                            label: 'Jumlah',
                            data: result.data.sentiment_count.map(item => item.count), 
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                            borderWidth: 1,
                        }],
                      }}
                      options={{
                        plugins: {
                          datalabels: {
                            color: '#fff', font: { weight: 'bold', size: 14 },
                            formatter: (value, context) => {
                              const datapoints = context.chart.data.datasets[0].data;
                              const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
                              return value > 0 ? (value / total * 100).toFixed(1) + '%' : '';
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* --- 4. TOP KEYWORDS SECTION --- */}
                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', marginTop: '40px', color: '#818cf8' }}>
                   🔥 Top Keywords (Filtered: {sentimentFilter.toUpperCase()})
                </h3>
                
                {/* LOGIKA ANIMASI KOSONG VS DATA ADA */}
                {result.data.top_keywords && result.data.top_keywords.length > 0 ? (
                  <>
                    {/* Tampilkan Tabel Keyword */}
                    {renderTable(result.data.top_keywords)}

                    {/* Tampilkan Grafik Bar Keyword */}
                    <div style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>
                      <Bar 
                        data={{
                          labels: result.data.top_keywords.map(item => item.Word),
                          datasets: [{
                            label: 'Jumlah Muncul',
                            data: result.data.top_keywords.map(item => item.Jumlah),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                          }],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: true, text: `Frekuensi Kata (${sentimentFilter})` },
                          },
                          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  /* TAMPILKAN ANIMASI JIKA KOSONG (IKON TENGKORAK) */
                  <EmptyState message={`Tidak ada keyword ${sentimentFilter} yang signifikan ditemukan.`} />
                )}
                
                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', marginTop: '30px' }}>🔢 Statistik Panjang Teks (Per Karakter)</h3>
                {renderTable(result.data.text_length)}

                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', marginTop: '30px' }}>🔢 Statistik Panjang Teks (Per Kata)</h3>
                {renderTable(result.data.word_length)}

              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default App