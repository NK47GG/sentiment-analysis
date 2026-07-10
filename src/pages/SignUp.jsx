import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link as MuiLink,
  Alert
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: nickname,
      });
      navigate("/");
    } catch (error) {
      if (error.code === 'auth/weak-password') {
          setError('The password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/email-already-in-use') {
          setError('This email address is already in use.');
      } else {
          setError(error.message);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
        <Box
            sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Typography component="h1" variant="h5">
                Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="nickname"
                    label="Nickname"
                    name="nickname"
                    autoComplete="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <MuiLink component={RouterLink} to="/signin" variant="body2">
                            {"Already have an account? Sign in"}
                        </MuiLink>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    </Container>
  );
};

export default SignUp;
