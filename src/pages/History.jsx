import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Collapse,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Download,
  Visibility,
  CheckCircle,
} from '@mui/icons-material';

const STATUS_COLORS = {
  pending_payment: 'warning',
  payment_uploaded: 'info',
  payment_verified: 'success',
  contact_info_submitted: 'success',
  file_uploaded: 'info',
  completed: 'success',
  done: 'default',
};

const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  payment_uploaded: 'Menunggu Verifikasi',
  payment_verified: 'Pembayaran Diterima',
  contact_info_submitted: 'Kontak Tersimpan',
  file_uploaded: 'Data Terkirim',
  completed: 'Analisis Selesai',
  done: 'Selesai',
};

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'N/A';
  return `Rp ${price.toLocaleString('id-ID')}`;
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return 'N/A';
};

const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: open ? 'unset' : undefined } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight="medium">{order.packageType || 'N/A'}</Typography>
        </TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={STATUS_LABELS[order.status] || order.status}
            color={STATUS_COLORS[order.status] || 'default'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight="bold" color="primary.main">
            {formatPrice(order.packagePrice)}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3, px: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detail Pesanan
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">ID Pesanan</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{order.id}</Typography>
                </Box>

                {/* File uploads from user */}
                {order.buktiTransferUrl && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bukti Transfer</Typography>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      href={order.buktiTransferUrl}
                      target="_blank"
                    >
                      Download Bukti Transfer
                    </Button>
                  </Box>
                )}

                {order.dataFileUrl && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">File Data yang Dikirim</Typography>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      href={order.dataFileUrl}
                      target="_blank"
                    >
                      Download File Data
                    </Button>
                  </Box>
                )}

                {order.userComments && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Catatan</Typography>
                    <Typography variant="body1">{order.userComments}</Typography>
                  </Box>
                )}

                <Divider />

                {/* Result from admin */}
                {order.resultFileUrl && (
                  <Box sx={{ bgcolor: 'success.dark', p: 2, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CheckCircle color="success" />
                      <Typography fontWeight="bold" color="success.main">
                        Hasil Analisis Siap Diunduh!
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<Download />}
                      href={order.resultFileUrl}
                      target="_blank"
                    >
                      Download Hasil Analisis
                    </Button>
                  </Box>
                )}

                {/* Contact info */}
                {(order.contactEmail || order.contactPhone) && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Info Kontak</Typography>
                    {order.contactEmail && <Typography variant="body1">Email: {order.contactEmail}</Typography>}
                    {order.contactPhone && <Typography variant="body1">Telepon: {order.contactPhone}</Typography>}
                  </Box>
                )}

                {/* Last updated */}
                {order.updatedAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Terakhir diupdate: {formatDate(order.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const History = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Gagal memuat riwayat pesanan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, loadingAuth]);

  if (loading || loadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info" action={<Button onClick={() => navigate('/signin')}>Login</Button>}>
          Silakan login untuk melihat riwayat pesanan.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Riwayat Pesanan
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              <TableCell><strong>Paket</strong></TableCell>
              <TableCell><strong>Tanggal</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Belum ada riwayat pesanan.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/pricing')}
                  >
                    Pilih Paket Sekarang
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default History;
