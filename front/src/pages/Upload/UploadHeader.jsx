import React from 'react';
import { Box, Typography } from '@mui/material';

const UploadHeader = ({ theme }) => {
  return (
    <Box sx={{
      textAlign: 'center',
      mb: 4,
      p: 3,
      borderRadius: 2,
      background: 'rgba(255,255,255,0.95)',
      color: theme.palette.primary.main,
    }}>
      <Typography variant="h1" gutterBottom sx={{ color: theme.palette.primary.main }}>
        Upload Files
      </Typography>
      <Typography variant="body1" sx={{ color: theme.palette.text.primary, opacity: 0.8 }}>
        Drag and drop your Excel files or click to browse
      </Typography>
    </Box>
  );
};

export default UploadHeader; 