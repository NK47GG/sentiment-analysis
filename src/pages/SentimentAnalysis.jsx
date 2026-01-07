import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { UploadFile, TextFields, Download } from '@mui/icons-material';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, BarElement);

const EmptyState = ({ message }) => (
  <Box
    sx={{
      textAlign: 'center',
      p: { xs: 2, md: 4 },
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 2,
      border: '2px dashed #444',
      mt: 2,
    }}
  >
    <Box className="floating-icon" sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>
      🤖
    </Box>
    <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
      No Results
    </Typography>
    <Typography color="text.secondary">{message}</Typography>
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
  </Box>
);

function SentimentAnalysis() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mode, setMode] = useState('text');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [numKeywords, setNumKeywords] = useState(5);
  const [sentimentFilter, setSentimentFilter] = useState('positive');
  const [ngramMin, setNgramMin] = useState(1);
  const [ngramMax, setNgramMax] = useState(1);
  const [result, setResult] = useState(null);

  const handleNumKeywordsBlur = () => {
    let val = parseInt(numKeywords);
    if (!val || val < 1) val = 1;
    else if (val > 10) val = 10;
    setNumKeywords(val);
  };

  const handleNgramMinBlur = () => {
    let val = parseInt(ngramMin);
    const maxVal = parseInt(ngramMax);
    if (!val || val < 1) val = 1;
    if (val > 3) val = 3;
    if (val > maxVal) val = maxVal;
    setNgramMin(val);
  };

  const handleNgramMaxBlur = () => {
    let val = parseInt(ngramMax);
    const minVal = parseInt(ngramMin);
    if (!val || val < 1) val = 1;
    if (val > 3) val = 3;
    if (val < minVal) val = minVal;
    setNgramMax(val);
  };

  const handleAnalyzeText = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    const baseUrl = 'https://silvio0-simple-sentiment-analyst.hf.space';
    const endpoint = language === 'en' ? '/predict-sentiment/en' : '/predict-sentiment/id';

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_input: inputText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || `Server Error: ${response.status}`);
      setResult({ 
        type: 'text', 
        prediction: data.prediction, 
        confidence: data.confidence 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    const baseUrl = 'https://silvio0-simple-sentiment-analyst.hf.space';
    const endpoint = language === 'en' ? `/predict-table-sentiment/en` : `/predict-table-sentiment/id`;

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
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data));
      setResult({ type: 'file', data });
    } catch (err) {
      setError(`Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setResult(null);
      setError(null);
      setFile(null);
    }
  };

  const renderTable = (apiData, maxRows = null, maxColumns = null) => {
    let rows = [];
    if (Array.isArray(apiData)) rows = apiData;
    else if (apiData.data && Array.isArray(apiData.data)) rows = apiData.data;
    else if (typeof apiData === 'object' && apiData !== null) rows = Object.entries(apiData).map(([key, val]) => ({ Keyword: key, Count: val }));

    if (rows.length === 0) return <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No data available.</Typography>;

    if (maxRows) {
      rows = rows.slice(0, maxRows);
    }

    let headers = Object.keys(rows[0]);
    if (maxColumns) {
      headers = headers.slice(0, maxColumns);
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((h) => (
                <TableCell key={h} sx={{ textTransform: 'capitalize' }}>{h.replace(/_/g, ' ' )}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {headers.map((h) => (
                  <TableCell key={h}>
                    {typeof row[h] === 'object' ? JSON.stringify(row[h]) : row[h]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  const handleDownload = () => {
    const data = result.data.predict_result;
    if (!data || data.length === 0) {
      alert("No data to download!");
      return;
    }
    const allHeaders = Object.keys(data[0]);
    const headers = allHeaders.slice(0, 2);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '""');
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
    a.setAttribute('download', 'sentiment_analysis_result.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getSentimentStyle = (data) => {
    if (!data) return { color: '#888', emoji: '😐', text: 'UNKNOWN' };
    const str = JSON.stringify(data).toLowerCase();
    if (str.includes('pos')) return { color: 'success.main', bgColor: 'success.light', emoji: '😁', text: 'POSITIVE' };
    if (str.includes('neg')) return { color: 'error.main', bgColor: 'error.light', emoji: '😡', text: 'NEGATIVE' };
    return { color: 'info.main', bgColor: 'info.light', emoji: '😐', text: 'NEUTRAL' };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mt: 4, fontSize: { xs: '2rem', md: '3rem' } }}>
          Sentiment Analysis
        </Typography>

        <Card sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                fullWidth
                orientation={isMobile ? 'vertical' : 'horizontal'}
              >
                <ToggleButton value="text">
                  <TextFields sx={{ mr: 1 }} />
                  Single Text
                </ToggleButton>
                <ToggleButton value="file">
                  <UploadFile sx={{ mr: 1 }} />
                  Upload File
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="id">Indonesian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {mode === 'text' && (
            <Box sx={{ mt: 3 }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                label="Enter text to analyze"
              />
              <Button
                variant="contained"
                onClick={handleAnalyzeText}
                disabled={isLoading || !inputText}
                fullWidth
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Analyze Text'}
              </Button>
            </Box>
          )}

          {mode === 'file' && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  border: '2px dashed #666',
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  textAlign: 'center',
                  background: '#222',
                  cursor: 'pointer',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
                component="label"
                htmlFor="fileInput"
              >
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="fileInput"
                />
                <UploadFile sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
                  {file ? file.name : 'Click to Select CSV/Excel File'}
                </Typography>
                {!file && <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>Header must include "komentar"</Typography>}
              </Box>

              {file && (
                <Box sx={{ animation: 'fadeIn 0.5s', mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <TextField
                        type="number"
                        label="Num Keywords"
                        value={numKeywords}
                        onChange={(e) => setNumKeywords(e.target.value)}
                        onBlur={handleNumKeywordsBlur}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Sentiment</InputLabel>
                        <Select value={sentimentFilter} label="Sentiment" onChange={(e) => setSentimentFilter(e.target.value)}>
                          <MenuItem value="positive">Positive</MenuItem>
                          <MenuItem value="negative">Negative</MenuItem>
                          <MenuItem value="neutral">Neutral</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        type="number"
                        label="Min N-Gram"
                        value={ngramMin}
                        onChange={(e) => setNgramMin(e.target.value)}
                        onBlur={handleNgramMinBlur}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        type="number"
                        label="Max N-Gram"
                        value={ngramMax}
                        onChange={(e) => setNgramMax(e.target.value)}
                        onBlur={handleNgramMaxBlur}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    onClick={handleAnalyzeFile}
                    disabled={isLoading}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Start Analysis'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Card>

        {error && (
          <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 4, animation: 'fadeIn 0.5s', width: '100%' }}>
            {result.type === 'text' && (
              <Card sx={{ 
                // PERBAIKAN: Gunakan result.prediction, bukan result.data
                bgcolor: getSentimentStyle(result.prediction).bgColor, 
                color: getSentimentStyle(result.prediction).color, 
                p: 3, 
                textAlign: 'center' 
              }}>
                <Typography variant="h4">
                  {getSentimentStyle(result.prediction).emoji} {getSentimentStyle(result.prediction).text}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', opacity: 0.9 }}>
                   CONFIDENCE: {(result.confidence * 100).toFixed(1)}%
                </Typography>

              </Card>
            )}

            {result.type === 'file' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                      Raw Data Preview
                    </Typography>
                    {renderTable(result.data.data_preview, 5)}
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                      Prediction Result
                    </Typography>
                    {renderTable(result.data.predict_result, 5, 3)}
                    <Button onClick={handleDownload} variant="contained" startIcon={<Download />} sx={{ mt: 2 }}>
                      Download Full CSV
                    </Button>
                </Grid>

                {result.data.sentiment_count && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom align="center" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                      Sentiment Statistics
                    </Typography>
                    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                      <Pie
                        data={{
                          labels: result.data.sentiment_count.map(item => item.Sentiment),
                          datasets: [{
                            data: result.data.sentiment_count.map(item => item.count),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                          }],
                        }}
                        options={{
                           plugins: {
                            datalabels: {
                              color: '#fff',
                              font: { weight: 'bold', size: 14 },
                              formatter: (value, context) => {
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return value > 0 ? `${((value / total) * 100).toFixed(1)}%` : '';
                              },
                            },
                            legend: { 
                                position: isMobile ? 'bottom' : 'right',
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                )}

                {result.data.top_keywords && result.data.top_keywords.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom align="center" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                      Top Keywords ({sentimentFilter})
                    </Typography>
                    <Bar
                      data={{
                        labels: result.data.top_keywords.map(item => item.Word),
                        datasets: [{
                          label: 'Frequency',
                          data: result.data.top_keywords.map(item => item.Jumlah),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }],
                      }}
                      options={{
                        responsive: true,
                        indexAxis: 'y',
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true }, x: { ticks: { stepSize: 1 } } },
                      }}
                    />
                  </Grid>
                )}
                
                {(!result.data.top_keywords || result.data.top_keywords.length === 0) && (
                  <Grid item xs={12} md={6}>
                      <EmptyState message={`No significant ${sentimentFilter} keywords found.`} />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Text Length (Characters)</Typography>
                    {renderTable(result.data.text_length)}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Text Length (Words)</Typography>
                    {renderTable(result.data.word_length)}
                </Grid>

              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SentimentAnalysis;
