
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { supabase } from "../supabase"; 
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Container,
  Alert,
} from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";

const Analysis = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [dataFile, setDataFile] = useState(null);
  const [analysisInstructions, setAnalysisInstructions] = useState(""); // State for the comment
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        if (!loadingAuth) {
          setLoadingPage(false);
        }
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "==", "payment_verified")
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const orderData = querySnapshot.docs[0].data();
          setOrder({ ...orderData, id: querySnapshot.docs[0].id });
        } else {
          setOrder(null);
        }
      } catch (err) {
        setError("Failed to load order details. Please try again.");
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchOrder();
  }, [user, loadingAuth]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setDataFile(e.target.files[0]);
    }
  };

  const handleUploadDataFile = async () => {
    if (!dataFile || !order) {
        setError("Please select a file to upload.");
        return;
    }
    setUploading(true);
    setError(null);
    const filePath = `data-files/${user.uid}-${order.id}-${dataFile.name}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("insightify-files")
        .upload(filePath, dataFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("insightify-files")
        .getPublicUrl(filePath);
      
      if (!data.publicUrl) {
         throw new Error("Could not get public URL for the uploaded file.");
      }

      const dataFileUrl = data.publicUrl;

      // Update Firestore with file URL and instructions
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "file_uploaded",
        dataFileUrl: dataFileUrl,
        analysisInstructions: analysisInstructions, // Save the comment
        updatedAt: new Date(),
      });
      
      setOrder(prevOrder => ({...prevOrder, status: 'file_uploaded', dataFileUrl: dataFileUrl }));
      navigate('/payment'); // Redirect to payment page to see status update

    } catch (err) {
      setError(`Upload failed: ${err.message}. Please try again.`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loadingPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h6">Please log in to upload your data file.</Typography>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h6">No active order found or payment not yet verified.</Typography>
           <Button onClick={() => navigate("/payment")} sx={{mt: 2}} variant="contained">Check Payment Status</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit Your Analysis Request
        </Typography>
        <Typography variant="body1" gutterBottom sx={{mb: 4}}>
          Your payment has been verified. Please upload your data file and add any specific instructions for our team.
        </Typography>
        
        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

        <Box>
            <Typography variant="h6" gutterBottom>1. Upload Data File</Typography>
            <TextField
              type="file"
              fullWidth
              onChange={handleFileChange}
              sx={{ mb: 2 }}
              helperText="Please upload your data file (e.g., CSV, Excel)."
            />

            <Typography variant="h6" gutterBottom sx={{mt: 3}}>2. Add Comments or Instructions (Optional)</Typography>
            <TextField
                multiline
                rows={4}
                fullWidth
                value={analysisInstructions}
                onChange={(e) => setAnalysisInstructions(e.target.value)}
                label="Instructions for the Analyst"
                placeholder="e.g., Please focus on sentiment regarding product quality. Ignore comments about delivery speed."
                sx={{ mb: 4 }}
            />

            <Button
              variant="contained"
              onClick={handleUploadDataFile}
              disabled={!dataFile || uploading}
              size="large"
            >
              {uploading ? (
                <CircularProgress size={24} />
              ) : (
                "Submit for Analysis"
              )}
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Analysis;
