import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect } from 'react';
import Home from "./pages/Home";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import HowToUse from "./pages/HowToUse";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Navbar from "./components/Navbar";

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
    const path = location.pathname;
    let title = 'Insightify';
    if (path === '/') {
      title = 'Insightify | Home';
    } else if (path === '/analysis') {
      title = 'Insightify | Analysis';
    } else if (path === '/how-to-use') {
      title = 'Insightify | How To Use';
    } 
    document.title = title;
  }, [location]);

  return null; // This component does not render anything
};

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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analysis" element={<SentimentAnalysis />} />
              <Route path="/how-to-use" element={<HowToUse />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;
