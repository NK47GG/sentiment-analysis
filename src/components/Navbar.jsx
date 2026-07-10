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
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { BubbleChart, Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { auth } from "../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, deleteUser, updateProfile } from 'firebase/auth';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // State for dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
          setNewNickname(user.displayName || "");
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  // Action Handlers
  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteUser(auth.currentUser);
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
    setOpenDeleteDialog(false);
  };
  
  const handleConfirmUpdateNickname = async () => {
    if (!newNickname.trim()) return; // Prevent empty nickname
    try {
      await updateProfile(auth.currentUser, { displayName: newNickname });
    } catch (error) {
      console.error("Error updating nickname:", error);
    }
    setOpenEditDialog(false);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const getVisibleLinks = () => {
    const guestLinks = [
      { text: 'Home', path: '/' },
      { text: 'Analyzer', path: '/analysis' },
      { text: 'How to Use', path: '/how-to-use' },
      { text: 'Pricing', path: '/pricing'},
    ];

    if (user) {
      if (isAdmin) {
          return [{ text: 'Admin Dashboard', path: '/admin' }];
      }
      return [
        { text: 'Home', path: '/' },
        { text: 'How to Use', path: '/how-to-use' },
        { text: 'History', path: '/history' },
        { text: 'Pricing', path: '/pricing'},
      ];
    }
    
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

  // This component now contains all the logic for the profile button and its menu.
  const AuthArea = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleEditClick = () => {
      setOpenEditDialog(true);
      handleMenuClose();
    };

    const handleDeleteClick = () => {
      setOpenDeleteDialog(true);
      handleMenuClose();
    };

    const handleLogoutClick = () => {
      handleSignOut();
      handleMenuClose();
    }

    if (!user) {
      return (
        <Box>
          <Button color="inherit" component={Link} to="/signin">Sign In</Button>
          <Button variant="contained" component={Link} to="/analysis" sx={{ml: 1}}>Try for Free</Button>
        </Box>
      );
    }

    return (
      <div>
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls={'primary-search-account-menu'}
          aria-haspopup="true"
          onClick={handleMenuOpen}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id={'primary-search-account-menu'}
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
            <Typography variant="subtitle1" component="div">{user.displayName || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">UID: {user.uid}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleEditClick}>Edit Nickname</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete Account</MenuItem>
        </Menu>
      </div>
    );
  }

  return (
    <>
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
              <AuthArea />
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer(true)}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {visibleNavLinks.map((link) => (
                <Button key={link.text} color="inherit" component={Link} to={link.path}>
                  {link.text}
                </Button>
              ))}
              <AuthArea />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Dialogs remain here */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This is a permanent action and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Nickname</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Nickname"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={user?.displayName}
            onChange={(e) => setNewNickname(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdateNickname}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar;
