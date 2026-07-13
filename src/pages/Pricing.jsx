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
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Check,
    TrendingUp,
    Star,
    WorkspacePremium,
    Business,
    AutoAwesome,
} from '@mui/icons-material';

const pricingTiers = [
    {
        title: 'Free',
        subtitle: 'Self-Service',
        targetUser: 'Mahasiswa, peneliti, UMKM baru coba-coba',
        price: '0',
        priceDetails: 'Selamanya',
        mainService: 'Analisis sentimen teks tunggal & batch (CSV/Excel) tanpa batas baris, ekstraksi kata kunci N-Gram lengkap, statistik kompleksitas teks, unduh hasil.',
        features: [
            'Analisis sentimen teks',
            'Upload CSV/Excel tanpa batas',
            'Ekstraksi kata kunci N-Gram',
            'Statistik kompleksitas teks',
            'Download hasil CSV',
        ],
        buttonText: 'Gunakan Gratis',
        buttonVariant: 'outlined',
        packageName: 'Free',
        packagePrice: 0,
        icon: <AutoAwesome sx={{ fontSize: 36 }} />,
        color: '#9E9E9E',
    },
    {
        title: 'Audit Awal',
        subtitle: 'One-Time',
        targetUser: 'UMKM baru bergabung',
        price: '249.000',
        priceDetails: 'sekali bayar',
        mainService: 'Paket onboarding satu kali: audit menyeluruh kondisi bisnis (keuangan, pasar, sentimen) + rekomendasi paket lanjutan.',
        features: [
            'Audit keuangan bisnis',
            'Analisis pasar & sentimen',
            'Rekomendasi paket yang sesuai',
            'Laporan hasil audit',
            'Sesion konsultasi awal',
        ],
        buttonText: 'Pilih Paket Audit',
        buttonVariant: 'contained',
        packageName: 'Audit Awal',
        packagePrice: 249000,
        isPopular: true,
        icon: <Star sx={{ fontSize: 28 }} />,
        color: '#00FFA3',
    },
    {
        title: 'Growth',
        subtitle: 'Business',
        targetUser: 'UMKM berkembang & butuh arah strategi',
        price: '399.000',
        priceDetails: '/bulan',
        mainService: 'Semua fitur Free + analisis pasar & kompetitor + analisis keuangan + 1x konsultasi online/bulan.',
        features: [
            'Semua fitur Free',
            'Analisis pasar & kompetitor',
            'Analisis keuangan (margin, BEP)',
            '1x konsultasi online/bulan',
            'Prioritas support',
        ],
        buttonText: 'Pilih Growth',
        buttonVariant: 'contained',
        packageName: 'Growth',
        packagePrice: 399000,
        icon: <TrendingUp sx={{ fontSize: 28 }} />,
        color: '#00D1FF',
    },
    {
        title: 'Pro',
        subtitle: 'Professional',
        targetUser: 'UMKM siap naik kelas ke skala menengah',
        price: '699.000',
        priceDetails: '/bulan',
        mainService: 'Semua fitur Growth + strategi pemasaran digital + dashboard custom + 2x konsultasi/bulan.',
        features: [
            'Semua fitur Growth',
            'Strategi pemasaran digital',
            'Dashboard custom interaktif',
            '2x konsultasi/bulan',
            'Prioritas respons utama',
        ],
        buttonText: 'Pilih Pro',
        buttonVariant: 'contained',
        packageName: 'Pro',
        packagePrice: 699000,
        icon: <WorkspacePremium sx={{ fontSize: 28 }} />,
        color: '#FFD700',
    },
    {
        title: 'Enterprise',
        subtitle: 'Custom',
        targetUser: 'UMKM skala menengah/multi-cabang',
        price: 'Custom',
        priceDetails: '',
        mainService: 'Semua fitur Pro + dedicated data analyst + integrasi API + laporan mingguan.',
        features: [
            'Semua fitur Pro',
            'Dedicated data analyst',
            'Integrasi API systems',
            'Laporan mingguan',
            'Custom branding',
        ],
        buttonText: 'Hubungi Kami',
        buttonVariant: 'outlined',
        packageName: 'Enterprise',
        packagePrice: -1,
        icon: <Business sx={{ fontSize: 28 }} />,
        color: '#FF6B6B',
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
                if (existingOrderDoc.data().status === 'pending_payment' ||
                    existingOrderDoc.data().status === 'payment_uploaded') {
                    await updateDoc(existingOrderDoc.ref, {
                        packageType: packageName,
                        packagePrice: packagePrice,
                        updatedAt: serverTimestamp(),
                    });
                }
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
        <Box sx={{ bgcolor: '#0D0C22', minHeight: '100vh', py: { xs: 6, md: 10 } }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            mb: 1,
                            background: 'linear-gradient(90deg, #00FFA3, #00D1FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Paket Harga
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#B0B0B0', maxWidth: 500, mx: 'auto', lineHeight: 1.5 }}
                    >
                        Solusi transparan untuk setiap tahap pertumbuhan bisnis Anda.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                        {error}
                    </Alert>
                )}

                {/* Pricing Cards */}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'center',
                }}>
                    {pricingTiers.map((tier) => (
                        <Paper
                            key={tier.title}
                            sx={{
                                width: 320,
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'visible',
                                borderRadius: 4,
                                border: tier.isPopular ? '2px solid' : '1px solid',
                                borderColor: tier.isPopular ? tier.color : 'rgba(255,255,255,0.1)',
                                background: tier.isPopular
                                    ? `linear-gradient(145deg, ${tier.color}10 0%, rgba(13,12,34,0.95) 100%)`
                                    : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    borderColor: tier.color,
                                    boxShadow: `0 15px 30px -10px ${tier.color}40`,
                                },
                            }}
                        >
                            {/* Popular Badge */}
                                {tier.isPopular && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -14,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            bgcolor: tier.color,
                                            color: '#0D0C22',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        PALING POPULER
                                    </Box>
                                )}

                                {/* Card Header */}
                                <Box sx={{ p: 3, textAlign: 'center', pb: 1 }}>
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            bgcolor: `${tier.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1,
                                            color: tier.color,
                                        }}
                                    >
                                        {tier.icon}
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {tier.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: tier.color }}>
                                        {tier.subtitle}
                                    </Typography>
                                </Box>

                                {/* Price */}
                                <Box sx={{ textAlign: 'center', py: 1, px: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                                        {tier.price !== '0' && tier.price !== 'Custom' && (
                                            <Typography variant="body1" sx={{ color: '#B0B0B0', mr: 0.5 }}>
                                                Rp
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            sx={{ color: tier.price === '0' ? '#B0B0B0' : tier.color }}
                                        >
                                            {tier.price}
                                        </Typography>
                                    </Box>
                                    {tier.priceDetails && (
                                        <Typography variant="caption" sx={{ color: '#888' }}>
                                            {tier.priceDetails}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Description */}
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#B0B0B0', lineHeight: 1.5, textAlign: 'center', fontSize: '0.8rem' }}
                                    >
                                        {tier.mainService}
                                    </Typography>
                                </Box>

                                {/* Features */}
                                <Box sx={{ px: 2, py: 1, flexGrow: 1 }}>
                                    {tier.features.map((feature, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                py: 0.75,
                                            }}
                                        >
                                            <Check sx={{ fontSize: 18, color: tier.color }} />
                                            <Typography variant="body2" sx={{ color: '#CCC' }}>
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Target User */}
                                <Box sx={{ px: 2, py: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#888',
                                            fontStyle: 'italic',
                                            display: 'block',
                                            textAlign: 'center',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Untuk: {tier.targetUser}
                                    </Typography>
                                </Box>

                                {/* Button */}
                                <Box sx={{ p: 2, pt: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={tier.buttonVariant}
                                        size="medium"
                                        onClick={() => handlePackageSelection(tier.packageName, tier.packagePrice)}
                                        disabled={loading || !!processingPackage}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1,
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            ...(tier.buttonVariant === 'contained' && {
                                                bgcolor: tier.isPopular ? tier.color : '#00FFA3',
                                                color: '#0D0C22',
                                                '&:hover': {
                                                    bgcolor: tier.isPopular ? tier.color : '#00E695',
                                                },
                                            }),
                                            ...(tier.buttonVariant === 'outlined' && {
                                                borderColor: tier.color,
                                                color: tier.color,
                                                '&:hover': {
                                                    bgcolor: `${tier.color}15`,
                                                    borderColor: tier.color,
                                                },
                                            }),
                                        }}
                                    >
                                        {processingPackage === tier.packageName ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            tier.buttonText
                                        )}
                                    </Button>
                                </Box>
                            </Paper>
                    ))}
                </Box>

                {/* Footer Note */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                        💡 Semua paket termasuk support via email.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Pricing;
