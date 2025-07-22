import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { Typography } from '@mui/material';

const Chart_Census1 = ({ data = [], loading = false, selectedTerm = '' }) => {
  // 调试信息
  console.log('Chart_Census1 - data:', data, 'loading:', loading, 'selectedTerm:', selectedTerm);

  // 数据预处理：过滤和清理数据
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(item => {
        // 过滤掉male和female drop都为0的项
        const maleDrop = item.male_drop || 0;
        const femaleDrop = item.female_drop || 0;
        return maleDrop > 0 || femaleDrop > 0;
      })
      .sort((a, b) => {
        // 按总drop数降序排序
        const totalA = (a.male_drop || 0) + (a.female_drop || 0);
        const totalB = (b.male_drop || 0) + (b.female_drop || 0);
        return totalB - totalA;
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
              {`${entry.dataKey === 'male_drop' ? 'Male Drop' : 'Female Drop'}: ${entry.value.toLocaleString()}`}
            </div>
          ))}
          <div style={{ fontWeight: 'bold', marginTop: '4px', color: '#666' }}>
            Total Drop: {((payload[0]?.payload?.male_drop || 0) + (payload[0]?.payload?.female_drop || 0)).toLocaleString()}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Census Day Gender Drop Analysis</Typography>
        <div>Loading...</div>
      </div>
    );
  }

  // 处理空数据情况
  if (processedData.length === 0) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Census Day Gender Drop Analysis</Typography>
        <div>No census drop data available for {selectedTerm}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>
        Census Day Gender Drop Analysis {selectedTerm && `- ${selectedTerm}`}
      </Typography>
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
            label={{ value: 'Number of Drops', position: 'insideBottom', offset: -5 }}
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="faculty_descr" 
            width={190}
            fontSize={11}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              const colorMap = {
                'male_drop': { color: '#4169E1', label: 'Male Drop' },
                'female_drop': { color: '#FF69B4', label: 'Female Drop' }
              };
              const config = colorMap[value];
              return config ? <span style={{ color: config.color, fontWeight: 600 }}>{config.label}</span> : value;
            }}
          />
          
          <Bar 
            dataKey="male_drop" 
            fill="#4169E1" 
            name="male_drop"
            stroke="#000080"
            strokeWidth={1}
          >
            <LabelList 
              dataKey="male_drop" 
              position="right" 
              formatter={v => v.toLocaleString()} 
              style={{ fill: '#000', fontWeight: 600, fontSize: '11px' }} 
            />
          </Bar>
          <Bar 
            dataKey="female_drop" 
            fill="#FF69B4" 
            name="female_drop"
            stroke="#DC143C"
            strokeWidth={1}
          >
            <LabelList 
              dataKey="female_drop" 
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

export default Chart_Census1; 