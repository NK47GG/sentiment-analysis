
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    Paper,
    Icon
} from '@mui/material';
import {
    BarChart, 
    Lightbulb, 
    MonetizationOn, 
    Psychology, 
    CheckCircle, 
    TrendingUp, 
    Group, 
    Verified
} from '@mui/icons-material';

// --- Data --- 
const featureCards = [
    { icon: <Psychology/>, title: "Analisis Sentimen Otomatis", description: "Pahami suara pelanggan dari ulasan & feedback secara otomatis." },
    { icon: <BarChart/>, title: "Insight Pasar & Kompetitor", description: "Dapatkan gambaran kondisi pasar dan posisi kompetitor untuk peluang baru." },
    { icon: <MonetizationOn/>, title: "Analisis Keuangan Dasar", description: "Ukur kesehatan bisnis dengan metrik penting seperti margin keuntungan dan BEP." },
    { icon: <Lightbulb/>, title: "Rekomendasi Strategi", description: "Terima saran dan rekomendasi konkret yang bisa langsung ditindaklanjuti." }
];

const upgradeReasons = [
    { icon: <TrendingUp/>, title: "Analisis Lebih Dalam", description: "Dapatkan laporan yang disesuaikan khusus untuk bisnis Anda, bukan hanya data umum." },
    { icon: <Group/>, title: "Konsultasi Tim Ahli", description: "Diskusikan hasil analisis dan dapatkan bimbingan strategi langsung dari para analis kami." },
    { icon: <Verified/>, title: "Rekomendasi Actionable", description: "Bukan hanya data, kami memberikan langkah-langkah konkret yang bisa Anda terapkan." }
];

// --- Komponen Styling --- 

const Section = ({ children, sx = {} }) => (
    <Box sx={{ py: { xs: 8, md: 12 }, overflow: 'hidden', position: 'relative', ...sx }}>
        <Container maxWidth="lg">
            {children}
        </Container>
    </Box>
);

const AuroraCard = ({ children, ...props }) => (
    <Paper sx={{
        p: {xs: 2, md: 4},
        height: '100%',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '16px',
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(0, 255, 163, 0.3), rgba(128, 0, 128, 0.3))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0.8,
        },
        '&:hover': {
            transform: 'translateY(-8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '&::before': {
                background: 'linear-gradient(135deg, #00FFA3, #DA70D6)',
                animation: 'aurora-spin 4s linear infinite',
            }
        },
        '@keyframes aurora-spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        ...props
    }}>
        {children}
    </Paper>
);


const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            bgcolor: '#0D0C22',
            color: '#FFFFFF',
            backgroundImage: 'radial-gradient(at 20% 20%, hsla(283,74%,25%,0.3) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(163,100%,40%,0.2) 0px, transparent 50%)',
        }}>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', py: 10 }}>
                 <Typography 
                    variant="h1"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.5rem' },
                        textShadow: '0px 0px 15px rgba(255, 255, 255, 0.3)',
                        letterSpacing: '-1.5px',
                        mb: 2,
                    }}
                >
                    Ubah Data Jadi Keputusan
                </Typography>
                <Typography 
                    variant="h1"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
                        letterSpacing: '-1.5px',
                        mb: 4,
                        background: 'linear-gradient(90deg, #00FFA3, #00D1FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 40px rgba(0, 255, 163, 0.7)',
                    }}
                >
                    UMKM Jadi Naik Kelas
                </Typography>
                <Typography variant="h6" color="#B0B0B0" sx={{ my: 3, mx: 'auto', maxWidth: '750px', lineHeight: 1.7 }}>
                    Insightify membantu Anda memahami feedback pelanggan, kondisi pasar, dan kesehatan bisnis secara objektif menggunakan kekuatan AI. Ambil keputusan lebih cerdas, bukan berdasarkan asumsi.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 5 }}>
                    <Button variant="contained" size="large" onClick={() => navigate('/analysis')} sx={{ bgcolor: '#fff', color: '#0D0C22', fontWeight: 'bold', borderRadius: '50px', px: 5, py: 1.5, '&:hover': { bgcolor: '#eee' } }}>Coba Gratis</Button>
                    <Button variant="outlined" size="large" onClick={() => navigate('/pricing')} sx={{ borderColor: '#00FFA3', color: '#00FFA3', fontWeight: 'bold', borderRadius: '50px', px: 5, py: 1.5, '&:hover': { bgcolor: 'rgba(0, 255, 163, 0.1)' } }}>Lihat Paket Bisnis</Button>
                </Box>
            </Container>

            {/* Problem -> Solution Section */}
            <Section>
                <Grid container spacing={6} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={5}>
                        <Typography variant="h3" fontWeight="bold">Masalah: Intuisi vs Data</Typography>
                        <Typography color="#B0B0B0" mt={2} lineHeight={1.8}>UMKM seringkali membuat keputusan bisnis berdasarkan firasat karena kesulitan mengolah ribuan feedback pelanggan, membaca arah pasar, dan memantau kesehatan finansial secara objektif.</Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                         <Paper sx={{ p: 4, background: 'linear-gradient(145deg, rgba(0,255,163,0.1), rgba(0,209,255,0.1))', borderRadius: 4, border: '1px solid rgba(0,255,163,0.3)' }}>
                             <Typography variant="h4" fontWeight="bold">Solusi: <span style={{ color: '#00FFA3' }}>Insightify</span></Typography>
                             <Typography color="#B0B0B0" mt={2} lineHeight={1.8}>Kami mengubah data mentah Anda menjadi insight jernih dan rekomendasi strategis. Buat keputusan berbasis bukti, bukan lagi sekadar asumsi, dengan kekuatan AI.</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Section>

            {/* Kenapa Insightify? Section */}
            <Section>
                <Typography variant="h2" component="h2" fontWeight="bold" textAlign="center" gutterBottom>Kenapa Insightify?</Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr'
                    },
                    gap: 3,
                    mt: 6,
                }}>
                    {featureCards.map((card) => (
                        <AuroraCard key={card.title}>
                            <Icon sx={{ color: '#00FFA3', fontSize: {xs: 32, md: 42}, mb: 2 }}>{card.icon}</Icon>
                            <Typography variant="h6" fontWeight="bold" my={1} sx={{fontSize: {xs: '1rem', md: '1.25rem'}}}>{card.title}</Typography>
                            <Typography color="#B0B0B0" variant="body2">{card.description}</Typography>
                        </AuroraCard>
                    ))}
                </Box>
            </Section>

            
            {/* Upgrade Section */}
            <Section sx={{ bgcolor: '#100F29' }}>
                 <Typography variant="h2" component="h2" fontWeight="bold" textAlign="center">Upgrade untuk Akselerasi Bisnis</Typography>
                <Typography variant="h6" color="#B0B0B0" textAlign="center" sx={{ my: 3, maxWidth: '800px', mx: 'auto' }}>Versi gratis adalah alat. Versi berbayar adalah partner strategis Anda.</Typography>
                
                <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
                    {upgradeReasons.slice(0, 2).map((reason) => (
                        <Grid item xs={12} sm={6} md={5} key={reason.title}>
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                <Icon sx={{ color: '#00FFA3', fontSize: 36, mb: 2 }}>{reason.icon}</Icon>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>{reason.title}</Typography>
                                <Typography color="#B0B0B0">{reason.description}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={4} justifyContent="center" sx={{ mt: { xs: 0, md: 4 } }}>
                     {upgradeReasons.slice(2, 3).map((reason) => (
                        <Grid item xs={12} sm={8} md={5} key={reason.title}>
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                <Icon sx={{ color: '#00FFA3', fontSize: 36, mb: 2 }}>{reason.icon}</Icon>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>{reason.title}</Typography>
                                <Typography color="#B0B0B0">{reason.description}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Button variant="contained" size="large" onClick={() => navigate('/pricing')} sx={{ bgcolor: '#00FFA3', color: '#0D0C22', fontWeight: 'bold', borderRadius: '50px', px: 6, py: 1.5, '&:hover': { bgcolor: '#2CFFB5' } }}>Lihat Semua Paket</Button>
                </Box>
            </Section>

            {/* Final CTA */}
            <Section>
                <Paper sx={{ p: { xs: 4, md: 8 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(90deg, #00FFA3, #00D1FF)', maxWidth: '900px', mx: 'auto' }}>
                    <Typography variant="h2" component="h2" fontWeight="bold" gutterBottom color="#0D0C22">Siap Naik Kelas?</Typography>
                    <Typography variant="h6" sx={{ my: 3, color: '#0D0C22', opacity: 0.8 }}>Mulai analisis gratis pertama Anda atau buka potensi penuh bisnis Anda dengan paket premium kami.</Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                         <Button variant="contained" size="large" onClick={() => navigate('/analysis')} sx={{ bgcolor: '#fff', color: '#0D0C22', fontWeight:'bold', borderRadius:'50px', px:5, py:1.5, '&:hover':{bgcolor:'#eee'} }}>Coba Gratis Sekarang</Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/pricing')} sx={{ borderColor: '#0D0C22', color: '#0D0C22', fontWeight:'bold', borderRadius:'50px', px:5, py:1.5, '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' } }}>Lihat Paket Bisnis</Button>
                    </Box>
                </Paper>
            </Section>
        </Box>
    );
};

export default Home;
