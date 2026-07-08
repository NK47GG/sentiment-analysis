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
import { useAuthState } from 'react-firebase-hooks/auth'; // Using the hook is simpler
import { signOut } from 'firebase/auth';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user] = useAuthState(auth); // authState hook provides user object
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin claim when user object changes
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

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

  // This function determines which navigation links to show based on user role.
  const getVisibleLinks = () => {
    // Base links visible to everyone (guests)
    const guestLinks = [
      { text: 'Home', path: '/' },
      { text: 'Analyzer', path: '/analysis' },
      { text: 'How to Use', path: '/how-to-use' },
      { text: 'Pricing', path: '/pricing'},
    ];

    if (user) {
      if (isAdmin) {
          // Admin users see only a link to their dashboard
          return [{ text: 'Admin Dashboard', path: '/admin' }];
      }
      // Regular logged-in users
      return [
        { text: 'Home', path: '/' },
        // The 'Analyzer' link is intentionally omitted for logged-in users
        { text: 'How to Use', path: '/how-to-use' },
        { text: 'History', path: '/history' },
        { text: 'Pricing', path: '/pricing'},
      ];
    }
    
    // If not logged in, show guest links
    return guestLinks;
  };

  const visibleNavLinks = getVisibleLinks();

  const drawer = (
    <Box
      sx={{ width: 250, bgcolor: 'background.default' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {visibleNavLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton component={Link} to={link.path}>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
         {user ? (
              <ListItem disablePadding>
                  <ListItemButton onClick={handleSignOut}>
                      <ListItemText primary="Sign Out" />
                  </ListItemButton>
              </ListItem>
          ) : (
              <ListItem disablePadding>
                  <ListItemButton component={Link} to="/signin">
                      <ListItemText primary="Sign In" />
                  </ListItemButton>
              </ListItem>
          )}
      </List>
    </Box>
  );

  const AuthButtons = () => (
      user ? (
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
      ) : (
          <Box>
            <Button color="inherit" component={Link} to="/signin">Sign In</Button>
            <Button variant="contained" component={Link} to="/analysis" sx={{ml: 1}}>Try for Free</Button>
          </Box>
      )
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
            <AuthButtons />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
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
            {visibleNavLinks.map((link) => (
              <Button key={link.text} color="inherit" component={Link} to={link.path}>
                {link.text}
              </Button>
            ))}
             <AuthButtons />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
