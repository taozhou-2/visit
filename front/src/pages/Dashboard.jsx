import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleUpload = () => {
    navigate('/upload');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${theme.palette.custom.blue} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '2rem', md: '2.8rem' } }}>
          Welcome to Automated Reporting
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '1rem', md: '1.2rem' } }}>
          Upload your data to get automated analysis and reporting.
        </Typography>
      </Box>

      {/* Main Action Section */}
      <Box
        sx={{
          textAlign: 'center',
          px: 4,
          py: 6,
          borderRadius: 4,
          minWidth: { xs: '90vw', sm: 400 },
          maxWidth: 480,
        }}
      >
        {/* Icon with cyan background */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: theme.palette.custom.cyan,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: `0 4px 16px ${theme.palette.custom.cyan}66`,
          }}
        >
          <UploadIcon sx={{ fontSize: 40, color: '#000' }} />
        </Box>

        <Typography variant="h3" component="h3" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
          Ready to Start?
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
          Transform your Excel data into professional reports with AI-powered insights
        </Typography>

        {/* Action Button */}
        <Button
          variant="outlined"
          size="large"
          onClick={handleUpload}
          startIcon={<UploadIcon />}
          sx={{
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.1rem',
            px: 6,
            py: 1.5,
            background: theme.palette.custom.pink,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.custom.pink} 0%, ${theme.palette.secondary.main} 100%)`,
            },
          }}
        >
          Start to use
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard; 