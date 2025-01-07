import React, { useState } from 'react';
const axios = require('axios');
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_surname: '',
    user_email: '',
    user_password: '',
    user_gender: '',
    user_age: '',
    user_degree: '',
    user_zipcode: ''
  });

  const [errors, setErrors] = useState({
    user_name: '',
    user_surname: '',
    user_email: '',
    user_password: '',
    user_gender: '',
    user_age: '',
    user_degree: '',
    user_zipcode: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validación básica
    if (name === 'user_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors({ ...errors, user_email: emailRegex.test(value) ? '' : 'Invalid email address' });
    } else if (name === 'user_password') {
      setErrors({ ...errors, user_password: value.length >= 8 ? '' : 'Password must be at least 8 characters' });
    } else if (name === 'user_zipcode') {
      const zipcodeRegex = /^\d{4,10}$/;
      setErrors({ ...errors, user_zipcode: zipcodeRegex.test(value) ? '' : 'Invalid zipcode' });
    } else {
      setErrors({ ...errors, [name]: value ? '' : 'This field is required' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).every((error) => error === '')) {
      try {
        setLoading(true);
        await axios.post('https://localhost:5000/auth/register', formData);
        
        setSuccessMessage('Registration successful!');
        setOpen(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/'); // Redirigir al inicio después del registro
        }, 3000);
      } catch (error) {
        console.error('Error registering:', error);
        setLoading(false);
      }
    }
  };

  const isFormValid = formData.user_name && formData.user_surname && formData.user_email && formData.user_password && formData.user_gender && formData.user_age && formData.user_degree && formData.user_zipcode && !Object.values(errors).some(error => error !== '');

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Student Registration
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="First Name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_name}
            helperText={errors.user_name}
          />
          <TextField
            label="Last Name"
            name="user_surname"
            value={formData.user_surname}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_surname}
            helperText={errors.user_surname}
          />
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
          />
          <TextField
            label="Password"
            type="password"
            name="user_password"
            value={formData.user_password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_password}
            helperText={errors.user_password}
          />
          <TextField
            label="Gender"
            name="user_gender"
            value={formData.user_gender}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_gender}
            helperText={errors.user_gender}
          />
          <TextField
            label="Date of Birth"
            name="user_age"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.user_age}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_age}
            helperText={errors.user_age}
          />
          <TextField
            label="Degree"
            name="user_degree"
            value={formData.user_degree}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_degree}
            helperText={errors.user_degree}
          />
          <TextField
            label="Zipcode"
            name="user_zipcode"
            value={formData.user_zipcode}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.user_zipcode}
            helperText={errors.user_zipcode}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormValid || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Register'}
          </Button>
        </form>
        <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
          <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Register;
