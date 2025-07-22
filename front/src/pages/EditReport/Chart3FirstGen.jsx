import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const percentTickFormatter = (v) => v >= 100 ? '100%' : `${v}%`;

const Chart3FirstGen = ({ data, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading first generation data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1">No first generation data available</Typography>;
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>Proportion of First Generation in WIL</Typography>
      <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 180, bottom: 20 }}
        barCategoryGap="20%"
      >
        <XAxis type="number" domain={[0, 100]} tickFormatter={percentTickFormatter} allowDataOverflow={false} />
        <YAxis type="category" dataKey="name" width={180} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend formatter={(value) => {
          if (value === 'FirstGeneration') return <span style={{ color: '#e74c3c', fontWeight: 600 }}>First Generation</span>;
          if (value === 'NonFirstGeneration') return <span style={{ color: '#2563eb', fontWeight: 600 }}>Non First Generation</span>;
          return value;
        }} />
        <Bar dataKey="FirstGeneration" stackId="a" fill="#e74c3c">
          <LabelList dataKey="FirstGeneration" position="center" formatter={v => v > 0 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="NonFirstGeneration" stackId="a" fill="#2563eb">
          <LabelList dataKey="NonFirstGeneration" position="center" formatter={v => v > 0 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
  );
};

export default Chart3FirstGen; 