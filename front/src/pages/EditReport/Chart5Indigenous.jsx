import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const percentTickFormatter = (v) => v >= 100 ? '100%' : `${v}%`;

const Chart5Indigenous = ({ data, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading indigenous student data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1">No indigenous student data available</Typography>;
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>Proportion of Indigenous Students in WIL</Typography>
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
            if (value === 'Indigenous') return <span style={{ color: '#e74c3c', fontWeight: 600 }}>Indigenous</span>;
            if (value === 'NonIndigenous') return <span style={{ color: '#2563eb', fontWeight: 600 }}>Non Indigenous</span>;
            return value;
          }} />
          <Bar dataKey="Indigenous" stackId="a" fill="#e74c3c">
            <LabelList dataKey="Indigenous" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
          </Bar>
          <Bar dataKey="NonIndigenous" stackId="a" fill="#2563eb">
            <LabelList dataKey="NonIndigenous" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart5Indigenous; 