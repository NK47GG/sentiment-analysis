
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Home from "./pages/Home";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import HowToUse from "./pages/HowToUse";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment"; // Import the Payment component
import { Box, CssBaseline, ThemeProvider, createTheme, CircularProgress } from "@mui/material";
import Navbar from "./components/Navbar";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
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

// This component will handle the title update
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let title = 'Insightify';
    if (path === '/') {
      title = 'Insightify | Home';
    } else if (path.startsWith('/analysis')) {
      title = 'Insightify | Analysis';
    } else if (path.startsWith('/how-to-use')) {
      title = 'Insightify | How To Use';
    } else if (path.startsWith('/payment')) {
      title = 'Insightify | Payment';
    } else if (path.startsWith('/admin')) {
      title = 'Insightify | Admin';
    } else if (path.startsWith('/signin') || path.startsWith('/signup')) {
      title = 'Insightify | Account';
    }
    document.title = title;
  }, [location]);

  return null; // This component does not render anything
};

const AppRoutes = () => {
    const [user, loading, error] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    const idTokenResult = await user.getIdTokenResult();
                    setIsAdmin(idTokenResult.claims.admin === true);
                } catch (e) {
                    console.error("Error checking admin status", e);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoadingAdminCheck(false);
        };

        checkAdminStatus();
    }, [user]);

    if (loading || loadingAdminCheck) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<SentimentAnalysis />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes */}
            {user && <Route path="/payment" element={<Payment />} />}
            {user && isAdmin && <Route path="/admin" element={<Admin />} />}

            {/* Fallback for protected routes if user is not logged in */}
            {!user && <Route path="/payment" element={<SignIn />} />}
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
          <TitleUpdater />
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
