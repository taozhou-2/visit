import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { getFileRequirements } from '../../helper/Api';

const ReportOptions = ({
  theme,
  reportOptions,
  handleReportOptionChange,
  handleGenerateReport,
  uploading,
  uploadResult,
  files,
  oldFiles,
  newFiles,
  selectedTerm,
  onTermSelect,
}) => {
  const reportOptionsList = [
    {
      key: 'census',
      title: 'Census Day Drop',
      description: 'Analyze student enrollment drops on census day',
      color: theme.palette.secondary.main,
    },
    {
      key: 'comparison',
      title: 'YoY Comparison',
      description: 'Year-over-year performance analysis',
      color: theme.palette.secondary.light,
    },
  ];

  const termOptions = ['Hexamester 1', 
                       'Hexamester 4', 
                       'Semester 1 Canberra', 
                       'Semester 2 Canberra', 
                       'Summer Term', 
                       'Term 1', 
                       'Term 2', 
                       'Term 3'];

  return (
    <Box sx={{
      width: '350px',
      p: 4,
      background: 'rgba(255,255,255,0.95)',
      borderLeft: '1px solid rgba(9, 31, 146, 0.1)',
    }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
        Report Options
      </Typography>

      <Typography variant="body2" sx={{ color: theme.palette.primary.main, mb: 3, opacity: 0.8 }}>
        Select the analysis types you want to include in your report
      </Typography>

      <Box sx={{ mb: 4 }}>
        {reportOptionsList.map((option) => (
          <Box key={option.key}>
            <Paper
              elevation={reportOptions[option.key] ? 4 : 1}
              sx={{
                p: 3,
                mb: reportOptions[option.key] && option.key === 'census' ? 2 : 3,
                border: `2px solid ${reportOptions[option.key] ? option.color : 'rgba(9, 31, 146, 0.1)'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: 2,
                background: reportOptions[option.key]
                  ? `${option.color}15`
                  : '#ffffff',
                '&:hover': {
                  borderColor: option.color,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 6px 20px ${option.color}30`,
                },
              }}
              onClick={() => handleReportOptionChange(option.key)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Custom Checkbox */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    border: `2px solid ${reportOptions[option.key] ? option.color : theme.palette.secondary.main}`,
                    backgroundColor: reportOptions[option.key] ? option.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    mt: 0,
                    mr: 2,
                  }}
                >
                  {reportOptions[option.key]
                    ? <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />
                    : <Box sx={{ width: 16, height: 16 }} />}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      {option.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                    {option.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Term Selection - Only show for census option when selected */}
            {option.key === 'census' && (
              <Collapse in={reportOptions.census} timeout={300}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 3,
                    ml: 2,
                    mr: 0,
                    border: `1px solid ${theme.palette.secondary.main}30`,
                    borderRadius: 2,
                    background: '#f8f9ff',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <ExpandMoreIcon sx={{ fontSize: 18 }} />
                    Select Term
                  </Typography>

                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    <Select
                      value={selectedTerm || ''}
                      onChange={(event) => {
                        onTermSelect(event.target.value);
                      }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <em style={{
                              color: theme.palette.text.secondary,
                              fontStyle: 'italic',
                              fontWeight: 400
                            }}>
                              Choose a term for analysis
                            </em>
                          );
                        }
                        return selected;
                      }}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: `${theme.palette.secondary.main}40`,
                          transition: 'all 0.2s ease',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.secondary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.secondary.main,
                          borderWidth: '2px',
                        },
                        '& .MuiSelect-select': {
                          color: selectedTerm ? theme.palette.primary.main : theme.palette.text.secondary,
                          fontWeight: selectedTerm ? 500 : 400,
                          py: 1.5,
                        },
                        '& .MuiSvgIcon-root': {
                          color: theme.palette.secondary.main,
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: 2,
                            mt: 1,
                            boxShadow: `0 8px 32px ${theme.palette.secondary.main}20`,
                            '& .MuiMenuItem-root': {
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              py: 1.5,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: `${theme.palette.secondary.main}10`,
                                color: theme.palette.secondary.main,
                              },
                              '&.Mui-selected': {
                                backgroundColor: `${theme.palette.secondary.main}15`,
                                color: theme.palette.secondary.main,
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: `${theme.palette.secondary.main}20`,
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      {termOptions.map((term) => (
                        <MenuItem key={term} value={term}>
                          {term}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedTerm && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.secondary.main,
                        mt: 2,
                        fontWeight: 500
                      }}
                    >
                      Selected: {selectedTerm}
                    </Typography>
                  )}
                </Paper>
              </Collapse>
            )}
          </Box>
        ))}
      </Box>

      {/* Action Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleGenerateReport}
        disabled={
          uploading ||
          (reportOptions.census
            ? (oldFiles.length < (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) ||
              newFiles.length < (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) ||
              !selectedTerm)
            : files.length < getFileRequirements(reportOptions).total)
        }
        sx={{
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 600,
          background: (reportOptions.census
            ? (oldFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) &&
              newFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) &&
              selectedTerm)
            : files.length >= getFileRequirements(reportOptions).total)
            ? theme.palette.custom.pink
            : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
          color: (reportOptions.census
            ? (oldFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) &&
              newFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) &&
              selectedTerm)
            : files.length >= getFileRequirements(reportOptions).total) ? '#ffffff' : '#757575',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.custom.pink} 0%, ${theme.palette.secondary.main} 100%)`,
            transform: (reportOptions.census
              ? (oldFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) &&
                newFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) &&
                selectedTerm)
              : files.length >= getFileRequirements(reportOptions).total) ? 'translateY(-2px)' : 'none',
            boxShadow: (reportOptions.census
              ? (oldFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) &&
                newFiles.length >= (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) &&
                selectedTerm)
              : files.length >= getFileRequirements(reportOptions).total) ? `0 8px 32px ${theme.palette.primary.main}33` : 'none',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            color: '#757575',
          },
        }}
      >
        <AnalyticsIcon sx={{ mr: 1 }} />
        {uploading ? 'Processing...' : 'Generate Analysis Report'}
      </Button>

      {/* 上传进度显示 */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: theme.palette.primary.main }}>
            Uploading files and processing data...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Status Message */}
      {reportOptions.census ? (
        // Census Day模式状态
        (oldFiles.length < (getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) ||
          newFiles.length < (getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) ||
          !selectedTerm) ? (
          <Alert
            severity="info"
            sx={{
              mt: 3,
              backgroundColor: 'rgba(231, 113, 184, 0.1)',
              color: theme.palette.primary.main,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
            }}
          >
            {getFileRequirements(reportOptions).description} requires {getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1} file{(getFileRequirements(reportOptions).files.find(f => f.area === 'before')?.count || 1) > 1 ? 's' : ''} before and {getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1} file{(getFileRequirements(reportOptions).files.find(f => f.area === 'after')?.count || 1) > 1 ? 's' : ''} after census day
            {!selectedTerm && <><br />Please select a term to continue</>}
          </Alert>
        ) : (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              backgroundColor: 'rgba(120, 190, 32, 0.1)',
              color: theme.palette.primary.main,
              '& .MuiAlert-icon': {
                color: theme.palette.secondary.light,
              },
            }}
          >
            Census files ready: {oldFiles.length + newFiles.length} files total ({selectedTerm})
          </Alert>
        )
      ) : (
        // 默认/YoY模式状态
        files.length < getFileRequirements(reportOptions).total ? (
          <Alert
            severity="info"
            sx={{
              mt: 3,
              backgroundColor: 'rgba(231, 113, 184, 0.1)',
              color: theme.palette.primary.main,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main,
              },
            }}
          >
            {getFileRequirements(reportOptions).description} requires {getFileRequirements(reportOptions).total} file{getFileRequirements(reportOptions).total > 1 ? 's' : ''}
          </Alert>
        ) : (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              backgroundColor: 'rgba(120, 190, 32, 0.1)',
              color: theme.palette.primary.main,
              '& .MuiAlert-icon': {
                color: theme.palette.secondary.light,
              },
            }}
          >
            {files.length} file{files.length > 1 ? 's' : ''} ready for analysis
          </Alert>
        )
      )}

      {uploadResult && (
        <Alert
          severity={uploadResult.success ? "success" : "error"}
          sx={{ mt: 2 }}
        >
          {uploadResult.success
            ? `Upload successful! Analysis mode: ${uploadResult.analysisMode || 'default'}`
            : uploadResult.error || 'Upload failed'}
        </Alert>
      )}
    </Box>
  );
};

export default ReportOptions; 