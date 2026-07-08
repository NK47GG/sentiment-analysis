import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Chip,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Check } from '@mui/icons-material';

const pricingTiers = [
    {
        title: 'Free (Self-Service)',
        targetUser: 'Mahasiswa, peneliti, UMKM baru coba-coba',
        price: '0',
        priceDetails: '',
        mainService: 'Analisis sentimen teks tunggal & batch (CSV/Excel) tanpa batas baris, ekstraksi kata kunci N-Gram lengkap, statistik kompleksitas teks, unduh hasil.',
        buttonText: 'Gunakan Gratis',
        buttonVariant: 'outlined',
        packageName: 'Free',
        packagePrice: 0,
    },
    {
        title: 'Audit Awal',
        targetUser: 'UMKM baru bergabung (opsional)',
        price: '249.000',
        priceDetails: 'sekali bayar',
        mainService: 'Paket onboarding satu kali: audit menyeluruh kondisi bisnis (keuangan, pasar, sentimen) + rekomendasi paket lanjutan yang paling sesuai.',
        buttonText: 'Pilih Paket Audit',
        buttonVariant: 'contained',
        packageName: 'Audit Awal',
        packagePrice: 249000,
        isPopular: true,
    },
    {
        title: 'Growth',
        targetUser: 'UMKM yang mulai berkembang dan butuh arah strategi',
        price: '399.000',
        priceDetails: '/bulan',
        mainService: 'Semua fitur Free + analisis pasar & kompetitor ringan + analisis keuangan dasar (margin, estimasi BEP) + 1x konsultasi online (30 menit/bulan).',
        buttonText: 'Pilih Paket Growth',
        buttonVariant: 'contained',
        packageName: 'Growth',
        packagePrice: 399000,
    },
    {
        title: 'Pro',
        targetUser: 'UMKM yang siap naik kelas menuju skala omzet menengah',
        price: '699.000',
        priceDetails: '/bulan',
        mainService: 'Semua fitur Growth + strategi pemasaran digital (evaluasi konten & iklan) + dashboard custom interaktif + 2x konsultasi/bulan + prioritas respons.',
        buttonText: 'Pilih Paket Pro',
        buttonVariant: 'contained',
        packageName: 'Pro',
        packagePrice: 699000,
    },
     {
        title: 'Enterprise',
        targetUser: 'UMKM skala menengah/multi-cabang',
        price: 'Custom',
        priceDetails: '',
        mainService: 'Semua fitur Pro + dedicated data analyst + integrasi API ke sistem internal klien + laporan mingguan.',
        buttonText: 'Hubungi Kami',
        buttonVariant: 'outlined',
        packageName: 'Enterprise',
        packagePrice: -1, // Sentinel for custom price
    },
];

const Pricing = () => {
    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);
    const [processingPackage, setProcessingPackage] = useState(null);
    const [error, setError] = useState('');

    const handlePackageSelection = async (packageName, packagePrice) => {
        if (packageName === 'Free') {
            navigate('/analysis');
            return;
        }

        if (!user) {
            navigate('/signin');
            return;
        }

        if (packageName === 'Enterprise') {
            navigate('/contact');
            return;
        }
        
        setProcessingPackage(packageName);
        setError('');

        try {
            const activeStatuses = ['pending_payment', 'payment_uploaded', 'payment_verified', 'file_uploaded'];
            const q = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid),
                where('status', 'in', activeStatuses)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                 const existingOrderDoc = querySnapshot.docs[0];
                // If user is just changing their mind before paying, update the existing order.
                if (existingOrderDoc.data().status === 'pending_payment') {
                    await updateDoc(existingOrderDoc.ref, {
                        packageType: packageName,
                        packagePrice: packagePrice,
                        updatedAt: serverTimestamp(),
                    });
                } 
                // Otherwise, the order is already in progress, just navigate them to the payment page.
                navigate('/payment');
            } else {
                await addDoc(collection(db, 'orders'), {
                    userId: user.uid,
                    packageType: packageName,
                    packagePrice: packagePrice,
                    status: 'pending_payment',
                    createdAt: serverTimestamp(),
                });
                navigate('/payment');
            }
        } catch (err) {
            console.error('Error handling package selection:', err);
            setError('Terjadi kesalahan saat memproses paket Anda. Silakan coba lagi.');
        } finally {
            setProcessingPackage(null);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
            <Typography variant="h2" component="h1" align="center" fontWeight="bold" gutterBottom>
                Paket Harga
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
                Solusi transparan yang dirancang untuk setiap tahap pertumbuhan bisnis Anda. Tidak ada biaya tersembunyi.
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 4, justifyContent: 'center' }}>{error}</Alert>}
            
            <Grid container spacing={4} alignItems="stretch" justifyContent="center">
                {pricingTiers.map((tier) => (
                    <Grid item key={tier.title} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: tier.isPopular ? '2px solid' : '1px solid', borderColor: tier.isPopular ? 'primary.main' : 'divider', position: 'relative', overflow: 'visible' }}>
                             {tier.isPopular && <Chip label="Populer" color="primary" sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }} />}
                            <CardHeader
                                title={tier.title}
                                subheader={tier.targetUser}
                                titleTypographyProps={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}
                                subheaderTypographyProps={{ color: 'text.secondary', height: 50, textAlign: 'center', px: 1 }}
                                sx={{ bgcolor: 'transparent', pt: 4 }}
                            />
                            <CardContent sx={{ flexGrow: 1, px: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', my: 2 }}>
                                    <Typography component="h2" variant="h3" color="text.primary">
                                        {tier.price !== '0' && tier.price !== 'Custom' && 'Rp'}{tier.price}
                                    </Typography>
                                    {tier.priceDetails && <Typography variant="h6" color="text.secondary" sx={{ml: 0.5}}>{tier.priceDetails}</Typography>}
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ minHeight: 180 }}>
                                    {tier.mainService}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{p: 2}}>
                                <Button
                                    fullWidth
                                    variant={tier.buttonVariant}
                                    size="large"
                                    onClick={() => handlePackageSelection(tier.packageName, tier.packagePrice)}
                                    disabled={loading || !!processingPackage}
                                >
                                    {processingPackage === tier.packageName ? <CircularProgress size={26} color="inherit" /> : tier.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Pricing;
