import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell } from 'recharts';
import { Typography } from '@mui/material';

const Chart10YoYResidency = ({ data = [], loading = false }) => {

  // 重新组织数据以支持真正的分组条形图
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // 按Faculty分组数据
    const facultyGroups = {};
    
    data.forEach(item => {
      const facultyName = item.faculty_full
        ?.replace('Faculty of ', '')
        .replace('UNSW ', '')
        .replace('University of New South Wales ', '');
      
      if (!facultyGroups[facultyName]) {
        facultyGroups[facultyName] = {
          faculty: facultyName,
          international: { "2024": 0, "2025": 0 },
          local: { "2024": 0, "2025": 0 }
        };
      }

      const isInternational = item.residency_type === 'International';
      const group = isInternational ? 'international' : 'local';
      
      facultyGroups[facultyName][group]["2024"] = item["2024"] || 0;
      facultyGroups[facultyName][group]["2025"] = item["2025"] || 0;
    });

    // 转换为适合BarChart的数据格式
    const result = [];
    
    Object.values(facultyGroups)
      .filter(faculty => {
        const total = faculty.international["2024"] + faculty.international["2025"] + 
                     faculty.local["2024"] + faculty.local["2025"];
        return total > 0;
      })
      .sort((a, b) => {
        const totalA = a.international["2025"] + a.local["2025"];
        const totalB = b.international["2025"] + b.local["2025"];
        return totalB - totalA;
      })
      .forEach(faculty => {
        // 为每个faculty创建两行数据：International和Local
        result.push({
          faculty: faculty.faculty,
          type: 'International',
          group: `${faculty.faculty}_International`,
          "2024": faculty.international["2024"],
          "2025": faculty.international["2025"]
        });
        
        result.push({
          faculty: faculty.faculty,
          type: 'Local', 
          group: `${faculty.faculty}_Local`,
          "2024": faculty.local["2024"],
          "2025": faculty.local["2025"]
        });
      });

    return result;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // 从label中提取faculty和type信息
      const [faculty, type] = label.split('_');
      
      return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          padding: '8px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {faculty} - {type}
          </div>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // 文本换行辅助函数
  const wrapText = (text, maxLength = 12) => {
    if (text.length <= maxLength) return [text];
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // 自定义X轴标签渲染
  const renderCustomXAxisLabel = (props) => {
    const { x, y, payload } = props;
    const [faculty, type] = payload.value.split('_');
    const facultyLines = wrapText(faculty, 12);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#666" 
          fontSize="10"
        >
          {type}
        </text>
        {/* 只在International时显示faculty名称 */}
        {type === 'International' && facultyLines.map((line, index) => (
          <text 
            key={index}
            x={30} 
            y={32 + (index * 12)} 
            textAnchor="middle" 
            fill="#333" 
            fontSize="10"
            fontWeight="600"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  if (loading) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Year on Year Comparison by Faculty and Residency Status</Typography>
        <div>Loading...</div>
      </div>
    );
  }

  // 处理空数据情况
  if (processedData.length === 0) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h3" gutterBottom>Year on Year Comparison by Faculty and Residency Status</Typography>
        <div>No YoY residency comparison data available</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="h3" gutterBottom>Year on Year Comparison by Faculty and Residency Status</Typography>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={processedData}
          margin={{ top: 60, right: 30, left: 40, bottom: 120 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="group" 
            tick={renderCustomXAxisLabel}
            interval={0}
            fontSize={10}
          />
          <YAxis 
            label={{ value: 'No. of Enrollments', angle: -90, position: 'insideLeft' }}
            fontSize={12}
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
              position="top" 
              formatter={v => v > 0 ? v.toLocaleString() : ''} 
              style={{ fill: '#000', fontWeight: 600, fontSize: '10px' }} 
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
              position="top" 
              formatter={v => v > 0 ? v.toLocaleString() : ''} 
              style={{ fill: '#000', fontWeight: 600, fontSize: '10px' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart10YoYResidency; 