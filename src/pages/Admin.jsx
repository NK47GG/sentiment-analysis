
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { supabase } from "../supabase"; // Import Supabase
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Link,
  TextField,
  CircularProgress,
  Alert, 
} from "@mui/material";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("payment_uploaded");
  const [resultFile, setResultFile] = useState(null);
  const [uploading, setUploading] = useState(null); // Tracks uploading state per order
  const [error, setError] = useState(null); // To show errors to the admin

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ ...doc.data(), id: doc.id });
      });
      setOrders(ordersData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders: ", err);
      setError("Failed to fetch orders.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  const handleAcceptPayment = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, {
        status: "payment_verified",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error accepting payment: ", err);
      setError(`Failed to accept payment for order ${orderId}.`);
    }
  };

  const handleRejectPayment = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, {
        status: "payment_rejected",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error rejecting payment: ", err);
       setError(`Failed to reject payment for order ${orderId}.`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResultFile(e.target.files[0]);
    }
  };

  const handleUploadResult = async (orderId) => {
    if (!resultFile) return;
    setUploading(orderId);
    setError(null);
    const filePath = `result-files/${orderId}-${resultFile.name}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from("insightify-files")
        .upload(filePath, resultFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("insightify-files")
        .getPublicUrl(filePath);

       if (!data.publicUrl) {
         throw new Error("Could not get public URL for the uploaded file.");
      }

      const resultFileUrl = data.publicUrl;

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "completed",
        resultFileUrl: resultFileUrl,
        updatedAt: serverTimestamp(),
      });

    } catch (err) {
      console.error("Error uploading result file: ", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setResultFile(null);
      setUploading(null);
    }
  };
  
  const filteredOrders = orders.filter((order) => filter === 'all' || order.status === filter);

  const renderOrderActions = (order) => {
    switch (order.status) {
      case "payment_uploaded":
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="success" size="small" onClick={() => handleAcceptPayment(order.id)}>
              Accept
            </Button>
            <Button variant="contained" color="error" size="small" onClick={() => handleRejectPayment(order.id)}>
              Reject
            </Button>
            <Button variant="outlined" size="small" component="a" href={order.buktiTransferUrl} target="_blank" rel="noopener noreferrer">
              View Proof
            </Button>
          </Box>
        );
       case "contact_info_submitted":
       case "file_uploaded":
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
             {order.userComments && (
              <Paper variant="outlined" sx={{p: 1.5, mb: 1, width: '100%', bgcolor: '#fffbe6', borderColor: '#ffe58f' }}>
                  <Typography variant="caption" sx={{fontWeight: 'bold', display: 'block', color: '#664d03'}}>User Comments:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#664d03'}}>{order.userComments}</Typography>
              </Paper>
            )}
            <Button variant="outlined" size="small" component="a" href={order.dataFileUrl} target="_blank" rel="noopener noreferrer">
              Download Data File
            </Button>
            <TextField type="file" size="small" onChange={handleFileChange} sx={{mt: 1, width: '100%'}} />
            <Button 
              variant="contained" 
              onClick={() => handleUploadResult(order.id)} 
              disabled={!resultFile || uploading === order.id}
              size="small"
              sx={{width: '100%'}}
            >
              {uploading === order.id ? <CircularProgress size={24} /> : 'Upload Result'}
            </Button>
          </Box>
        );
      default:
        if (order.status === 'completed' && order.resultFileUrl) {
            return <Button variant="outlined" size="small" component="a" href={order.resultFileUrl} target="_blank" rel="noopener noreferrer">View Result</Button>
        }
         if (order.status === 'payment_verified') {
            return <Typography variant="caption" color="text.secondary">Waiting for client file...</Typography>
        }
        return <Typography variant="caption" color="text.secondary">No actions required</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={filter} onChange={handleFilterChange} aria-label="Order status filter">
            <Tab label="Payment Uploaded" value="payment_uploaded" />
            <Tab label="File Uploaded" value="file_uploaded" />
            <Tab label="Completed" value="completed" />
             <Tab label="Payment Verified" value="payment_verified" />
            <Tab label="All" value="all" />
          </Tabs>
        </Box>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Status</TableCell>
                   <TableCell>Contact Email</TableCell>
                  <TableCell>Contact Phone</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell sx={{ width: '40%' }}>Actions & Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption">{order.id}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{order.userId}</Typography></TableCell>
                    <TableCell>{order.packageType}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.contactEmail || '-'}</TableCell>
                    <TableCell>{order.contactPhone || '-'}</TableCell>
                    <TableCell>{order.createdAt?.toDate().toLocaleString()}</TableCell>
                    <TableCell>{renderOrderActions(order)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>No orders found for this filter.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Admin;
