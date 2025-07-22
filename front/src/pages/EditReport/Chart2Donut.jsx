import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

const getGenderColor = (gender) => {
  switch (gender.toLowerCase()) {
    case 'female': return '#e07bb6';
    case 'male': return '#091f92';
    case 'unspecified': return '#ffa726';
    default: return '#9e9e9e';
  }
};

const getPercent = (value, total) => ((value / total) * 100).toFixed(2) + '%';

const Chart2Donut = ({ data, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading gender participation data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1" color="text.secondary">No gender participation data available</Typography>;
  }
  const validData = data.filter(item => item && typeof item === 'object' && 'gender' in item && 'count' in item && typeof item.count === 'number');
  if (validData.length === 0) {
    return <Typography variant="body1" color="text.secondary">Invalid data format received</Typography>;
  }
  const total = validData.reduce((sum, d) => sum + (d.count || 0), 0);
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h3" gutterBottom>WIL Participation by Gender</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 3, justifyContent: 'center' }}>
        {/* 左侧：饼图 */}
        <Box sx={{ flex: '0 0 auto' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 1, color: '#4A148C', fontWeight: 600, textAlign: 'center' }}>
            Gender Distribution
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
            Total Participants: {total.toLocaleString()} students
          </Typography>
          <PieChart width={400} height={350}>
            <Pie
              data={validData}
              dataKey="count"
              nameKey="gender"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              startAngle={90}
              endAngle={450}
              label={({ percent }) => {
                if (percent * 100 > 5) {
                  return `${(percent * 100).toFixed(1)}%`;
                }
                return null;
              }}
              labelLine={({ percent }) => percent * 100 > 5}
            >
              {validData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getGenderColor(entry.gender)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value.toLocaleString()} (${getPercent(value, total)})`, name]} />
          </PieChart>
        </Box>

        {/* 右侧：统计数据 */}
        <Box sx={{ width: 320, pl: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
          {validData.map((entry, idx) => {
            const genderColor = getGenderColor(entry.gender);
            return (
              <Box key={entry.gender} sx={{ 
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
                  backgroundColor: genderColor,
                  flexShrink: 0
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.2, fontSize: '0.9rem' }}>
                    {entry.gender}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {entry.count.toLocaleString()} students
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: genderColor, fontWeight: 'bold', minWidth: '50px', textAlign: 'right', fontSize: '0.95rem' }}>
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

export default Chart2Donut; 