import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircleOutline,
  TextFields,
  UploadFile,
  Download,
  Payment,
  VerifiedUser,
  HourglassTop,
  RateReview,
  Analytics,
  TrendingUp,
  AccountBalance,
  Marketing,
  Dashboard,
  Support,
  Api,
  Groups,
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`how-to-use-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

// Fitur-fitur app
const FREE_FEATURES = [
  { icon: <TextFields />, title: 'Analisis Sentimen Teks', desc: 'Paste teks langsung untuk analisis sentimen otomatis (positif, negatif, netral).' },
  { icon: <UploadFile />, title: 'Upload CSV/Excel Batch', desc: 'Unggah file CSV atau Excel dengan banyak data tanpa batas baris.' },
  { icon: <Analytics />, title: 'Ekstraksi Kata Kunci N-Gram', desc: 'Dapatkan kata kunci dan frasa penting dari data menggunakan metode N-Gram.' },
  { icon: <Download />, title: 'Statistik & Unduh Hasil', desc: 'Lihat statistik kompleksitas teks dan unduh laporan lengkap dalam format CSV.' },
];

const PREMIUM_FEATURES = [
  { icon: <TrendingUp />, title: 'Analisis Pasar & Kompetitor', desc: 'Analisis mendalam kondisi pasar dan posisi kompetitor untuk menemukan peluang.' },
  { icon: <AccountBalance />, title: 'Analisis Keuangan Dasar', desc: 'Hitung margin keuntungan dan estimasi BEP (Break-Even Point) bisnis Anda.' },
  { icon: <Marketing />, title: 'Strategi Pemasaran Digital', desc: 'Evaluasi konten dan iklan untuk strategi pemasaran yang lebih efektif.' },
  { icon: <Dashboard />, title: 'Dashboard Custom Interaktif', desc: 'Visualisasi data dengan dashboard yang disesuaikan kebutuhan bisnis Anda.' },
  { icon: <Groups />, title: 'Konsultasi Online', desc: 'Sesi konsultasi langsung dengan tim ahli (Growth: 1x/bulan, Pro: 2x/bulan).' },
  { icon: <Api />, title: 'Integrasi API', desc: 'Koneksi ke sistem internal klien untuk Enterprise.' },
];

const FreeUseGuide = () => (
  <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper' }}>
    <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
      Fitur Gratis untuk Semua
    </Typography>
    <Typography sx={{ color: 'text.secondary', mb: 3 }}>
      Paket Free (Self-Service) - tanpa batas penggunaan
    </Typography>
    <List>
      {FREE_FEATURES.map((f, i) => (
        <ListItem key={i} sx={{ mb: 2 }}>
          <ListItemIcon>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {React.cloneElement(f.icon, { sx: { color: '#fff' } })}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={<Typography fontWeight="bold">{f.title}</Typography>}
            secondary={f.desc}
          />
        </ListItem>
      ))}
    </List>
    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,255,163,0.1)', borderRadius: 2, border: '1px solid rgba(0,255,163,0.3)' }}>
      <Typography variant="body2" sx={{ color: '#00FFA3' }}>
        💡 Cocok untuk mahasiswa, peneliti, dan UMKM yang baru memulai analisis data.
      </Typography>
    </Box>
  </Paper>
);

const premiumSteps = [
  {
    label: 'Pilih Paket',
    icon: <Payment />,
    description: 'Pilih paket yang sesuai kebutuhan (Audit Awal, Growth, Pro, atau Enterprise) dari halaman Harga.'
  },
  {
    label: 'Bayar & Upload Bukti',
    icon: <UploadFile />,
    description: 'Transfer sesuai nominal paket, lalu upload bukti transfer di halaman pembayaran.'
  },
  {
    label: 'Verifikasi Admin',
    icon: <HourglassTop />,
    description: 'Tim kami akan memverifikasi pembayaran. Halaman payment akan update otomatis.'
  },
  {
    label: 'Growth/Pro: Input Kontak',
    icon: <RateReview />,
    description: 'Untuk paket Growth & Pro, isi data kontak untuk penjadwalan sesi konsultasi.'
  },
  {
    label: 'Upload Data & Instruksi',
    icon: <UploadFile />,
    description: 'Unggah file data bisnis Anda (CSV, Excel, dll) beserta komentar atau instruksi khusus.'
  },
  {
    label: 'Tim Analis Memproses',
    icon: <VerifiedUser />,
    description: 'Analis data kami akan menganalisis data dan membuat laporan insight mendalam.'
  },
  {
    label: 'Terima Hasil & Konsultasi',
    icon: <Download />,
    description: 'Download hasil analisis dan gunakan untuk sesi konsultasi jika paket Anda termasuk konsultasi.'
  },
  {
    label: 'Selesai & Lihat Riwayat',
    icon: <CheckCircleOutline />,
    description: 'Tandai pesanan selesai. Semua pesanan dan hasil bisa dilihat di halaman Riwayat.'
  },
];

const PremiumUseGuide = () => (
  <Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Paket Berbayar (Premium)
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
      <Chip label="Audit Awal" color="primary" />
      <Chip label="Growth" color="primary" />
      <Chip label="Pro" color="primary" />
      <Chip label="Enterprise" color="primary" />
    </Box>

    {/* Feature Preview */}
    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
      Fitur premium yang tersedia:
    </Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
      {PREMIUM_FEATURES.map((f, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ color: 'primary.main', mt: 0.5 }}>{f.icon}</Box>
          <Box>
            <Typography variant="body2" fontWeight="bold">{f.title}</Typography>
            <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
          </Box>
        </Box>
      ))}
    </Box>

    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
      Alur kerja:
    </Typography>
    <Stepper orientation="vertical">
      {premiumSteps.map((step, index) => (
        <Step key={step.label} active={true}>
          <StepLabel
            icon={step.icon}
            sx={{ '.MuiStepLabel-label': { fontWeight: 'bold', fontSize: '1rem' } }}
          >
            {step.label}
          </StepLabel>
          <StepContent>
            <Typography variant="body2">{step.description}</Typography>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  </Box>
);

function HowToUse() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography variant="h3" component="h1" sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, fontWeight: 700 }}>
        Cara Penggunaan
      </Typography>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" aria-label="How to use tabs">
            <Tab label="Paket Free (Self-Service)" />
            <Tab label="Paket Premium (with Analyst)" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <FreeUseGuide />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <PremiumUseGuide />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default HowToUse;
