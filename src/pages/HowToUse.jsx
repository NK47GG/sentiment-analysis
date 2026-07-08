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
  ListItemText
} from '@mui/material';
import { CheckCircleOutline, TextFields, UploadFile, Download, Payment, VerifiedUser, HourglassTop, RateReview } from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`how-to-use-tabpanel-${index}`}
      aria-labelledby={`how-to-use-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FreeUseGuide = () => (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper'}}>
        <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>Langkah-langkah Analisis Gratis</Typography>
        <List>
            <ListItem>
                <ListItemIcon><TextFields color="primary" /></ListItemIcon>
                <ListItemText primary="1. Masukkan Teks atau Unggah File" secondary="Pilih mode, lalu paste teks Anda atau unggah file CSV/Excel di halaman 'Analyzer'." />
            </ListItem>
            <ListItem>
                <ListItemIcon><CheckCircleOutline color="primary" /></ListItemIcon>
                <ListItemText primary="2. Lihat Hasil Langsung" secondary="Hasil analisis sentimen, kata kunci N-Gram, dan statistik teks akan ditampilkan secara instan." />
            </ListItem>
            <ListItem>
                <ListItemIcon><Download color="primary" /></ListItemIcon>
                <ListItemText primary="3. Unduh Laporan Anda" secondary="Klik tombol 'Download Results' untuk menyimpan wawasan Anda dalam format CSV." />
            </ListItem>
        </List>
    </Paper>
);

const premiumSteps = [
  { label: 'Pilih & Beli Paket', icon: <Payment />, description: 'Pilih paket (Growth, Pro, dll) dari halaman Harga, lalu lakukan checkout. Anda akan diarahkan ke halaman pembayaran.' },
  { label: 'Unggah Bukti Transfer', icon: <UploadFile />, description: 'Lakukan pembayaran sesuai instruksi dan unggah bukti transfer Anda di halaman pembayaran.' },
  { label: 'Tunggu Verifikasi Admin', icon: <HourglassTop />, description: 'Tim kami akan memverifikasi pembayaran Anda. Halaman status pesanan akan diperbarui secara otomatis setelah selesai.' },
  { label: 'Unggah File & Komentar', icon: <RateReview />, description: 'Setelah terverifikasi, Anda bisa mengunggah file data (CSV, DOCX, dll.) beserta komentar atau instruksi spesifik untuk tim analis kami.' },
  { label: 'Analisis oleh Tim Kami', icon: <VerifiedUser />, description: 'Analis data kami akan memproses file dan instruksi Anda untuk menghasilkan laporan insight yang mendalam.' },
  { label: 'Unduh Hasil Analisis', icon: <Download />, description: 'Anda akan mendapatkan notifikasi saat hasil sudah siap. Unduh laporan analisis lengkap Anda dari halaman pembayaran/riwayat.' },
  { label: 'Selesaikan Pesanan & Cek Riwayat', icon: <CheckCircleOutline />, description: 'Setelah hasil diunduh, Anda bisa menandai pesanan sebagai selesai ("Done") dan melihat kembali detailnya kapan saja di halaman Riwayat.' },
];

const PremiumUseGuide = () => (
    <Box>
         <Stepper orientation="vertical">
            {premiumSteps.map((step, index) => (
                <Step key={step.label} active={true}>
                    <StepLabel 
                        icon={step.icon} 
                        sx={{ '.MuiStepLabel-label': { fontWeight: 'bold', fontSize: '1.1rem' } }}
                    >
                        {step.label}
                    </StepLabel>
                    <StepContent>
                        <Typography>{step.description}</Typography>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
    </Box>
);

function HowToUse() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, md: 6 }, 
          fontWeight: 700 
        }}
      >
        Cara Penggunaan
      </Typography>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" aria-label="How to use tabs">
            <Tab label="Analisis Gratis (Self-Service)" id="how-to-use-tab-0" />
            <Tab label="Layanan Premium (with Analyst)" id="how-to-use-tab-1" />
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
