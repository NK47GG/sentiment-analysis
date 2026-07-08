
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
} from "@mui/material";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("payment_uploaded");
  const [resultFile, setResultFile] = useState(null);
  const [uploading, setUploading] = useState(null); // Tracks uploading state per order

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
    }, (error) => {
      console.error("Error fetching orders: ", error);
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
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error accepting payment: ", error);
    }
  };

  const handleRejectPayment = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, {
        status: "payment_rejected",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error rejecting payment: ", error);
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
    const resultFileRef = ref(storage, `results/${orderId}/${resultFile.name}`);
    
    try {
      await uploadBytes(resultFileRef, resultFile);
      const resultFileUrl = await getDownloadURL(resultFileRef);

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "completed",
        resultFileUrl,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error uploading result file: ", error);
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
            <Button variant="contained" color="success" onClick={() => handleAcceptPayment(order.id)}>
              Accept
            </Button>
            <Button variant="contained" color="error" onClick={() => handleRejectPayment(order.id)}>
              Reject
            </Button>
            <Button variant="outlined" component={Link} href={order.buktiTransferUrl} target="_blank" rel="noopener noreferrer">
              View Proof
            </Button>
          </Box>
        );
      case "file_uploaded":
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
            <Button variant="outlined" component={Link} href={order.dataFileUrl} target="_blank" rel="noopener noreferrer">
              View Data File
            </Button>
            {order.clientComment && <Typography variant="body2">Client Comment: {order.clientComment}</Typography>}
            <TextField type="file" size="small" onChange={handleFileChange} />
            <Button 
              variant="contained" 
              onClick={() => handleUploadResult(order.id)} 
              disabled={!resultFile || uploading === order.id}
            >
              {uploading === order.id ? <CircularProgress size={24} /> : 'Upload Result'}
            </Button>
          </Box>
        );
      default:
        return <Typography variant="caption" color="text.secondary">No actions required</Typography>;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={filter} onChange={handleFilterChange} aria-label="Order status filter">
            <Tab label="Payment Uploaded" value="payment_uploaded" />
            <Tab label="Payment Verified" value="payment_verified" />
            <Tab label="File Uploaded" value="file_uploaded" />
            <Tab label="Completed" value="completed" />
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
                  <TableCell>Created At</TableCell>
                  <TableCell sx={{ width: '40%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="caption">{order.id}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{order.userId}</Typography></TableCell>
                    <TableCell>{order.packageType}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.createdAt?.toDate().toLocaleString()}</TableCell>
                    <TableCell>{renderOrderActions(order)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
