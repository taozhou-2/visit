import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

  // 动态颜色生成函数
  const getResidencyColor = (residencyType, index) => {
    const colors = ['#1abc9c', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6', '#e67e22'];
  return colors[index % colors.length] || '#95a5a6';
};

const Chart7CDEVResidency = ({ data, residencyTypes, loading }) => {
  if (loading) {
    return <Typography variant="body1">Loading CDEV residency data...</Typography>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Typography variant="body1">No CDEV residency data available</Typography>;
  }

  // 使用从父组件传递的residencyTypes
  if (!residencyTypes || residencyTypes.length === 0) {
    return <Typography variant="body1">No residency categories found</Typography>;
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>CDEV Enrollments by Residency Status and Course</Typography>
      <Typography variant="body2" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
        No. of Students in CDEV Courses by Residency and Course (CDEV courses are all courses with the code CDEVxxxx)
      </Typography>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          margin={{ top: 60, right: 30, left: 40, bottom: 100 }}
          barCategoryGap="20%"
        >
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value) => {
              const index = residencyTypes.indexOf(value);
              const color = getResidencyColor(value, index);
              return <span style={{ color, fontWeight: 600 }}>{value}</span>;
            }}
          />
          <XAxis 
            dataKey="name" 
            angle={0}
            textAnchor="middle"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
            width={120}
          />
          <YAxis label={{ value: 'No. of Students', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value, name) => [value, name]} />
          {residencyTypes.map((residencyType, index) => {
            const color = getResidencyColor(residencyType, index);
            const textColor = '#fff'; // 所有字体颜色改为白色
            const isLast = index === residencyTypes.length - 1;
            
            return (
              <Bar key={residencyType} dataKey={residencyType} stackId="a" fill={color}>
                <LabelList 
                  dataKey={residencyType} 
                  position="center" 
                  formatter={v => v > 0 && v > 2 ? v : ''} 
                  style={{ fill: textColor, fontWeight: 700 }} 
                />
                {isLast && (
                  <LabelList 
                    dataKey="total"
                    position="top" 
                    formatter={(value) => {
                      return value > 0 ? value : '';
                    }}
                    style={{ fill: '#000', fontWeight: 700 }} 
                  />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart7CDEVResidency; 