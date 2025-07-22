import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const AISummary = ({ aiSummaryGenerated, includeAISummary, setIncludeAISummary, setAiSummaryGenerated, hasSelectedCharts }) => {
  const aiSummary = `Here is the summary of the report produced by AI.`;
  return (
    <Paper sx={{ p: 3, mb: 4, borderLeft: '4px solid #009ca6' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3" sx={{ mb: 0 }}>
          AI Summary
        </Typography>
        {!aiSummaryGenerated && hasSelectedCharts && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setAiSummaryGenerated(true)}
            sx={{ backgroundColor: '#009ca6', '&:hover': { backgroundColor: '#78be20' } }}
          >
            Generate AI Summary
          </Button>
        )}
        {aiSummaryGenerated && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setIncludeAISummary(!includeAISummary)}
            sx={{ backgroundColor: includeAISummary ? '#78be20' : '#e9ecef', color: includeAISummary ? '#ffffff' : '#666', '&:hover': { backgroundColor: includeAISummary ? '#009ca6' : '#d6d6d6' } }}
          >
            {includeAISummary ? 'Include Summary' : 'Exclude Summary'}
          </Button>
        )}
      </Box>
      {aiSummaryGenerated && includeAISummary ? (
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {aiSummary}
        </Typography>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Select charts and click "Generate AI Summary" to create an AI analysis of your data.
        </Typography>
      )}
    </Paper>
  );
};

export default AISummary; 