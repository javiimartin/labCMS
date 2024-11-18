import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../util/authContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    user_email: '',
    user_password: ''
  });

  const [errors, setErrors] = useState({
    user_email: '',
    user_password: ''
  });

  const [errorMessage, setErrorMessage] = useState(location.state?.message || '');
  const [openError, setOpenError] = useState(!!location.state?.message);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validación básica
    if (name === 'user_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors({ ...errors, user_email: emailRegex.test(value) ? '' : 'Invalid email address' });
    } else if (name === 'user_password') {
      setErrors({ ...errors, user_password: value ? '' : 'Password cannot be empty' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!errors.user_email && !errors.user_password) {
      try {
        console.log('Sending request to https://localhost:5000/auth/login'); // Agrega un log para depuración
        const response = await fetch('https://localhost:5000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        console.log('Response status:', response.status); // Log para el status de respuesta
        const data = await response.json();
        console.log('Response data:', data); // Log para los datos de respuesta

        if (response.ok) {
          login(data.token);  // Almacena el token

          // Verificar si es administrador o estudiante
          if (data.isAdmin) {
            navigate('/admin-dashboard'); // Redirigir al dashboard del admin
          } else {
            navigate('/student-dashboard'); // Redirigir al dashboard del estudiante
          }
        } else {
          if (response.status === 404) {
            setErrorMessage('Email not found');
          } else if (response.status === 401) {
            setErrorMessage('Incorrect password');
          } else {
            setErrorMessage('Login failed. Please try again.');
          }
          setOpenError(true);
        }
      } catch (error) {
        console.error('Error logging in:', error); // Log para el error
        setErrorMessage('Error logging in. Please try again later.');
        setOpenError(true);
      }
    }
  };

  const isFormValid = formData.user_email && formData.user_password && !errors.user_email && !errors.user_password;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_email}
            helperText={errors.user_email}
            sx={{
              '& .MuiInputLabel-root': { color: '#ff3333' },
              '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3333' },
              '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#e60000' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3333' }
            }}
          />
          <TextField
            label="Password"
            name="user_password"
            type="password"
            value={formData.user_password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_password}
            helperText={errors.user_password}
            sx={{
              '& .MuiInputLabel-root': { color: '#ff3333' },
              '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3333' },
              '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#e60000' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3333' }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormValid}
            sx={{ mt: 2, backgroundColor: isFormValid ? '#ff3333' : '#cccccc', '&:hover': { backgroundColor: isFormValid ? '#e60000' : '#cccccc' } }}
          >
            Login
          </Button>
        </form>
        <Snackbar open={openError} autoHideDuration={6000} onClose={() => setOpenError(false)}>
          <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Login;
