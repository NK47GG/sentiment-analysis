import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { supabase } from '../supabase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Container,
  Alert,
  AlertTitle,
  Stack,
  LinearProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  UploadFile,
  CheckCircle,
  Download,
  CreditCard,
  ArrowBack,
} from '@mui/icons-material';

// Package master data - HARUS SAMA dengan Pricing.jsx
const PACKAGES = {
  'Audit Awal': { price: 249000, label: 'Audit Awal' },
  'Growth': { price: 399000, label: 'Growth' },
  'Pro': { price: 699000, label: 'Pro' },
  'Enterprise': { price: -1, label: 'Enterprise' },
};

const formatPrice = (price) => {
  if (typeof price !== 'number' || price < 0) return 'Hubungi kami';
  return `Rp ${price.toLocaleString('id-ID')}`;
};

// Status labels in Bahasa
const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  payment_uploaded: 'Menunggu Verifikasi',
  payment_verified: 'Pembayaran Diterima',
  contact_info_submitted: 'Kontak Tersimpan',
  file_uploaded: 'Data Terkirim',
  completed: 'Analisis Selesai',
  done: 'Selesai',
};

// ============= SUB-COMPONENTS =============

const OrderSummary = ({ order }) => (
  <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Ringkasan Pesanan
      </Typography>
      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography color="text.secondary">Paket</Typography>
          <Typography fontWeight="bold">{order.packageType}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography color="text.secondary">ID Pesanan</Typography>
          <Typography variant="body2">{order.id}</Typography>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total</Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {formatPrice(order.packagePrice)}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const PaymentPending = ({ order, onUpdate }) => {
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProofFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadProof = async () => {
    console.log('DEBUG: handleUploadProof called', { proofFile, order, user });
    if (!proofFile || !order || !user) {
      console.log('DEBUG: early return - missing data');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      console.log('DEBUG: Starting upload...');
      const timestamp = Date.now();
      const safeName = proofFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `payment-proofs/${user.uid}-${order.id}-${timestamp}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('insightify-files')
        .upload(filePath, proofFile);
      if (uploadError) {
        console.error('DEBUG: Supabase upload error:', uploadError);
        throw uploadError;
      }
      console.log('DEBUG: Upload success, getting URL...');

      const { data } = supabase.storage
        .from('insightify-files')
        .getPublicUrl(filePath);
      console.log('DEBUG: Public URL:', data?.publicUrl);
      if (!data?.publicUrl) throw new Error('Could not get public URL');

      console.log('DEBUG: Updating Firestore...');
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'payment_uploaded',
        buktiTransferUrl: data.publicUrl,
        updatedAt: serverTimestamp(),
      });
      console.log('DEBUG: Firestore updated!');

      // Call onUpdate to notify parent
      if (onUpdate) {
        onUpdate({ ...order, status: 'payment_uploaded', buktiTransferUrl: data.publicUrl });
      }
    } catch (err) {
      console.error('DEBUG: Upload failed:', err);
      setError('Upload gagal: ' + err.message);
    } finally {
      console.log('DEBUG: Finally block - setting uploading to false');
      setUploading(false);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Transfer Pembayaran</AlertTitle>
        Silakan transfer ke rekening berikut dan upload bukti transfer:
      </Alert>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6">BCA</Typography>
        <Typography variant="h5" fontWeight="bold">123-456-7890</Typography>
        <Typography color="text.secondary">PT Insightify Analitika</Typography>
      </Paper>

      <TextField
        type="file"
        fullWidth
        onChange={handleFileChange}
        sx={{ mb: 2 }}
        helperText="Upload screenshot atau PDF bukti transfer"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleUploadProof}
        disabled={!proofFile || uploading}
        startIcon={uploading ? <CircularProgress size={20} /> : <UploadFile />}
      >
        {uploading ? 'Mengunggah...' : 'Unggah Bukti Transfer'}
      </Button>
    </Box>
  );
};

const ContactInfoForm = ({ order, onUpdate }) => {
  const [contactEmail, setContactEmail] = useState(order.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(order.contactPhone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!contactEmail || !contactPhone) {
      setError('Email dan nomor telepon wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'contact_info_submitted',
        contactEmail,
        contactPhone,
        updatedAt: serverTimestamp(),
      });
      onUpdate({ ...order, status: 'contact_info_submitted', contactEmail, contactPhone });
    } catch (err) {
      setError('Gagal menyimpan: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Sesi Konsultasi</AlertTitle>
        Isi data kontak untuk penjadwalan konsultasi.
      </Alert>

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
        />
        <TextField
          label="No. Telepon / WhatsApp"
          type="tel"
          fullWidth
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
      >
        {submitting ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
      </Button>
    </Box>
  );
};

const DataUploadForm = ({ order, onUpdate }) => {
  const [dataFile, setDataFile] = useState(null);
  const [comments, setComments] = useState(order.userComments || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setDataFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!dataFile || !order || !user) return;
    setUploading(true);
    setError(null);

    try {
      const filePath = `data-files/${user.uid}-${order.id}-${dataFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('insightify-files')
        .upload(filePath, dataFile);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('insightify-files')
        .getPublicUrl(filePath);

      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'file_uploaded',
        dataFileUrl: data.publicUrl,
        userComments: comments,
        updatedAt: serverTimestamp(),
      });

      onUpdate({ ...order, status: 'file_uploaded', dataFileUrl: data.publicUrl, userComments: comments });
    } catch (err) {
      setError('Upload gagal: ' + err.message);
      setUploading(false);
    }
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>Unggah Data</AlertTitle>
        Upload file data untuk analisis.
      </Alert>

      <TextField
        type="file"
        fullWidth
        onChange={handleFileChange}
        sx={{ mb: 2 }}
        helperText="CSV, Excel, TXT, atau DOCX"
      />

      <TextField
        label="Catatan (opsional)"
        multiline
        rows={3}
        fullWidth
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleUpload}
        disabled={!dataFile || uploading}
        startIcon={uploading ? <CircularProgress size={20} /> : <UploadFile />}
      >
        {uploading ? 'Mengunggah...' : 'Kirim untuk Analisis'}
      </Button>
    </Box>
  );
};

const WaitingScreen = ({ title, message }) => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <LinearProgress sx={{ my: 2 }} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

const ResultsReady = ({ order }) => {
  const navigate = useNavigate();

  const handleDone = async () => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: 'done' });
      navigate('/history');
    } catch (err) {
      console.error('Gagal:', err);
    }
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>Analisis Selesai!</AlertTitle>
        Hasil analisis siap diunduh.
      </Alert>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          href={order.resultFileUrl}
          target="_blank"
          startIcon={<Download />}
        >
          Download Hasil
        </Button>
        <Button
          variant="outlined"
          onClick={handleDone}
          startIcon={<CheckCircle />}
        >
          Tandai Selesai
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/history')}
        >
          Lihat Riwayat
        </Button>
      </Stack>
    </Box>
  );
};

// ============= MAIN COMPONENT =============

const Payment = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState(null);

  const handleUpdate = (newOrder) => {
    setOrder(newOrder);
  };

  // Listen to real-time order updates
  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      navigate('/signin');
      return;
    }

    const activeStatuses = [
      'pending_payment',
      'payment_uploaded',
      'payment_verified',
      'contact_info_submitted',
      'file_uploaded',
      'completed',
    ];

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      where('status', 'in', activeStatuses)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setOrder({ ...doc.data(), id: doc.id });
        } else {
          setOrder(null);
        }
        setLoadingPage(false);
      },
      (err) => {
        console.error('Listener error:', err);
        setError('Gagal sync pesanan');
        setLoadingPage(false);
      }
    );

    return () => unsubscribe();
  }, [user, loadingAuth, navigate]);

  // Render content based on status
  const renderContent = () => {
    if (!order) {
      return (
        <Alert severity="info" action={
          <Button onClick={() => navigate('/pricing')}>Pilih Paket</Button>
        }>
          Tidak ada pesanan aktif.
        </Alert>
      );
    }

    switch (order.status) {
      case 'pending_payment':
        return <PaymentPending order={order} onUpdate={handleUpdate} />;
      case 'payment_uploaded':
        return <WaitingScreen title="Menunggu Verifikasi" message="Bukti pembayaran sedang diperiksa." />;
      case 'payment_verified':
        if (order.packageType === 'Growth' || order.packageType === 'Pro') {
          return <ContactInfoForm order={order} onUpdate={handleUpdate} />;
        }
        return <DataUploadForm order={order} onUpdate={handleUpdate} />;
      case 'contact_info_submitted':
        return <DataUploadForm order={order} onUpdate={handleUpdate} />;
      case 'file_uploaded':
        return <WaitingScreen title="Analisis Berlangsung" message="Data sedang diproses." />;
      case 'completed':
        return <ResultsReady order={order} />;
      case 'done':
        navigate('/history');
        return (
          <Alert severity="success">
            <AlertTitle>Pesanan Selesai</AlertTitle>
            Redirecting to history...
          </Alert>
        );
      default:
        return <Alert severity="error">Status tidak dikenal: {order.status}</Alert>;
    }
  };

  if (loadingPage || loadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/pricing')}
        sx={{ mb: 2 }}
      >
        Kembali ke Harga
      </Button>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <CreditCard color="primary" />
          <Typography variant="h5" fontWeight="bold">Pembayaran</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {order && <OrderSummary order={order} />}

        <Divider sx={{ my: 3 }} />

        {renderContent()}
      </Paper>
    </Container>
  );
};

export default Payment;
