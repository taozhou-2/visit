import React from 'react';
import { Box, Typography, Paper, Button, TextField, CircularProgress, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';

const ChartOptions = ({ charts, chartOptions, setChartOptions, sendEmail, setSendEmail, email, setEmail, generateReport, isGeneratingReport }) => {
  const handleSelectAll = () => {
    const newOptions = {};
    charts.forEach(chart => { newOptions[chart.id] = true; });
    setChartOptions(newOptions);
  };
  const handleSelectNone = () => {
    const newOptions = {};
    charts.forEach(chart => { newOptions[chart.id] = false; });
    setChartOptions(newOptions);
  };
  const handleChartOptionChange = (id) => {
    setChartOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateReport = () => {
    // 检查是否选择了图表
    const hasSelectedCharts = Object.values(chartOptions).some(selected => selected);
    if (!hasSelectedCharts) {
      alert('Please select at least one chart to generate the report.');
      return;
    }

    generateReport();
  };
  return (
    <Box sx={{ width: '300px', p: 4, backgroundColor: '#f8f9fa', borderLeft: '1px solid #e9ecef' }}>
      <Typography variant="h1" gutterBottom>Chart Options</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" size="small" fullWidth onClick={handleSelectAll} sx={{ backgroundColor: '#091f92', '&:hover': { backgroundColor: '#0033a0' } }}>Select All</Button>
        <Button variant="contained" size="small" fullWidth onClick={handleSelectNone} sx={{ backgroundColor: '#009ca6', '&:hover': { backgroundColor: '#78be20' } }}>Select None</Button>
      </Box>
      
      {/* 图表选择区域 */}
      <Box sx={{ mb: 2 }}>
        {charts.map((chart) => (
          <Paper key={chart.id} elevation={1} sx={{ p: 2, mb: 1, border: `2px solid ${chartOptions[chart.id] ? '#091f92' : '#e9ecef'}`, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { borderColor: '#009ca6', transform: 'translateY(-2px)' } }} onClick={() => handleChartOptionChange(chart.id)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 20, border: `2px solid ${chartOptions[chart.id] ? '#091f92' : '#009ca6'}`, borderRadius: 1, mr: 2, backgroundColor: chartOptions[chart.id] ? '#091f92' : 'transparent', transition: 'all 0.3s ease', position: 'relative', '&::after': { content: '""', width: 10, height: 10, backgroundColor: '#ffffff', borderRadius: 0.5, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: chartOptions[chart.id] ? 'block' : 'none' } }} />
              <Typography variant="body1">{chart.title}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 分隔线 */}
      <Divider sx={{ my: 2, borderColor: '#ddd' }} />

      {/* 报告生成选项区域 */}
      <Box sx={{ mb: 3 }}>
        {/* 下载选项 */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1.5, 
            mb: 1.5, 
            border: `2px solid ${!sendEmail ? '#28a745' : '#e9ecef'}`, 
            cursor: 'pointer', 
            transition: 'all 0.3s ease', 
            backgroundColor: !sendEmail ? '#f8fff9' : '#fff',
            '&:hover': { borderColor: '#28a745', backgroundColor: '#f8fff9' } 
          }} 
          onClick={() => setSendEmail(false)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DownloadIcon sx={{ color: !sendEmail ? '#28a745' : '#999', mr: 1.5, fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: !sendEmail ? '#28a745' : '#333' }}>
                Download PDF Report
              </Typography>
            </Box>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              border: `2px solid ${!sendEmail ? '#28a745' : '#ddd'}`, 
              borderRadius: '50%', 
              backgroundColor: !sendEmail ? '#28a745' : 'transparent', 
              transition: 'all 0.3s ease', 
              position: 'relative', 
              '&::after': { 
                content: '""', 
                width: 6, 
                height: 6, 
                backgroundColor: '#ffffff', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                display: !sendEmail ? 'block' : 'none' 
              } 
            }} />
          </Box>
        </Paper>

        {/* 邮件选项 */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1.5, 
            mb: 1.5, 
            border: `2px solid ${sendEmail ? '#007bff' : '#e9ecef'}`, 
            cursor: 'pointer', 
            transition: 'all 0.3s ease', 
            backgroundColor: sendEmail ? '#f8fbff' : '#fff',
            '&:hover': { borderColor: '#007bff', backgroundColor: '#f8fbff' } 
          }} 
          onClick={() => setSendEmail(true)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ color: sendEmail ? '#007bff' : '#999', mr: 1.5, fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: sendEmail ? '#007bff' : '#333' }}>
                Send Report via Email
              </Typography>
            </Box>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              border: `2px solid ${sendEmail ? '#007bff' : '#ddd'}`, 
              borderRadius: '50%', 
              backgroundColor: sendEmail ? '#007bff' : 'transparent', 
              transition: 'all 0.3s ease', 
              position: 'relative', 
              '&::after': { 
                content: '""', 
                width: 6, 
                height: 6, 
                backgroundColor: '#ffffff', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                display: sendEmail ? 'block' : 'none' 
              } 
            }} />
          </Box>
        </Paper>
      </Box>

      {/* 邮箱输入框 */}
      {sendEmail && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Email Address
          </Typography>
          <TextField 
            fullWidth 
            type="email" 
            placeholder="Enter your email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#007bff',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#007bff',
                },
              },
            }}
          />
        </Box>
      )}

      {/* 生成报告按钮 */}
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleGenerateReport}
        disabled={isGeneratingReport}
        sx={{ 
          backgroundColor: sendEmail ? '#007bff' : '#28a745', 
          p: 2, 
          '&:hover': { backgroundColor: sendEmail ? '#0056b3' : '#218838' }, 
          '&:disabled': { backgroundColor: '#e9ecef', color: '#999' } 
        }}
      >
        {isGeneratingReport ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: '#fff' }} />
            Generating...
          </Box>
        ) : (
          sendEmail ? 'Send Report' : 'Download Report'
        )}
      </Button>
    </Box>
  );
};

export default ChartOptions; 