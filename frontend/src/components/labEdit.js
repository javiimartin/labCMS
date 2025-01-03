import React, { useEffect, useState } from "react";
import { Container, TextField, Button, Card, Box, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import validateMultimedia from '../middleware/labs.middle';

const UploadField = ({ label, onChange, accept, error, file, onDelete, disabled = false }) => (
  <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column' }}>
    {!file ? (
      <Button
        variant="contained"
        component="label"
        sx={{
          marginTop: '1rem',
          color: 'white',
          backgroundColor: '#ff3333',
          '&:hover': { backgroundColor: '#e60000' }
        }}
        disabled={disabled}
        aria-label={`Upload ${label}`}
      >
        {`Upload ${label}`}
        <input
          type="file"
          hidden
          onChange={onChange}
          accept={accept}
        />
      </Button>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ color: 'white', marginRight: 2 }}>
          {file.name}
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#ff3333',
            '&:hover': { backgroundColor: '#e60000' }
          }}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Box>
    )}
    {error && (
      <Alert severity="error" sx={{ marginTop: '1rem' }}>
        {error}
      </Alert>
    )}
  </Box>
);

const EditableList = ({ label, items, onAdd, onDelete, newItem, setNewItem }) => (
  <>
    <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
      {label}
    </Typography>
    <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2 }}>
      <Box sx={{ marginTop: 2 }}>
        {items && items.split(' - ').map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <Typography variant="body1" color="white" sx={{ flexGrow: 1 }}>
              {item.trim()}
            </Typography>
            <Button
              variant="contained"
              onClick={() => onDelete(index)}
              sx={{
                backgroundColor: '#ff3333',
                '&:hover': { backgroundColor: '#e60000' }
              }}
            >
              Delete
            </Button>
          </Box>
        ))}
      </Box>
      <Box sx={{ marginTop: 2, display: 'flex' }}>
        <TextField
          variant="filled"
          label={`New ${label.slice(0, -1)}`}
          fullWidth
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={onAdd}
          sx={{
            marginLeft: 1,
            backgroundColor: '#ff3333',
            '&:hover': { backgroundColor: '#e60000' }
          }}
        >
          Add {label.slice(0, -1)}
        </Button>
      </Box>
    </Card>
  </>
);

const EditLab = () => {
  const { labId } = useParams();
  const [lab, setLab] = useState({
    lab_name: "",
    lab_description: "",
    lab_objectives: "",
    lab_proyects: "",
    lab_images: "",
    lab_video: "",
    lab_podcast: ""
  });
  const [newObjective, setNewObjective] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [newAudio, setNewAudio] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [videoToDelete, setVideoToDelete] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState({ images: [], multimedia: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (labId) {
      const fetchLabData = async () => {
        try {
          const response = await fetch(`https://localhost:5000/labs/${labId}`);
          if (!response.ok) throw new Error("Failed to fetch lab data");
          const data = await response.json();
          // Filtrar imágenes vacías
          data.lab_images = data.lab_images
            ? data.lab_images.split(' - ').filter(img => img.trim() !== "").join(' - ')
            : "";
          setLab(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchLabData();
    }
  }, [labId]);

  const totalImagesCount = () => {
    const existingImagesCount = (lab.lab_images ?? '').split(' - ').filter(img => img.trim() !== "").length;
    return existingImagesCount + newImages.length;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLab({ ...lab, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newImageErrors = [];

    files.forEach(file => {
      const validation = validateMultimedia(file, "image");
      if (validation.valid) {
        if (!newImages.some(img => img.name === file.name)) {
          validFiles.push(file);
        } else {
          newImageErrors.push(`Image "${file.name}" is already selected.`);
        }
      } else {
        newImageErrors.push(validation.error);
      }
    });

    setErrors(prev => ({ ...prev, images: newImageErrors }));
    setNewImages([...newImages, ...validFiles]);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrors(prev => ({ ...prev, multimedia: 'No file selected.' }));
      return;
    }

    const validation = validateMultimedia(file, "video");
    if (validation.valid) {
      setNewVideo(file);
      setErrors(prev => ({ ...prev, multimedia: '' }));
    } else {
      setErrors(prev => ({ ...prev, multimedia: validation.error }));
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrors(prev => ({ ...prev, multimedia: 'No file selected.' }));
      return;
    }

    const validation = validateMultimedia(file, "audio");
    if (validation.valid) {
      setNewAudio(file);
      setErrors(prev => ({ ...prev, multimedia: '' }));
    } else {
      setErrors(prev => ({ ...prev, multimedia: validation.error }));
    }
  };

  const handleDeleteObjective = (index) => {
    const objectivesArray = lab.lab_objectives.split(' - ').map(obj => obj.trim());
    objectivesArray.splice(index, 1);
    setLab({ ...lab, lab_objectives: objectivesArray.join(' - ') });
  };

  const handleAddObjective = () => {
    const updatedObjectives = lab.lab_objectives
      ? `${lab.lab_objectives} - ${newObjective}`
      : newObjective;
    setLab({ ...lab, lab_objectives: updatedObjectives });
    setNewObjective("");
  };

  const handleDeleteProject = (index) => {
    const projectsArray = lab.lab_proyects.split(' - ').map(proj => proj.trim());
    projectsArray.splice(index, 1);
    setLab({ ...lab, lab_proyects: projectsArray.join(' - ') });
  };

  const handleAddProject = () => {
    const updatedProjects = lab.lab_proyects
      ? `${lab.lab_proyects} - ${newProject}`
      : newProject;
    setLab({ ...lab, lab_proyects: updatedProjects });
    setNewProject("");
  };

  const markImageForDeletion = (imageUrl) => {
    setImagesToDelete([...imagesToDelete, imageUrl]);
    setLab({
      ...lab,
      lab_images: (lab.lab_images ?? '').split(' - ').filter(img => img !== imageUrl).join(' - ')
    });
  };

  const handleDeleteNewImage = (index) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
  };

  const handleDeleteVideo = () => {
    setNewVideo(null);
    setVideoToDelete(true);
    setLab({ ...lab, lab_video: '' });  // Clear the existing video from the state
  };

  const handleDeleteAudio = () => {
    setNewAudio(null);
    setAudioToDelete(true);
    setLab({ ...lab, lab_podcast: '' });  // Clear the existing audio from the state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("lab_name", lab.lab_name);
    formData.append("lab_description", lab.lab_description);
    formData.append("lab_objectives", lab.lab_objectives);
    formData.append("lab_proyects", lab.lab_proyects);

    // Include images marked for deletion
    imagesToDelete.forEach(image => {
        formData.append("imagesToDelete", image);
    });

    // Add flag for deleting video or audio
    if (videoToDelete) {
        formData.append("videoToDelete", true);
    }

    if (audioToDelete) {
        formData.append("audioToDelete", true);
    }

    // Add images
    newImages.forEach(image => {
        formData.append("lab_images", image);  // Ensure the key matches what backend expects
    });

    // Add video
    if (newVideo) {
        formData.append("lab_video", newVideo);  // Ensure the key matches what backend expects
    }

    // Add audio (podcast)
    if (newAudio) {
        formData.append("lab_podcast", newAudio);  // Ensure the key matches what backend expects
    }

    const method = labId ? 'PUT' : 'POST';
    const url = labId ? `https://localhost:5000/labs/${labId}` : 'https://localhost:5000/labs';

    try {
        const response = await fetch(url, {
            method,
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.lab_code) {
            setSnackbarMessage('Lab saved successfully');
            setOpenSnackbar(true);
            setLoading(false);
            navigate(`/labs/${result.lab_code}`);
        } else {
            throw new Error(result.message || "Invalid lab code returned");
        }
    } catch (error) {
        console.error('Error during form submission:', error);
        setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <CircularProgress />;

  const maxImagesReached = totalImagesCount() >= 10;

  const removePrefix = (fileName) => fileName.replace(/^\d{13}-/, '');

  return (
    <Container>
      <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2 }}>
        <Typography variant="h5" color="white">
          {labId ? "Edit Lab" : "Create Lab"}
        </Typography>
        <TextField
          variant="filled"
          label="Lab Name"
          name="lab_name"
          fullWidth
          sx={{ marginTop: 2 }}
          value={lab.lab_name}
          onChange={handleInputChange}
        />
        <TextField
          variant="filled"
          label="Lab Description"
          name="lab_description"
          fullWidth
          multiline
          sx={{ marginTop: 2 }}
          value={lab.lab_description}
          onChange={handleInputChange}
        />
      </Card>

      <EditableList
        label="Objectives"
        items={lab.lab_objectives}
        onAdd={handleAddObjective}
        onDelete={handleDeleteObjective}
        newItem={newObjective}
        setNewItem={setNewObjective}
      />

      <EditableList
        label="Projects"
        items={lab.lab_proyects}
        onAdd={handleAddProject}
        onDelete={handleDeleteProject}
        newItem={newProject}
        setNewItem={setNewProject}
      />

      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Images
      </Typography>
      <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2 }}>
        <Box sx={{ marginTop: 2 }}>
          {lab.lab_images && lab.lab_images.split(' - ')
            .filter(img => img.trim() !== "") 
            .map((img, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <Typography variant="body1" color="white" sx={{ flexGrow: 1 }}>
                  {removePrefix(img.split('/').pop())}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => markImageForDeletion(img)}
                  sx={{
                    backgroundColor: '#ff3333',
                    '&:hover': { backgroundColor: '#e60000' }
                  }}
                >
                  Delete
                </Button>
              </Box>
            ))}
        </Box>

        {newImages.map((image, index) => (
          <UploadField
            key={index}
            label="Image"
            file={image}
            onDelete={() => handleDeleteNewImage(index)}
          />
        ))}

        <UploadField
          label="Image"
          onChange={handleImageChange}
          accept="image/*"
          error={errors.images.length > 0 && errors.images.join(', ')}
          disabled={maxImagesReached} 
        />
      </Card>

      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Video
      </Typography>
      <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2 }}>
        {lab.lab_video && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <Typography variant="body1" color="white" sx={{ flexGrow: 1 }}>
              {removePrefix(lab.lab_video.split('/').pop())}
            </Typography>
            <Button
              variant="contained"
              onClick={handleDeleteVideo}
              sx={{
                backgroundColor: '#ff3333',
                '&:hover': { backgroundColor: '#e60000' }
              }}
            >
              Delete
            </Button>
          </Box>
        )}
        <UploadField
          label="Video"
          file={newVideo}
          onChange={handleVideoChange}
          onDelete={handleDeleteVideo}
          accept="video/*"
          error={errors.multimedia}
          disabled={!!lab.lab_video && !videoToDelete}  
        />
      </Card>

      <Typography variant="h6" sx={{ marginTop: 2, backgroundColor: '#d82626', padding: 1, color: '#ffffff' }}>
        Podcast (Audio)
      </Typography>
      <Card sx={{ backgroundColor: '#ff4d4d', marginTop: 2, padding: 2 }}>
        {lab.lab_podcast && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <Typography variant="body1" color="white" sx={{ flexGrow: 1 }}>
              {removePrefix(lab.lab_podcast.split('/').pop())}
            </Typography>
            <Button
              variant="contained"
              onClick={handleDeleteAudio}
              sx={{
                backgroundColor: '#ff3333',
                '&:hover': { backgroundColor: '#e60000' }
              }}
            >
              Delete
            </Button>
          </Box>
        )}
        <UploadField
          label="Podcast"
          file={newAudio}
          onChange={handleAudioChange}
          onDelete={handleDeleteAudio}
          accept="audio/*"
          error={errors.multimedia}
          disabled={!!lab.lab_podcast && !audioToDelete}  
        />
      </Card>

      <Button
        type="submit"
        variant="contained"
        sx={{
          marginTop: 2,
          backgroundColor: '#ff3333',
          '&:hover': { backgroundColor: '#e60000' }
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : labId ? "Save Changes" : "Create Lab"}
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ marginBottom: 4 }}></Box>
    </Container>
  );
};

export default EditLab;
