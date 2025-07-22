import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const Chart9YoYFaculty = ({ data = [], loading = false }) => {
  // 2024,2025改成自动的

  // 调试信息
  console.log('Chart9YoYFaculty - data:', data, 'loading:', loading);

  // 数据预处理：简化学院名称并过滤有效数据
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(item => {
        // 过滤掉两年数据都为0或缺失的项
        const val2024 = item["2024"] || 0;
        const val2025 = item["2025"] || 0;
        return val2024 > 0 || val2025 > 0;
      })
      .map(item => ({
        ...item,
        // 简化学院名称，移除冗余文字
        name: item.faculty_descr
          ?.replace('Faculty of ', '')
          .replace('UNSW ', '')
          .replace('University of New South Wales ', ''),
        "2024": item["2024"] || 0,
        "2025": item["2025"] || 0
      }))
      .sort((a, b) => {
        // 按2025年数据降序排序
        return (b["2025"] || 0) - (a["2025"] || 0);
      });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          padding: '8px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {label}
          </div>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </div>
          ))}
          {payload.length === 2 && (
            <div style={{ fontWeight: 'bold', marginTop: '4px', color: '#666' }}>
              Change: {payload[1].value > 0 ? 
                ((payload[1].value - payload[0].value) / payload[0].value * 100).toFixed(1) : 'N/A'}%
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Year on Year Enrolment</Typography>
        <div>Loading...</div>
      </div>
    );
  }

  // 处理空数据情况
  if (processedData.length === 0) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Year on Year Enrolment</Typography>
        <div>No YoY enrollment data available</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>Year on Year Enrolment</Typography>
      <ResponsiveContainer width="100%" height={Math.max(400, processedData.length * 50)}>
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 20, right: 80, left: 200, bottom: 20 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            label={{ value: 'No. of Enrollments', position: 'insideBottom', offset: -5 }}
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={190}
            fontSize={11}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              if (value === '2024') return <span style={{ color: '#FFD700', fontWeight: 600 }}>2024</span>;
              if (value === '2025') return <span style={{ color: '#000000', fontWeight: 600 }}>2025</span>;
              return value;
            }} 
          />
          <Bar 
            dataKey="2024" 
            fill="#FFD700" 
            name="2024"
            stroke="#FFA500"
            strokeWidth={1}
          >
            <LabelList 
              dataKey="2024" 
              position="right" 
              formatter={v => v.toLocaleString()} 
              style={{ fill: '#000', fontWeight: 600, fontSize: '11px' }} 
            />
          </Bar>
          <Bar 
            dataKey="2025" 
            fill="#000000" 
            name="2025"
            stroke="#333333"
            strokeWidth={1}
          >
            <LabelList 
              dataKey="2025" 
              position="right" 
              formatter={v => v.toLocaleString()} 
              style={{ fill: '#000', fontWeight: 600, fontSize: '11px' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart9YoYFaculty; 