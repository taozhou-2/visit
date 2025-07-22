import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const percentTickFormatter = (v) => v >= 100 ? '100%' : `${v}%`;

const Chart4SES = ({ data, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading SES participation data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1">No SES participation data available</Typography>;
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>WIL Participation by SES</Typography>
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
          if (value === 'High') return <span style={{ color: '#f1c40f', fontWeight: 600 }}>High</span>;
          if (value === 'Low') return <span style={{ color: '#e74c3c', fontWeight: 600 }}>Low</span>;
          if (value === 'Medium') return <span style={{ color: '#27ae60', fontWeight: 600 }}>Medium</span>;
          if (value === 'Unknown') return <span style={{ color: '#95a5a6', fontWeight: 600 }}>Unknown</span>;
          return value;
        }} />
        <Bar dataKey="High" stackId="a" fill="#f1c40f">
          <LabelList dataKey="High" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#000', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="Low" stackId="a" fill="#e74c3c">
          <LabelList dataKey="Low" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="Medium" stackId="a" fill="#27ae60">
          <LabelList dataKey="Medium" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="Unknown" stackId="a" fill="#95a5a6">
          <LabelList dataKey="Unknown" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
  );
};

export default Chart4SES; 