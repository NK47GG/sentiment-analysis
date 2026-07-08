import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
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
    Paper,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { ArrowForward, CheckCircle, BarChart, Insights, Forum } from '@mui/icons-material';

const featureCards = [
    {
        icon: <BarChart fontSize="large" color="primary" />,
        title: 'Analisis Sentimen Otomatis',
        description: 'Pahami emosi dan opini dalam teks secara akurat dan cepat menggunakan AI terdepan.',
    },
    {
        icon: <Insights fontSize="large" color="primary" />,
        title: 'Insight Pasar & Kompetitor',
        description: 'Dapatkan gambaran lanskap pasar dan posisi kompetitor dari data publik dan review pelanggan.',
    },
    {
        icon: <Forum fontSize="large" color="primary" />,
        title: 'Rekomendasi Strategi Bisnis',
        description: 'Ubah data menjadi langkah konkret. Dapatkan rekomendasi strategi yang dapat ditindaklanjuti.',
    },
];

const pricingPreview = {
    'Growth': {
        name: 'Growth',
        price: 399000,
        description: 'Untuk UMKM yang butuh arah strategi, mencakup analisis pasar ringan & konsultasi.',
        features: ['Semua di paket Free', 'Analisis Pasar Ringan', 'Analisis Keuangan Dasar', '1x Konsultasi Online'],
        packageName: 'Growth',
        packagePrice: 399000,
    },
    'Pro': {
        name: 'Pro',
        price: 699000,
        description: 'Untuk UMKM yang siap naik kelas, dengan strategi pemasaran digital dan dashboard interaktif.',
        features: ['Semua di paket Growth', 'Strategi Pemasaran Digital', 'Dashboard Kustom', 'Prioritas Support & Konsultasi'],
        packageName: 'Pro',
        packagePrice: 699000,
        isPopular: true,
    },
};

const Home = () => {
    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);
    const [processingPackage, setProcessingPackage] = useState(null);
    const [error, setError] = useState('');

    const scrollToPricing = () => {
        const pricingSection = document.getElementById('pricing-preview');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePackageSelection = async (packageName, packagePrice) => {
        if (!user) {
            navigate('/signin');
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
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setProcessingPackage(null);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: -3 }}>
            {/* Hero Section */}
            <Box textAlign="center" py={{ xs: 8, md: 12 }}>
                <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                    Insightify — Ubah Data Jadi Insight, Bisnis Jadi Berkembang
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '750px', mx: 'auto', mb: 3 }}>
                    Platform analisis data berbasis AI untuk membantu UMKM mengambil keputusan berbasis data dan memenangkan persaingan.
                </Typography>
                <Button variant="contained" size="large" endIcon={<ArrowForward />} sx={{ mr: 2 }} onClick={() => navigate('/analysis')}>
                    Coba Gratis
                </Button>
                <Button variant="outlined" size="large" onClick={scrollToPricing}>
                    Lihat Paket
                </Button>
            </Box>

            {/* Features Section */}
            <Box py={{ xs: 8, md: 10 }} textAlign="center">
                <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>Kenapa Insightify?</Typography>
                <Grid container spacing={4} mt={4}>
                    {featureCards.map((card) => (
                        <Grid item xs={12} md={4} key={card.title}>
                            <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper', height: '100%' }}>
                                {card.icon}
                                <Typography variant="h5" fontWeight="600" my={2}>{card.title}</Typography>
                                <Typography color="text.secondary">{card.description}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Pricing Preview Section */}
            <Box id="pricing-preview" py={{ xs: 8, md: 10 }} textAlign="center">
                <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>Harga Fleksibel untuk Setiap Skala Bisnis</Typography>
                 {error && <Alert severity="error" sx={{ mt: 2, justifyContent: 'center' }}>{error}</Alert>}
                <Grid container spacing={4} mt={4} justifyContent="center">
                    {Object.values(pricingPreview).map((pkg) => (
                        <Grid item xs={12} md={5} key={pkg.name}>
                            <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', border: pkg.isPopular ? '2px solid' : '1px solid', borderColor: pkg.isPopular ? 'primary.main' : 'divider' }}>
                                {pkg.isPopular && <Chip label="Populer" color="primary" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }} />}
                                <CardContent sx={{ flexGrow: 1, textAlign: 'left' }}>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom>{pkg.name}</Typography>
                                    <Typography variant="h5" color="primary.main" fontWeight="500" gutterBottom>
                                        Rp {new Intl.NumberFormat('id-ID').format(pkg.price)} / bulan
                                    </Typography>
                                    <Typography color="text.secondary" mb={2}>{pkg.description}</Typography>
                                    <Box component="ul" sx={{ listStyle: 'none', p: 0, textAlign: 'left' }}>
                                        {pkg.features.map(feat => (
                                             <Typography component="li" key={feat} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <CheckCircle color="success" sx={{ mr: 1.5 }} /> {feat}
                                            </Typography>
                                        ))}
                                    </Box>
                                </CardContent>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    sx={{ mt: 2 }} 
                                    onClick={() => handlePackageSelection(pkg.packageName, pkg.packagePrice)}
                                    disabled={loading || !!processingPackage}
                                >
                                     {processingPackage === pkg.packageName ? <CircularProgress size={26} color="inherit" /> : 'Pilih Paket ' + pkg.name}
                                </Button>
                            </Card> 
                        </Grid>
                    ))}
                </Grid>
                 <Button variant="outlined" size="large" sx={{ mt: 4 }} onClick={() => navigate('/pricing')}>
                    Lihat Semua Paket
                </Button>
            </Box>

             {/* Final CTA */}
            <Box textAlign="center" py={{ xs: 8, md: 12 }}>
                <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
                    Siap Mengambil Keputusan yang Lebih Baik?
                </Typography>
                 <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '650px', mx: 'auto', mb: 3 }}>
                    Coba analisis sentimen gratis kami atau pilih paket premium untuk mendapatkan insight bisnis yang lebih dalam.
                </Typography>
                <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navigate('/analysis')}>
                    Mulai Coba Gratis Sekarang
                </Button>
            </Box>

        </Container>
    );
};

export default Home;
