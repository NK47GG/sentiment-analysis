import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Home from "./pages/Home";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import HowToUse from "./pages/HowToUse";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment"; 
import HistoryPage from "./pages/History";
import Pricing from "./pages/Pricing"; // Import the new Pricing page
import { Box, Typography, CssBaseline, ThemeProvider, createTheme, CircularProgress, Container, Paper, Link } from "@mui/material";
import Navbar from "./components/Navbar";
import { auth } from "./firebase";
import { useAuthState } from 'react-firebase-hooks/auth';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#42a5f5',
    },
    background: {
      default: '#050816',
      paper: 'rgba(10, 14, 32, 0.8)',
    },
    text: {
      primary: '#f0f0f0',
      secondary: '#a0a0b0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    button: {
      textTransform: 'none', 
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Placeholder for Contact Page
const Contact = () => (
    <Container maxWidth="sm">
        <Paper sx={{p: 4, textAlign: 'center'}}>
            <Typography variant="h4" gutterBottom>Hubungi Tim Sales Kami</Typography>
            <Typography variant="body1" color="text.secondary">
                Untuk paket Enterprise atau pertanyaan lebih lanjut, silakan kirim email ke: 
                <Link href="mailto:sales@insightify.com" color="primary">sales@insightify.com</Link>
            </Typography>
        </Paper>
    </Container>
);

const AppRoutes = () => {
    const [user, loading] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            setIsCheckingAdmin(true);
            if (user) {
                try {
                    const idTokenResult = await user.getIdTokenResult(true); // Force refresh
                    setIsAdmin(idTokenResult.claims.admin === true);
                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false); // Not logged in, not an admin
            }
            setIsCheckingAdmin(false);
        };

        checkAdmin();
    }, [user]);

    if (loading || isCheckingAdmin) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isAdmin) {
        return (
            <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<SentimentAnalysis />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} /> 
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes for logged-in (non-admin) users */}
            <Route path="/payment" element={user ? <Payment /> : <Navigate to="/signin" />} />
            <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/signin" />} />

            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <BrowserRouter>
          <Navbar />
          <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <AppRoutes />
          </Box>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;
