
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { BubbleChart, Menu as MenuIcon } from '@mui/icons-material';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        user.isAdmin = idTokenResult.claims.admin;
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'Home', path: '/' },
    { text: 'Analyzer', path: '/analysis' },
    { text: 'How to Use', path: '/how-to-use' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250, bgcolor: 'background.default' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton component={Link} to={link.path}>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && user.isAdmin && (
            <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin">
                    <ListItemText primary="Admin" />
                </ListItemButton>
            </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{
        bgcolor: 'background.paper',
        backdropFilter: 'blur(12px)',
        backgroundColor: (theme) => `${theme.palette.background.paper}cc`, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
      elevation={0}
    >
      <Toolbar>
        <BubbleChart sx={{ mr: 1 }} />
        <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
          Insightify
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <>
            {navLinks.map((link) => (
              <Button key={link.text} color="inherit" component={Link} to={link.path}>
                {link.text}
              </Button>
            ))}
            {user && user.isAdmin && (
                <Button color="inherit" component={Link} to="/admin">
                    Admin
                </Button>
            )}
          </>
        )}
        {user ? (
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <Button color="inherit" component={Link} to="/signin">Sign In</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
