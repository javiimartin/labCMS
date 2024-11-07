import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import { CircularProgress, Box } from '@mui/material'; // Importar CircularProgress y Box

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace state={{ message: 'You need to be an admin to access this page.' }} />;
  }

  return children;
};

export default PrivateRoute;