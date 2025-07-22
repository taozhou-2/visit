import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

const getRegionalColor = (regional) => {
  switch (regional) {
    case 'Major Cities of Australia': return '#2dc398';
    case 'Inner Regional Australia': return '#2563eb';
    case 'Outer Regional Australia': return '#e74c3c';
    case 'Remote Australia': return '#f1c40f';
    case 'Very Remote Australia': return '#9b59b6';
    case 'Unknown': return '#95a5a6';
    default: return '#34495e';
  }
};

const getPercent = (value, total) => ((value / total) * 100).toFixed(2) + '%';

const Chart6Regional = ({ data, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading regional remote data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1">No regional remote data available</Typography>;
  }

  const validData = data.filter(entry => entry && entry.count > 0);
  const total = validData.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return <Typography variant="body1">No valid regional remote data to display</Typography>;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h3" gutterBottom>WIL Participation by Regional Remote</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 3, justifyContent: 'center' }}>
        {/* 左侧：饼图 */}
        <Box sx={{ flex: '0 0 auto' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 1, color: '#4A148C', fontWeight: 600, textAlign: 'center' }}>
            Regional Remote Distribution
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
            Total Participants: {total.toLocaleString()} students
          </Typography>
          <PieChart width={400} height={350}>
            <Pie
              data={validData}
              dataKey="count"
              nameKey="regional_remote"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              startAngle={270}
              endAngle={630}
              label={({ percent }) => {
                if (percent * 100 > 5) {
                  return `${(percent * 100).toFixed(1)}%`;
                }
                return null;
              }}
              labelLine={({ percent }) => percent * 100 > 5}
            >
              {validData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getRegionalColor(entry.regional_remote)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value.toLocaleString()} (${getPercent(value, total)})`, name]} />
          </PieChart>
        </Box>

        {/* 右侧：统计数据 */}
        <Box sx={{ width: 320, pl: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
          {validData.map((entry, idx) => {
            const regionalColor = getRegionalColor(entry.regional_remote);
            return (
              <Box key={entry.regional_remote} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                }
              }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: regionalColor,
                  flexShrink: 0
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.2, fontSize: '0.9rem' }}>
                    {entry.regional_remote}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {entry.count.toLocaleString()} students
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: regionalColor, fontWeight: 'bold', minWidth: '50px', textAlign: 'right', fontSize: '0.95rem' }}>
                  {getPercent(entry.count, total)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Chart6Regional; 