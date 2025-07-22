import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const percentTickFormatter = (v) => v >= 100 ? '100%' : `${v}%`;

const Chart8CDEVGender = ({ data, loading }) => {
  console.log('Chart8CDEVGender - Received data:', data);
  console.log('Chart8CDEVGender - Loading state:', loading);
  
  if (loading) {
    return <Typography variant="body1">Loading CDEV gender data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('Chart8CDEVGender - No data or empty array');
    return <Typography variant="body1">No CDEV gender data available</Typography>;
  }

  console.log('Chart8CDEVGender - Rendering chart with data:', data);
  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>Gender Proportion in CDEV Courses</Typography>
      <Typography variant="body2" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
        Gender Proportion in CDEV Courses
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
          barCategoryGap="20%"
        >
          <XAxis 
            dataKey="name" 
            textAnchor="middle"
            height={80}
            interval={0}
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={percentTickFormatter} 
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip formatter={v => `${v}%`} />
          <Legend 
            formatter={(value) => {
              if (value === 'Female') return <span style={{ color: '#e07bb6', fontWeight: 600 }}>Female</span>;
              if (value === 'Male') return <span style={{ color: '#091f92', fontWeight: 600 }}>Male</span>;
              return value;
            }}
          />
          <Bar dataKey="Female" stackId="a" fill="#e07bb6">
            <LabelList dataKey="Female" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
          </Bar>
          <Bar dataKey="Male" stackId="a" fill="#091f92">
            <LabelList dataKey="Male" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart8CDEVGender; 