import React, { useEffect, useState } from "react";
import { Container, Typography, Card, Box, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

const LabDetail = () => {
  const { labId } = useParams();
  const [lab, setLab] = useState({});
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(null);  

  useEffect(() => {
    const fetchLabData = async () => {
      try {
        const response = await fetch(`https://localhost:5000/labs/${labId}`);
        if (!response.ok) throw new Error("Failed to fetch lab data");
        const data = await response.json();
        setLab(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLabData();
  }, [labId]);

  const formatObjectives = (objectives) => {
    return objectives.split(' - ').map(obj => `\t- ${obj.trim()}`).join('\n');
  };

  const formatProjects = (projects) => {
    return projects.split(' - ').map(proj => `\t- ${proj.trim()}`).join('\n');
  };

  // Renderizar el código QR con manejo de errores
  const renderQRCode = () => {
    if (!lab.lab_code) {
      return null;  // No intentes cargar la imagen si lab_code es undefined
    }

    const qrUrl = `https://localhost:5000/static/lab_qr/${lab.lab_code}.png`;
    console.log("QR Code URL:", qrUrl);

    return (
      <img 
        src={qrUrl} 
        alt={`QR Code for ${lab.lab_name}`} 
        style={{ maxWidth: '150px', marginBottom: '10px' }} 
        crossOrigin="anonymous"
        onError={(e) => {
          setImageError("Failed to load QR Code.");
          console.error("Error loading QR code:", e);
        }}
      />
    );    
  };

  const renderImages = () => {
    if (lab.lab_images) {
      const images = lab.lab_images.split(' - ').filter(img => img.trim() !== "");
      const numCols = Math.ceil(Math.sqrt(images.length));
  
      if (images.length === 0) {
        console.log("No images to display.");
        return null;
      }
  
      return (
        <Grid container spacing={2} justifyContent="center">
          {images.map((img, index) => (
            <Grid item xs={12 / numCols} key={index}>
              <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={img} 
                  alt={`Lab ${lab.lab_name} - ${index + 1}`}  
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} 
                  onError={(e) => e.target.style.display = 'none'}
                  crossOrigin="anonymous"  // Añadir este atributo
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      );
    }
    return null;
  };  

  // Render video if available
  const renderVideo = () => {
    if (lab.lab_video) {
      return (
        <video controls style={{ width: '100%' }} crossOrigin="anonymous">  {/* Añadir este atributo */}
          <source src={lab.lab_video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };  

  // Render audio/podcast if available
  const renderAudio = () => {
    if (lab.lab_podcast) {
      return (
        <audio controls style={{ width: '100%' }} crossOrigin="anonymous">  {/* Añadir este atributo */}
          <source src={lab.lab_podcast} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      );
    }
    return null;
  };
  
  const downloadQR = async () => {
    try {
      const response = await fetch(`https://localhost:5000/static/lab_qr/${lab.lab_code}.png`);
      if (!response.ok) throw new Error('Failed to fetch QR code');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${lab.lab_name}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://localhost:5000/labs/${labId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/labs'); // Redirigir después de la eliminación
      } else {
        throw new Error('Failed to delete lab');
      }
    } catch (error) {
      console.error('Error deleting lab:', error);
    }
  };

  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  return (
    <Container sx={{ paddingX: 2, marginTop: 5 }}>
      <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2, position: 'relative', paddingBottom: '100px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h3" color="white">
            {lab.lab_name}
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate(`/labs/${labId}/edit`)}
              sx={{
                backgroundColor: '#ff3333',
                '&:hover': { backgroundColor: '#e60000' }
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#ff3333',
                '&:hover': { backgroundColor: '#e60000' },
                marginLeft: 2
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="white" sx={{ marginTop: 1, textAlign: 'justify', marginBottom: 2 }}>
          {lab.lab_description}
        </Typography>
        <Typography variant="h6" color="white" sx={{ marginTop: 2 }}>
          Objectives
        </Typography>
        <Typography variant="body1" color="white" component="pre" sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', marginBottom: 2 }}>
          {lab.lab_objectives && formatObjectives(lab.lab_objectives)}
        </Typography>
        <Typography variant="h6" color="white" sx={{ marginTop: 2 }}>
          Projects
        </Typography>
        <Typography variant="body1" color="white" component="pre" sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', marginBottom: 2 }}>
          {lab.lab_proyects && formatProjects(lab.lab_proyects)}
        </Typography>
        <Box sx={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderQRCode()}
          {imageError && <Typography color="error">{imageError}</Typography>}  {/* Mostrar el error si ocurre */}
          <Button
            variant="contained"
            onClick={downloadQR}
            sx={{
              backgroundColor: '#ff3333',
              '&:hover': { backgroundColor: '#e60000' }
            }}
          >
            Download QR Code
          </Button>
        </Box>
      </Card>
      
      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Images
      </Typography>

      {lab.lab_images && (
        <Card sx={{ marginTop: 2, padding: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
          {renderImages()}
        </Card>
      )}

      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Video
      </Typography>

      {lab.lab_video && (
        <Card sx={{ marginTop: 2, padding: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
          {renderVideo()}
        </Card>
      )}

      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Podcast (Audio)
      </Typography>

      {lab.lab_podcast && (
        <Card sx={{ marginTop: 2, padding: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
          {renderAudio()}
        </Card>
      )}

      {/* Dialogo de confirmación de eliminación */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Delete Lab</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this lab? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ color: 'red' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LabDetail;