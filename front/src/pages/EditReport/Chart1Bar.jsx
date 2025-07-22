import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const percentTickFormatter = (v) => v >= 100 ? '100%' : `${v}%`;

const Chart1Bar = ({ data }) => (
  <div style={{ width: '100%' }}>
    <Typography variant="h3" gutterBottom>Gender</Typography>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        barCategoryGap="20%"
      >
        <XAxis type="number" domain={[0, 100]} tickFormatter={percentTickFormatter} allowDataOverflow={false} />
        <YAxis type="category" dataKey="name" width={180} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend formatter={(value) => {
          if (value === 'Female') return <span style={{ color: '#e07bb6', fontWeight: 600 }}>Female</span>;
          if (value === 'Male') return <span style={{ color: '#091f92', fontWeight: 600 }}>Male</span>;
          if (value === 'U') return <span style={{ color: '#009ca6', fontWeight: 600 }}>Unspecified</span>;
          return value;
        }} />
        <Bar dataKey="Female" stackId="a" fill="#e07bb6">
          <LabelList dataKey="Female" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="Male" stackId="a" fill="#091f92">
          <LabelList dataKey="Male" position="center" formatter={v => v > 0 && v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="U" stackId="a" fill="#009ca6">
          {/* U的百分比不显示label */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default Chart1Bar; 