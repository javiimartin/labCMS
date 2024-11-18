import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from './components/home';
import Login from './components/login';
import Register from './components/register';
import LabList from './components/labDetail';
import EditLab from './components/labEdit';
import PrivateRoute from './middleware/PrivateRoute';
import { AuthProvider } from './middleware/authContext';
import { Container } from "@mui/material";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PrivateRoute><Register /></PrivateRoute>} />
            <Route path="/labs" element={<PrivateRoute><LabList /></PrivateRoute>} />
            <Route path="/labs/create" element={<PrivateRoute><EditLab /></PrivateRoute>} />
            <Route path="/labs/:labId" element={<PrivateRoute><LabDetail /></PrivateRoute>} />
            <Route path="/labs/:labId/edit" element={<PrivateRoute><EditLab /></PrivateRoute>} /> 
          </Routes>
        </Container>
      </AuthProvider>
    </BrowserRouter>
  );
}