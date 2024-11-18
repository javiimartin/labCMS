import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../middleware/authContext';
/*
import DashboardIcon from '@mui/icons-material/Dashboard';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CreateIcon from '@mui/icons-material/Create';
import ApartmentIcon from '@mui/icons-material/Apartment';
import EditIcon from '@mui/icons-material/Edit';
import ScienceIcon from '@mui/icons-material/Science';
import PersonAddIcon from '@mui/icons-material/PersonAdd';*/

const Home = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const buttons = [
    { path: "/news", label: "Show News", icon: <NewspaperIcon /> },
    { path: "/news/create", label: "Create News", icon: <CreateIcon /> },
    { path: "/department", label: "Department", icon: <ApartmentIcon /> },
    { path: "/department/edit", label: "Edit Department", icon: <EditIcon /> },
    { path: "/labs", label: "Labs", icon: <ScienceIcon /> },
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  ];

  if (admin?.is_superadmin) {
    buttons.push({ path: "/register", label: "Register", icon: <PersonAddIcon /> });
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      {admin ? (
        <Box>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 'bold',
              color: '#ffffff',
              backgroundColor: '#d82626',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            Welcome, {admin.user_name}
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {buttons.map((button, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => navigate(button.path)}
                  sx={{
                    backgroundColor: '#ff3333',
                    color: 'white',
                    '&:hover': { backgroundColor: '#e60000', cursor: 'pointer' },
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    {button.icon}
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      {button.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ backgroundColor: '#ff3333', p: 4, borderRadius: 5, textAlign: 'center', color: 'white' }}>
          <Typography variant="h3" gutterBottom>
            Applied Business Research Department
          </Typography>
          <Typography variant="h5" gutterBottom>
            App for Admins
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;