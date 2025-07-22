import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { getFileRequirements, isValidFileType } from '../../helper/Api';

const SingleUploadArea = ({ 
  files, 
  setFiles, 
  isDragging, 
  setIsDragging, 
  theme, 
  reportOptions, 
  setUploadResult 
}) => {
  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // 验证文件类型
    const validFiles = selectedFiles.filter(isValidFileType);
    if (validFiles.length !== selectedFiles.length) {
      setUploadResult({
        success: false,
        error: 'Some files were rejected. Only .xlsx, .xls, and .csv files are allowed.'
      });
    }
    
    console.log('📂 Main Upload - Files selected:', validFiles.map(f => ({name: f.name, size: f.size, type: f.type})));
    
    // 根据模式限制文件数量
    const requirements = getFileRequirements(reportOptions);
    const maxFiles = requirements.total;
    
    // 检查文件数量限制
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      setUploadResult({ 
        success: false, 
        error: `${requirements.description} allows maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''}` 
      });
      return;
    }
    
    const filesToAdd = validFiles.slice(0, remainingSlots);
    setFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const allDroppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = allDroppedFiles.filter(isValidFileType);
    
    if (validFiles.length !== allDroppedFiles.length) {
      setUploadResult({
        success: false,
        error: 'Some files were rejected. Only .xlsx, .xls, and .csv files are allowed.'
      });
    }
    
    console.log('🎯 Main Upload - Files dropped:', validFiles.map(f => ({name: f.name, size: f.size, type: f.type})));

    if (validFiles.length > 0) {
      // 根据模式限制文件数量
      const requirements = getFileRequirements(reportOptions);
      const maxFiles = requirements.total;
      
      // 检查文件数量限制
      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) {
        setUploadResult({ 
          success: false, 
          error: `${requirements.description} allows maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''}` 
        });
        return;
      }
      
      const filesToAdd = validFiles.slice(0, remainingSlots);
      setFiles(prev => [...prev, ...filesToAdd]);
    }
  }, [reportOptions, files.length, setFiles, setIsDragging, setUploadResult]);

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const requirements = getFileRequirements(reportOptions);

  return (
    <Paper
      elevation={isDragging ? 8 : 2}
      sx={{
        p: 4,
        textAlign: 'center',
        border: `3px dashed ${isDragging ? theme.palette.secondary.light : theme.palette.secondary.main}`,
        backgroundColor: isDragging ? 'rgba(120, 190, 32, 0.1)' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        mb: 4,
        borderRadius: 3,
        '&:hover': {
          borderColor: theme.palette.secondary.light,
          backgroundColor: 'rgba(0, 156, 166, 0.05)',
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${theme.palette.secondary.main}33`,
        },
      }}
      onClick={() => document.getElementById('fileInput').click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        id="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        multiple
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {/* Upload Icon with Animation */}
      <Box sx={{
        mb: 3,
        animation: isDragging ? 'bounce 1s infinite' : 'none',
        '@keyframes bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        }
      }}>
        <UploadIcon sx={{ fontSize: 64, color: theme.palette.secondary.main, mb: 2 }} />
      </Box>
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
        {isDragging ? 'Drop files here!' : 'Upload Excel & CSV Files'}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: theme.palette.primary.main }}>
        Click to browse or drag and drop your files
      </Typography>
      
      {/* 文件数量限制提示 */}
      <Typography variant="body2" sx={{ 
        color: theme.palette.info.main, 
        fontWeight: 600, 
        mb: 1 
      }}>
        📄 {requirements.description}: Upload {requirements.total} file{requirements.total > 1 ? 's' : ''} ({files.length}/{requirements.total})
      </Typography>
      
      {/* Supported formats */}
      <Box sx={{ mt: 2 }}>
        <Chip
          label="XLSX"
          size="small"
          sx={{
            mx: 0.5,
            backgroundColor: theme.palette.info.main,
            color: '#ffffff',
            fontWeight: 500,
          }}
        />
        <Chip
          label="XLS"
          size="small"
          sx={{
            mx: 0.5,
            backgroundColor: theme.palette.secondary.dark,
            color: '#ffffff',
            fontWeight: 500,
          }}
        />
        <Chip
          label="CSV"
          size="small"
          sx={{
            mx: 0.5,
            backgroundColor: theme.palette.warning.main,
            color: '#ffffff',
            fontWeight: 500,
          }}
        />
      </Box>
      
      {/* 文件列表 */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: index < files.length - 1 ? '1px solid rgba(9, 31, 146, 0.1)' : 'none',
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'rgba(255, 211, 0, 0.05)',
              }}
              secondaryAction={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={e => { e.stopPropagation(); handleRemoveFile(index); }}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.error.main,
                      color: '#fff',
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </Button>
              }
            >
              <ListItemIcon>
                <FileIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="body1" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>{file.name}</Typography>}
                secondary={<Typography variant="body2" sx={{ color: theme.palette.secondary.dark }}>
                  {file.size && !isNaN(file.size) ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                </Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default SingleUploadArea; 