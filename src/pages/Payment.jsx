
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

const Payment = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderAndCheckAdmin = async () => {
      if (!user) {
        if (!loadingAuth) {
          setLoadingPage(false);
        }
        return;
      }

      try {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin) {
          // User is an admin, show warning and redirect
          setError(
            "Admin accounts cannot access this page. Redirecting to login..."
          );
          setTimeout(() => navigate("/signin"), 5000);
          setLoadingPage(false);
          return;
        }

        // User is not an admin, fetch their order
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "in", [
            "pending_payment",
            "payment_uploaded",
            "payment_verified",
            "file_uploaded",
            "completed",
          ])
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const orderData = querySnapshot.docs[0].data();
          setOrder({ ...orderData, id: querySnapshot.docs[0].id });
        } else {
          setOrder(null);
        }
      } catch (err) {
        setError("Failed to load page details. Please try again.");
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchOrderAndCheckAdmin();
  }, [user, loadingAuth, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !order) return;
    setUploading(true);
    setError(null);
    const proofFileRef = ref(
      storage,
      `payments/${user.uid}/${order.id}/${proofFile.name}`
    );

    try {
      await uploadBytes(proofFileRef, proofFile);
      const proofFileUrl = await getDownloadURL(proofFileRef);
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "payment_uploaded",
        buktiTransferUrl: proofFileUrl,
        updatedAt: new Date(),
      });
       // Manually update local state to reflect the change immediately
      setOrder(prevOrder => ({...prevOrder, status: 'payment_uploaded' }));

    } catch (err) {
      setError("File upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setProofFile(null);
    }
  };

  if (loadingPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
        <Container maxWidth="sm">
             <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
                <Alert severity="warning">{error}</Alert>
            </Paper>
        </Container>
      )
  }


  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h6">Please log in to manage your order.</Typography>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h6">You have no active orders.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>

        <Typography variant="h6">Package: {order.packageType}</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Order ID: {order.id}
        </Typography>
        <Typography
          variant="h5"
          component="p"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Total: Rp 150.000
        </Typography>

        <Box mt={4}>
          {order.status === "pending_payment" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Proof of Payment
              </Typography>
              <Typography variant="body1" gutterBottom>
                Please transfer the total amount to the following account and
                upload the receipt.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                BCA: 123-456-7890 (Insightify)
              </Typography>

              <TextField
                type="file"
                fullWidth
                onChange={handleFileChange}
                sx={{ my: 2 }}
                helperText="Upload a screenshot or PDF of your transaction."
              />
              <Button
                variant="contained"
                onClick={handleUploadProof}
                disabled={!proofFile || uploading}
              >
                {uploading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Submit Payment Proof"
                )}
              </Button>
            </Box>
          )}

          {order.status === "payment_uploaded" && (
            <Alert severity="info">
              Payment proof submitted. Please wait for admin verification.
            </Alert>
          )}

          {order.status === "payment_verified" && (
            <Alert severity="success">
              Payment verified! You can now proceed to upload your data file for
              analysis.
              <Button
                component="a"
                href="/analysis"
                variant="outlined"
                sx={{ ml: 2 }}
              >
                Go to Analyzer
              </Button>
            </Alert>
          )}

          {order.status === "file_uploaded" && (
            <Alert severity="info">
              Your file is being processed by our team. You will be notified
              when the analysis is complete.
            </Alert>
          )}

          {order.status === "completed" && (
            <Alert severity="success">
              Your analysis is complete! You can view the results now.
              <Button
                variant="outlined"
                component="a"
                href={order.resultFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 2 }}
              >
                Download Result
              </Button>
            </Alert>
          )}

        </Box>
      </Paper>
    </Container>
  );
};

export default Payment;
