import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
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
  AlertTitle,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { UploadFile, CheckCircle, Download } from "@mui/icons-material";


// Master list of packages to ensure price is always found
const packageMasterList = {
    'Audit Awal': { price: 249000 },
    'Growth': { price: 399000 },
    'Pro': { price: 699000 },
    'Enterprise': { price: -1 }, // Custom price
};

// --- Sub-components for each status ---

const PaymentPending = ({ order, onUpdate }) => {
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !order || !user) return;
    setUploading(true);
    setError(null);
    const filePath = `payment-proofs/${user.uid}-${order.id}-${proofFile.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("insightify-files")
        .upload(filePath, proofFile);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("insightify-files")
        .getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error("Could not get public URL.");

      const updatedFields = {
        status: "payment_uploaded",
        buktiTransferUrl: data.publicUrl,
        updatedAt: serverTimestamp(),
      };

      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, updatedFields);

      onUpdate({ ...order, status: "payment_uploaded" });

    } catch (err) {
      setError(`File upload failed: ${err.message}. Please try again.`);
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Menunggu Pembayaran</AlertTitle>
        Silakan transfer total pembayaran dan unggah bukti transfer.
      </Alert>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        BCA: 123-456-7890
      </Typography>
      <Typography variant="body1" gutterBottom>
        Atas Nama: PT Insightify Analitika
      </Typography>

      <TextField
        type="file"
        fullWidth
        onChange={handleFileChange}
        sx={{ my: 2 }}
        helperText="Unggah screenshot atau PDF bukti transfer Anda."
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        variant="contained"
        onClick={handleUploadProof}
        disabled={!proofFile || uploading}
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
      >
        {uploading ? "Mengunggah..." : "Unggah Bukti Transfer"}
      </Button>
    </Box>
  );
};

const DataUploadRequired = ({ order, onUpdate }) => {
  const [dataFile, setDataFile] = useState(null);
  const [comments, setComments] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setDataFile(e.target.files[0]);
    }
  };

  const handleUploadData = async () => {
    if (!dataFile || !order || !user) {
      setError("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    const filePath = `data-files/${user.uid}-${order.id}-${dataFile.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("insightify-files")
        .upload(filePath, dataFile);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("insightify-files")
        .getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error("Could not get public URL for the data file.");

      const updatedFields = {
        status: "file_uploaded",
        dataFileUrl: data.publicUrl,
        userComments: comments,
        updatedAt: serverTimestamp(),
      };

      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, updatedFields);

      onUpdate({ ...order, status: "file_uploaded" });

    } catch (err) {
      setError(`Data file upload failed: ${err.message}. Please try again.`);
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 2 }}>
        <AlertTitle>Pembayaran Terverifikasi!</AlertTitle>
        Silakan unggah file data Anda untuk dianalisis.
      </Alert>
      <TextField
        type="file"
        fullWidth
        onChange={handleFileChange}
        sx={{ my: 2 }}
        helperText="Pilih file yang relevan untuk analisis (misal: .csv, .xlsx, .txt, .docx)."
      />
      <TextField
        label="Komentar atau Instruksi Tambahan (Opsional)"
        multiline
        rows={4}
        fullWidth
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        sx={{ my: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        variant="contained"
        onClick={handleUploadData}
        disabled={!dataFile || uploading}
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
      >
        {uploading ? "Mengunggah Data..." : "Kirim Data untuk Analisis"}
      </Button>
    </Box>
  );
};

const ResultsReady = ({ order }) => {
  const navigate = useNavigate();

  const handleMarkAsDone = async () => {
    if (!order) return;
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: "done" });
      // After successfully marking as done, navigate to the home page.
      navigate('/');
    } catch (err) {
      console.error(`Gagal menyelesaikan pesanan: ${err.message}.`);
      // Optionally, show an error to the user before they navigate away
    }
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 2 }}>
        <AlertTitle>Analisis Selesai!</AlertTitle>
        Hasil analisis Anda sudah siap untuk diunduh.
      </Alert>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          href={order.resultFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Download />}
        >
          Download Hasil
        </Button>
        <Button variant="outlined" onClick={handleMarkAsDone} startIcon={<CheckCircle />}>
          Done
        </Button>
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate("/history")}
        >
          Cek History
        </Button>
      </Stack>
    </Box>
  );
};

const WaitingScreen = ({ title, message }) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <LinearProgress sx={{ my: 2 }} />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

const Payment = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState(null);

  // This callback is now only used by components that don't navigate away
  const handleOrderUpdate = useCallback((newOrderState) => {
    setOrder(newOrderState);
  }, []);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      navigate("/signin");
      return;
    }

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

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          setOrder({ ...orderDoc.data(), id: orderDoc.id });
        } else {
          setOrder(null); // No active order found, triggers re-render
        }
        setLoadingPage(false);
      },
      (err) => {
        console.error("Real-time listener error: ", err);
        setError("Gagal menyinkronkan status pesanan. Coba muat ulang halaman.");
        setLoadingPage(false);
      }
    );

    return () => unsubscribe();
  }, [user, loadingAuth, navigate]);

  const renderPrice = () => {
      if (!order) return 'Harga tidak tersedia';

      let price = order.packagePrice;

      // Fallback for old orders that might not have the packagePrice field
      if (typeof price !== 'number') {
          const matchedPackage = packageMasterList[order.packageType];
          if (matchedPackage) {
              price = matchedPackage.price;
          }
      }

      if (typeof price === 'number' && price >= 0) {
          return `Total: Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
      }

      return 'Harga tidak tersedia';
  }

  const renderContent = () => {
    if (loadingPage) {
        return (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!order) {
      return (
        <Alert severity="info" action={<Button onClick={() => navigate('/pricing')}>Pilih Paket</Button>}>
          Anda tidak memiliki pesanan aktif.
        </Alert>
      );
    }

    // Done status is now handled by the absence of an order from the main query
    switch (order.status) {
      case "pending_payment":
        return <PaymentPending order={order} onUpdate={handleOrderUpdate} />;
      case "payment_uploaded":
        return (
          <WaitingScreen
            title="Menunggu Verifikasi"
            message="Bukti pembayaran Anda sedang diperiksa. Halaman ini akan diperbarui secara otomatis."
          />
        );
      case "payment_verified":
        return <DataUploadRequired order={order} onUpdate={handleOrderUpdate} />;
      case "file_uploaded":
        return (
          <WaitingScreen
            title="Analisis Berlangsung"
            message="File Anda sedang dianalisis. Anda akan diberi tahu jika hasilnya sudah siap."
          />
        );
      case "completed":
        return <ResultsReady order={order} />;
      default:
        return <Alert severity="error">Status pesanan tidak diketahui: {order.status}</Alert>;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        {order && !loadingPage && (
          <Box mb={3}>
            <Typography variant="h4" gutterBottom>
              Detail Pesanan
            </Typography>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 1, sm: 2}} justifyContent="space-between">
              <Typography variant="h6">Paket: {order.packageType}</Typography>
              <Typography variant="body1" color="text.secondary">
                ID Pesanan: {order.id}
              </Typography>
            </Stack>
            <Typography
              variant="h5"
              component="p"
              sx={{ fontWeight: "bold", color: "primary.main", mt: 1 }}
            >
              {renderPrice()}
            </Typography>
          </Box>
        )}
        <Box mt={2}>{renderContent()}</Box>
      </Paper>
    </Container>
  );
};

export default Payment;
