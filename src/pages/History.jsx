import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    CircularProgress, 
    Alert,
    AlertTitle, 
    TableContainer, 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody, 
    Paper, 
    Box, 
    Chip,
    Button,
    Stack
} from '@mui/material';

const packageMasterList = {
    'Audit Awal': { price: 249000 },
    'Growth': { price: 399000 },
    'Pro': { price: 699000 },
    'Enterprise': { price: -1 }, // Custom price
    'Free': { price: 0 },
};

const History = () => {
    const navigate = useNavigate();
    const [user, loadingAuth] = useAuthState(auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({});
    const [showDoneConfirmation, setShowDoneConfirmation] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const q = query(
                    collection(db, 'orders'), 
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const userOrders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                userOrders.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

                setOrders(userOrders);
            } catch (err) {
                console.error("Error fetching orders: ", err);
                setError('Failed to retrieve order history.');
            } finally {
                setLoading(false);
            }
        };

        if (!loadingAuth) {
            fetchOrders();
        }
    }, [user, loadingAuth]);

    const handleMarkAsDone = async (orderId) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: "done" });
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, status: 'done' } : order
                )
            );
            setShowDoneConfirmation(true); // Show confirmation alert
        } catch (err) {
            console.error("Failed to update order: ", err);
            setError("Failed to confirm order. Please try again.");
        } finally {
            setUpdating(prev => ({...prev, [orderId]: false}));
        }
    };

     const renderPrice = (order) => {
        if (!order) return 'N/A';

        let price = order.packagePrice;

        if (typeof price !== 'number') {
            const matchedPackage = packageMasterList[order.packageType];
            if (matchedPackage) {
                price = matchedPackage.price;
            }
        }

        if (typeof price === 'number') {
            if (price < 0) return 'Custom';
            if (price === 0) return 'Gratis';
            return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
        }

        return 'N/A';
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'completed': return 'info';
            case 'done': return 'success';
            case 'pending_payment':
            case 'payment_uploaded': return 'warning';
            case 'payment_verified':
            case 'file_uploaded': return 'primary';
            default: return 'default';
        }
    };

    if (loading || loadingAuth) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container><Alert severity="error" sx={{mb: 2}}>{error}</Alert></Container>;
    }

    if (!user) {
        return <Container><Alert severity="warning">Please log in to see your history.</Alert></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Order History</Typography>
            
            {showDoneConfirmation && (
                <Alert 
                    severity="success" 
                    sx={{ mb: 3 }} 
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/')}>
                            Pesan Lagi
                        </Button>
                    }
                >
                    <AlertTitle>Konfirmasi Selesai</AlertTitle>
                    Pesanan telah ditandai selesai. Anda sekarang dapat melakukan pemesanan baru dari Halaman Utama.
                </Alert>
            )}

            {orders.length === 0 ? (
                <Typography>You have no past orders.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="order history table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Package</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell align="center">Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell component="th" scope="row">{order.id}</TableCell>
                                    <TableCell>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{order.packageType}</TableCell>
                                    <TableCell>
                                        <Chip label={order.status.replace(/_/g, ' ')} color={getStatusChipColor(order.status)} variant="outlined" size="small" sx={{textTransform: 'capitalize'}} />
                                    </TableCell>
                                    <TableCell>{renderPrice(order)}</TableCell>
                                    <TableCell align="center">
                                        {order.status === 'completed' && (
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button size="small" variant="outlined" component="a" href={order.resultFileUrl} target="_blank" rel="noopener noreferrer">Download Hasil</Button>
                                                <Button size="small" variant="contained" onClick={() => handleMarkAsDone(order.id)} disabled={updating[order.id]}>
                                                    {updating[order.id] ? <CircularProgress size={20}/> : 'Done'}
                                                </Button>
                                            </Stack>
                                        )}
                                        {order.status === 'done' && (
                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                                 <Button size="small" variant="outlined" component="a" href={order.resultFileUrl} target="_blank" rel="noopener noreferrer">Download Hasil</Button>
                                                 <Chip label="Selesai" color="success" variant="filled" size="small" />
                                            </Stack>
                                        )}
                                        {!['completed', 'done'].includes(order.status) && (
                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default History;
