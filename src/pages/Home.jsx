import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    Chip
} from '@mui/material';
import {
    BarChart, 
    Lightbulb, 
    MonetizationOn, 
    Psychology, 
    CheckCircle, 
    TrendingUp, 
    Group, 
    Verified,
    CancelOutlined,
    ArrowForward,
    AutoAwesome
} from '@mui/icons-material';

// --- Data --- 
const featureCards = [
    { icon: <Psychology/>, title: "Analisis Sentimen Otomatis", description: "Pahami suara pelanggan dari ulasan & feedback secara otomatis dengan NLP." },
    { icon: <BarChart/>, title: "Insight Pasar & Kompetitor", description: "Dapatkan gambaran kondisi pasar dan posisi kompetitor untuk peluang baru." },
    { icon: <MonetizationOn/>, title: "Analisis Keuangan Dasar", description: "Ukur kesehatan bisnis dengan metrik penting seperti margin keuntungan dan BEP." },
    { icon: <Lightbulb/>, title: "Rekomendasi Strategi", description: "Terima saran dan rekomendasi konkret yang bisa langsung ditindaklanjuti." }
];

const upgradeReasons = [
    { icon: <TrendingUp/>, title: "Analisis Lebih Dalam", description: "Laporan kustom khusus untuk metrik spesifik bisnis Anda, bukan data umum." },
    { icon: <Group/>, title: "Konsultasi Tim Ahli", description: "Diskusikan hasil analisis dan dapatkan bimbingan strategi langsung." },
    { icon: <Verified/>, title: "Rekomendasi Actionable", description: "Langkah-langkah konkret berbasis data yang siap untuk Anda eksekusi." }
];

// --- Reusable Components --- 
const Section = ({ children, sx = {} }) => (
    <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1, ...sx }}>
        <Container maxWidth="lg">
            {children}
        </Container>
    </Box>
);

const GlassCard = ({ children, sx = {}, ...props }) => (
    <Paper sx={{
        p: { xs: 3, md: 4 },
        height: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.6)', // Slate dark
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-5px)',
            backgroundColor: 'rgba(31, 41, 55, 0.7)',
            borderColor: 'rgba(59, 130, 246, 0.3)', // Tech blue border on hover
            boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.15)',
        },
        ...sx
    }} {...props}>
        {children}
    </Paper>
);

// --- Main Page Component ---
const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            bgcolor: '#030712', // Very dark background (Enterprise AI look)
            color: '#F9FAFB',
            fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", sans-serif',
            overflowX: 'hidden',
            width: '100%',
            position: 'relative',
        }}>
            {/* Background Glow Effects */}
            <Box sx={{
                position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                width: '80vw', height: '600px',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(3, 7, 18, 0) 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            {/* --- HERO SECTION --- */}
            <Section sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', pt: { xs: 12, md: 0 } }}>
                <Box sx={{ textAlign: 'center', maxWidth: '850px', mx: 'auto' }}>
                    <Chip 
                        icon={<AutoAwesome style={{ color: '#60A5FA', fontSize: 16 }} />} 
                        label="Platform Analisis AI B2B untuk UMKM" 
                        sx={{ 
                            bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#93C5FD', 
                            border: '1px solid rgba(59, 130, 246, 0.2)', mb: 4, px: 1, py: 2.5, borderRadius: '100px', fontWeight: 600 
                        }} 
                    />
                    <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', sm: '3.8rem', md: '5rem' }, lineHeight: 1.1, mb: 3, letterSpacing: '-0.02em' }}>
                        Ubah Data Mentah <br/>
                        <Box component="span" sx={{ 
                            background: 'linear-gradient(to right, #3B82F6, #10B981)', 
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
                        }}>
                            Jadi Keputusan Cerdas
                        </Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#9CA3AF', fontWeight: 400, mb: 6, lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.2rem' }, maxWidth: '700px', mx: 'auto' }}>
                        Tinggalkan asumsi. Insightify membantu UMKM membaca kondisi pasar, memantau kesehatan bisnis, dan mengolah feedback pelanggan menjadi strategi jitu dengan bantuan AI.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button 
                            variant="contained" size="large" onClick={() => navigate('/analysis')}
                            endIcon={<ArrowForward />}
                            sx={{ 
                                bgcolor: '#3B82F6', color: '#fff', fontWeight: 600, px: 4, py: 1.8, borderRadius: '12px', textTransform: 'none', fontSize: '1.05rem',
                                '&:hover': { bgcolor: '#2563EB', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)' }
                            }}
                        >
                            Mulai Analisis Gratis
                        </Button>
                        <Button 
                            variant="outlined" size="large" onClick={() => navigate('/pricing')}
                            sx={{ 
                                borderColor: '#374151', color: '#E5E7EB', fontWeight: 600, px: 4, py: 1.8, borderRadius: '12px', textTransform: 'none', fontSize: '1.05rem',
                                '&:hover': { borderColor: '#6B7280', bgcolor: 'rgba(255,255,255,0.02)' }
                            }}
                        >
                            Lihat Paket Bisnis
                        </Button>
                    </Box>
                </Box>
            </Section>

            {/* --- PROBLEM VS SOLUTION SECTION --- */}
            <Section sx={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Grid container spacing={4} alignItems="stretch">
                    {/* The Old Way (Problem) */}
                    <Grid item xs={12} md={6}>
                        <GlassCard sx={{ bgcolor: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', '&:hover': { transform: 'none' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                                    <CancelOutlined sx={{ color: '#EF4444' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="700" color="#F3F4F6">Mengandalkan Intuisi</Typography>
                            </Box>
                            <Typography color="#9CA3AF" lineHeight={1.8}>
                                Banyak UMKM terjebak dalam tebak-tebakan. Sulitnya membaca ribuan ulasan pelanggan, buta terhadap pergerakan kompetitor, dan tidak paham metrik keuangan membuat bisnis stagnan dan rawan kerugian.
                            </Typography>
                        </GlassCard>
                    </Grid>
                    
                    {/* The New Way (Solution) */}
                    <Grid item xs={12} md={6}>
                        <GlassCard sx={{ bgcolor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 10px 30px rgba(16,185,129,0.05)', '&:hover': { transform: 'none' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <CheckCircle sx={{ color: '#10B981' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="700" color="#F3F4F6">Pendekatan Data-Driven</Typography>
                            </Box>
                            <Typography color="#D1D5DB" lineHeight={1.8}>
                                Bersama <strong style={{color: '#10B981'}}>Insightify</strong>, ubah lautan data menjadi peta jalan yang jelas. AI kami mengekstrak insight pasar, menganalisis sentimen, dan memberikan rekomendasi taktis agar bisnis Anda melesat dengan presisi.
                            </Typography>
                        </GlassCard>
                    </Grid>
                </Grid>
            </Section>

            {/* --- FEATURES SECTION --- */}
<Section>
    <Box textAlign="center" mb={8}>
        <Typography variant="h6" color="#3B82F6" fontWeight="700" gutterBottom>KAPABILITAS SISTEM</Typography>
        <Typography variant="h2" fontWeight="800" sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Kenapa Insightify?
        </Typography>
    </Box>

    <Grid container spacing={3} justifyContent="center">
        {featureCards.map((card, index) => (
            <Grid item xs={12} md={6} key={index}>
                <GlassCard sx={{ display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ 
                            width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '14px', background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', color: '#fff',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                        }}>
                            {card.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.2rem' }}>
                            {card.title}
                        </Typography>
                    </Box>
                    <Typography color="#9CA3AF" lineHeight={1.7} sx={{ flexGrow: 1 }}>
                        {card.description}
                    </Typography>
                </GlassCard>
            </Grid>
        ))}
    </Grid>
</Section>

{/* --- UPGRADE / PRICING SECTION --- */}
<Section sx={{ mt: 5 }}>
    <Box sx={{ 
        bgcolor: '#111827', borderRadius: '32px', p: { xs: 4, md: 8 }, 
        border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden',
        maxWidth: '1100px', mx: 'auto'
    }}>
        {/* Background abstract element for the dark box */}
        <Box sx={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Box textAlign="center" mb={6} position="relative" zIndex={1}>
            <Typography variant="h2" fontWeight="800" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2 }}>
                Akselerasi Pertumbuhan Bisnis Anda
            </Typography>
            <Typography color="#9CA3AF" sx={{ fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}>
                Versi gratis adalah pijakan awal. <strong style={{ color: '#fff' }}>Insightify Premium</strong> adalah tim strategi pribadi Anda yang siap menganalisis 24/7.
            </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center" position="relative" zIndex={1}>
            {upgradeReasons.map((reason, index) => (
                <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ color: '#10B981', mb: 2, display: 'flex', justifyContent: 'center', '& > svg': { fontSize: 40 } }}>
                            {reason.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="700" mb={1} color="#F3F4F6">
                            {reason.title}
                        </Typography>
                        <Typography color="#9CA3AF" variant="body2" lineHeight={1.6}>
                            {reason.description}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6, position: 'relative', zIndex: 1 }}>
            <Button 
                variant="outlined" size="large" onClick={() => navigate('/pricing')} 
                sx={{ 
                    borderColor: '#10B981', color: '#10B981', fontWeight: 600, borderRadius: '12px', px: 6, py: 1.5, textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' } 
                }}
            >
                Bandingkan Fitur Premium
            </Button>
        </Box>
    </Box>
</Section>

            {/* --- FINAL CTA SECTION --- */}
            <Section sx={{ pb: { xs: 12, md: 16 } }}>
                <Box sx={{ 
                    textAlign: 'center', borderRadius: '32px', p: { xs: 5, md: 10 },
                    background: 'linear-gradient(135deg, #2563EB, #10B981)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(37, 99, 235, 0.2)'
                }}>
                    <Typography variant="h2" fontWeight="800" color="#fff" sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, mb: 2 }}>
                        Siap Mendominasi Pasar?
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
                        Jangan biarkan kompetitor mencuri pelanggan Anda. Mulai analisis pertama Anda hari ini, 100% gratis.
                    </Typography>
                    
                    <Button 
                        variant="contained" size="large" onClick={() => navigate('/analysis')} 
                        sx={{ 
                            bgcolor: '#030712', color: '#fff', fontWeight: 700, borderRadius: '12px', px: 5, py: 2, textTransform: 'none', fontSize: '1.1rem',
                            '&:hover': { bgcolor: '#111827', transform: 'translateY(-2px)' },
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        Mulai Gratis Sekarang
                    </Button>
                </Box>
            </Section>
        </Box>
    );
};

export default Home;