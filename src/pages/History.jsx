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
  Alert
} from '@mui/material';

const History = () => {
  console.log("LOG: History Component is rendering...");

  const [user, loadingAuth] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      console.log('--- DEBUG START: fetchOrders ---');
      console.log('Auth Loading Status:', loadingAuth);
      console.log('Current User Object:', user);
      console.log('Current User UID:', user?.uid);

      if (loadingAuth) {
        console.log('LOG: Menunggu proses autentikasi selesai...');
        return;
      }

      if (!user) {
        console.log('LOG: Tidak ada user terdeteksi, membatalkan query.');
        setLoading(false);
        return;
      }

      try {
        console.log('LOG: Mencoba fetch ke Firestore untuk UID:', user.uid);

        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        console.log('LOG: Query berhasil! Jumlah dokumen:', querySnapshot.size);

        const userOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(userOrders);
      } catch (err) {
        console.error("LOG ERROR: Terjadi kegagalan saat fetch data:", err);
        console.error("LOG ERROR CODE:", err.code);
        console.error("LOG ERROR MSG:", err.message);
        setError("Failed to retrieve order history: " + err.message);
      } finally {
        setLoading(false);
        console.log('--- DEBUG END: fetchOrders ---');
      }
    };

    fetchOrders();
  }, [user, loadingAuth]);

  if (loading || loadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Riwayat Pesanan</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <br />
          <small>Pastikan field di Firestore bernama 'userId' dan Index sudah dibuat.</small>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Belum ada riwayat pesanan.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell align="right">
                    Rp {order.totalPrice?.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default History;