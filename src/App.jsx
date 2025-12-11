import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, BarElement);

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
    
    // Construct Query Parameters
    const queryParams = new URLSearchParams({
      num: numKeywords,
      sentiment: sentimentFilter,
      ngram_min: ngramMin,
      ngram_max: ngramMax
    }).toString();

    const endpoint = language === 'en' 
      ? `/predict-table-sentiment/en?${queryParams}` 
      : `/predict-table-sentiment/id?${queryParams}`;

    const formData = new FormData();
    formData.append('file', file);

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

  // Helper Reset ketika ganti mode
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setFile(null); // Reset file agar form tertutup kembali
  }

  // --- HELPER RENDERING ---
  const renderTable = (apiData, maxRows = null, maxColumns = null) => {
    let rows = [];
    if (Array.isArray(apiData)) rows = apiData;
    else if (apiData.data && Array.isArray(apiData.data)) rows = apiData.data;
    else if (typeof apiData === 'object') rows = Object.entries(apiData).map(([key, val]) => ({ Keyword: key, Count: val }));

    if (rows.length === 0) return <p>Data kosong.</p>;

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
    // 1. Ambil datanya
    const data = result.data.predict_result;
    
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk didownload!");
      return;
    }

    const allHeaders = Object.keys(data[0]);
    const headers = allHeaders.slice(0, 2); 
    
    const csvRows = [];
    
    // A. Masukkan Header
    csvRows.push(headers.join(','));

    // B. Masukkan Data Baris per Baris
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Escape tanda kutip
        return `"${escaped}"`; // Bungkus pakai kutip biar aman kalau ada koma di dalam teks
      });
      csvRows.push(values.join(','));
    }

    // 4. Gabung jadi String
    const csvString = csvRows.join('\n');

    // 5. Buat File & Trigger Download
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

            {/* 2. PENGATURAN & TOMBOL EKSEKUSI (Hanya muncul jika file sudah dipilih) */}
            {file && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <h4 style={{ margin: '10px 0', borderBottom: '1px solid #444' }}>⚙️ Pengaturan Analisis</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  {/* Kolom Kiri */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Jumlah Keyword</label>
                      <input type="number" value={numKeywords} onChange={e => setNumKeywords(e.target.value)} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} />
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

                  {/* Kolom Kanan (N-Gram Bersebelahan) */}
                  <div>
                    <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>N-Gram Range (Kata per frase)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            placeholder="Min"
                            value={ngramMin} 
                            onChange={e => setNgramMin(e.target.value)} 
                            style={{width: '100%', padding: '8px', textAlign: 'center', boxSizing: 'border-box'}} 
                          />
                          <small style={{fontSize: '0.7rem', color: '#888'}}>Min</small>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center' }}>-</div>
                       <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            placeholder="Max"
                            value={ngramMax} 
                            onChange={e => setNgramMax(e.target.value)} 
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
                {/* --- BAGIAN TABEL --- */}
                <h3>📊 Hasil Ekstraksi Keyword</h3>
                {renderTable(result.data)}

                {/* --- BAGIAN TABEL --- */}
                <h3>📊 Preview of Your Data</h3>
                {renderTable(result.data.data_preview, 5, null)}

                <h3>📊 Prediction Result</h3>
                {renderTable(result.data.predict_result, 5, 2)}

                {/* 👇 TOMBOL DOWNLOAD (BARU) 👇 */}
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button 
                    onClick={handleDownload}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745', // Warna Hijau
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    📥 Download Full CSV
                  </button>
                </div>

                {/* --- BAGIAN PIE CHART (BARU) --- */}
                {result.data.sentiment_count && (
                  <div style={{ marginTop: '40px', maxWidth: '400px', margin: '40px auto' }}>
                    <h3 style={{ textAlign: 'center' }}>📈 Statistik Sentimen</h3>
                    
                    <Pie 
                      data={{
                        // Ambil Label (Positive, Negative, dll)
                        labels: result.data.sentiment_count.map(item => item.Sentiment), 
                        datasets: [
                          {
                            label: 'Jumlah',
                            // Ambil Angka Count
                            data: result.data.sentiment_count.map(item => item.count), 
                            backgroundColor: [
                              '#FF6384', // Merah
                              '#36A2EB', // Biru
                              '#FFCE56', // Kuning
                              '#4BC0C0'  // Hijau (Jaga2 kalo ada data ke-4)
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}

                      options={{
                        plugins: {
                          // Konfigurasi khusus untuk datalabels
                          datalabels: {
                            color: '#fff', // Warna teks (putih biar kontras)
                            font: {
                              weight: 'bold',
                              size: 14
                            },
                            // Rumus untuk menghitung persentase
                            formatter: (value, context) => {
                              // 1. Hitung Total Semua Data
                              const datapoints = context.chart.data.datasets[0].data;
                              const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
                              
                              // 2. Hitung Persentase Data Ini
                              const percentage = (value / total * 100).toFixed(1) + '%'; // Hasil: "66.7%"
                              
                              // 3. Tampilkan (Cuma tampilkan kalau nilainya > 0 biar gak numpuk)
                              return value > 0 ? percentage : '';
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* --- BAGIAN TABEL --- */}
                <h3>📊 Preview of Your Data</h3>
                {renderTable(result.data.top_keywords)}

                {/* --- BAGIAN BAR CHART KEYWORDS --- */}
                {result.data.top_keywords && (
                  <div style={{ marginTop: '40px', maxWidth: '600px', margin: '40px auto' }}>
                    <h3 style={{ textAlign: 'center' }}>🔥 Top Keywords Frequency</h3>
                    
                    <Bar 
                      data={{
                        // Ambil Label dari kolom "Word"
                        labels: result.data.top_keywords.map(item => item.Word),
                        datasets: [
                          {
                            label: 'Jumlah Muncul',
                            // Ambil Data dari kolom "Jumlah"
                            data: result.data.top_keywords.map(item => item.Jumlah),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Warna Biru Transparan
                            borderColor: 'rgba(54, 162, 235, 1)',      // Garis Tepi Biru
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false, // Sembunyikan legend biar bersih (opsional)
                          },
                          title: {
                            display: true,
                            text: 'Kata yang Paling Sering Muncul',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true, // Mulai sumbu Y dari angka 0
                            ticks: {
                              stepSize: 1 // Paksa angka bulat (biar gak muncul 1.5 kata)
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* --- BAGIAN TABEL --- */}
                <h3>📊 Preview of Your Data</h3>
                {renderTable(result.data.text_length)}

                {/* --- BAGIAN TABEL --- */}
                <h3>📊 Preview of Your Data</h3>
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