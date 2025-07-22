import React, { useState, useRef, useEffect, useContext } from 'react';
import Chart1Bar from './Chart1Bar';
import Chart2Donut from './Chart2Donut';
import Chart3FirstGen from './Chart3FirstGen';
import Chart4SES from './Chart4SES';
import Chart5Indigenous from './Chart5Indigenous';
import Chart6Regional from './Chart6Regional';
import Chart7CDEVResidency from './Chart7CDEVResidency';
import Chart8CDEVGender from './Chart8CDEVGender';
import Chart9YoYFaculty from './Chart9YoYFaculty';
import Chart10YoYResidency from './Chart10YoYResidency';
import Chart_Census1 from './Chart_Census1';
import AISummary from './AISummary';
import ChartOptions from './ChartOptions';
import { getParticipationGenderData, getEquityCohortData, getCdevData, getYoYComparison, getCensusGenderDrop } from '../../helper/Api';
import { Box, Typography } from '@mui/material';
import { Context } from '../../context/context';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

// 基础图表（适用于所有分析模式）
const baseCharts = [
  { id: 'gender_participation', title: 'Gender Participation', description: 'Gender participation analysis including faculty breakdown and overview', color: '#6A1B9A' },
  { id: 'wil_participation', title: 'WIL Participation', description: 'WIL participation analysis including first generation, SES, indigenous students, and regional remote', color: '#8E24AA' },
  { id: 'cdev_enrolments', title: 'CDEV Enrolments', description: 'CDEV course enrollments analysis including residency status and gender proportion', color: '#8E24AA' },
];

// YoY对比专用图表
const yoyCharts = [
  { id: 'yoy_comparison', title: 'YoY Comparison', description: 'Year-over-year comparison analysis including faculty breakdown and residency status', color: '#FF6B6B' },
];

// Census Day分析专用图表
const censusCharts = [
  { id: 'chart_census1', title: 'Census Day Drop', description: 'Compare male and female enrollment drops after census day by faculty', color: '#45B7D1' },
];

const EditReport = () => {
  const { getters } = useContext(Context);
  const { analysisMode, selectedTerm } = getters;
  
  // 根据分析模式确定可用的图表
  const getAvailableCharts = () => {
    let availableCharts = [...baseCharts]; // 始终包含基础图表
    
    if (analysisMode === 'yoy_comparison') {
      // YoY对比模式：添加YoY专用图表
      availableCharts = [...availableCharts, ...yoyCharts];
    } else if (analysisMode === 'census_day') {
      // Census Day模式：添加Census专用图表
      availableCharts = [...availableCharts, ...censusCharts];
    } else if (analysisMode === 'census_yoy') {
      // 复合模式：同时添加YoY和Census图表
      availableCharts = [...availableCharts, ...yoyCharts, ...censusCharts];
    }
    
    return availableCharts;
  };

  const charts = getAvailableCharts();
  
  // 根据可用图表动态生成初始chartOptions状态
  const getInitialChartOptions = () => {
    const options = {};
    charts.forEach(chart => {
      options[chart.id] = false;
    });
    return options;
  };

  const [chartOptions, setChartOptions] = useState(getInitialChartOptions());
  const [sendEmail, setSendEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [includeAISummary, setIncludeAISummary] = useState(false);
  const [aiSummaryGenerated, setAiSummaryGenerated] = useState(false);
  const [chart1Data, setChart1Data] = useState([]);
  const [chart2Data, setChart2Data] = useState([]);
  const [chart3Data, setChart3Data] = useState([]);
  const [chart4Data, setChart4Data] = useState([]);
  const [chart5Data, setChart5Data] = useState([]);
  const [chart6Data, setChart6Data] = useState([]);
  const [chart7Data, setChart7Data] = useState([]);
  const [chart7ResidencyTypes, setChart7ResidencyTypes] = useState([]);
  const [chart8Data, setChart8Data] = useState([]);
  const [chart9Data, setChart9Data] = useState([]);
  const [chart10Data, setChart10Data] = useState([]);
  const [chartCensus1Data, setChartCensus1Data] = useState([]);
  const [chart2Loading, setChart2Loading] = useState(false);
  const [equityDataLoading, setEquityDataLoading] = useState(false);
  const [cdevDataLoading, setCdevDataLoading] = useState(false);
  const [yoyDataLoading, setYoyDataLoading] = useState(false);
  const [censusDataLoading, setCensusDataLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const chartRef = useRef();

  // 当分析模式改变时，重新初始化chartOptions
  useEffect(() => {
    const options = {};
    const currentCharts = getAvailableCharts();
    currentCharts.forEach(chart => {
      options[chart.id] = false;
    });
    setChartOptions(options);
  }, [analysisMode]);

  useEffect(() => {
    getParticipationGenderData()
      .then(res => {
        // chart1: 按faculty展示Female和Male百分比
        let chart1 = [];
        let chart2 = [];
        if (res.data && res.data.result) {
          // chart1数据
          const facultyArr = res.data.result["gender proportion in WIL"];
          if (Array.isArray(facultyArr)) {
            chart1 = facultyArr.map(faculty => {
              const f = faculty.gender_counts.F || 0;
              const m = faculty.gender_counts.M || 0;
              const u = faculty.gender_counts.U || 0;
              const total = faculty.total_count || 1;
              return {
                name: faculty.faculty_descr,
                Female: Number(((f / total) * 100).toFixed(2)),
                Male: Number(((m / total) * 100).toFixed(2)),
                U: Number(((u / total) * 100).toFixed(2))
              };
            });
          }
          // chart2数据（原有逻辑）
          const facultyData = res.data.result["gender proportion in WIL"];
          if (Array.isArray(facultyData)) {
            const genderTotals = {};
            facultyData.forEach(faculty => {
              if (faculty && faculty.gender_counts && typeof faculty.gender_counts === 'object') {
                Object.entries(faculty.gender_counts).forEach(([genderKey, count]) => {
                  let genderName = genderKey;
                  switch(genderKey.toUpperCase()) {
                    case 'F': genderName = 'Female'; break;
                    case 'M': genderName = 'Male'; break;
                    case 'U': genderName = 'Unspecified'; break;
                    default: genderName = genderKey;
                  }
                  genderTotals[genderName] = (genderTotals[genderName] || 0) + count;
                });
              }
            });
            chart2 = Object.entries(genderTotals)
              .filter(([gender, count]) => count > 0)
              .map(([gender, count]) => ({ gender, count }))
              .sort((a, b) => {
                // 确保Female在左侧，Male在右侧
                if (a.gender === 'Female' && b.gender === 'Male') return -1;
                if (a.gender === 'Male' && b.gender === 'Female') return 1;
                if (a.gender === 'Female') return -1;
                if (b.gender === 'Female') return 1;
                return b.count - a.count; // 其他按数量排序
              });
          }
        }
        setChart1Data(chart1);
        setChart2Data(chart2);
      })
      .catch(() => {
        setChart1Data([]);
        setChart2Data([]);
      });
  }, []);

  // 获取Equity Cohort数据（Chart3, Chart4, Chart5, Chart6）
  useEffect(() => {
    setEquityDataLoading(true);
    getEquityCohortData()
      .then(res => {
        let chart3 = [];
        let chart4 = [];
        let chart5 = [];
        let chart6 = [];
        

        if (res.data && res.data.result) {
          // Chart3: First Generation数据
          const firstGenData = res.data.result["first generation"];
          if (Array.isArray(firstGenData)) {
            chart3 = firstGenData.map(faculty => {
              const firstGen = faculty["First Generation"] || 0;
              const nonFirstGen = faculty["Non First Generation"] || 0;
              const total = faculty.total || 1;
              return {
                name: faculty.faculty_descr,
                FirstGeneration: Number(((firstGen / total) * 100).toFixed(2)),
                NonFirstGeneration: Number(((nonFirstGen / total) * 100).toFixed(2))
              };
            });
          }

          // Chart4: SES数据
          const sesData = res.data.result["ses"];
          if (Array.isArray(sesData)) {
            chart4 = sesData.map(faculty => {
              const high = faculty.High || 0;
              const low = faculty.Low || 0;
              const medium = faculty.Medium || 0;
              const unknown = faculty.Unknown || 0;
              const total = faculty.total || 1;
              return {
                name: faculty.faculty_descr,
                High: Number(((high / total) * 100).toFixed(2)),
                Low: Number(((low / total) * 100).toFixed(2)),
                Medium: Number(((medium / total) * 100).toFixed(2)),
                Unknown: Number(((unknown / total) * 100).toFixed(2))
              };
            });
          }

          // Chart5: Indigenous数据
          const indigenousData = res.data.result["atsi group"];
          
          if (Array.isArray(indigenousData)) {
            chart5 = indigenousData.map(faculty => {
              const indigenous = faculty["Indigenous"] || 0;
              const nonIndigenous = faculty["Non Indigenous"] || 0;
              const total = faculty.total || 1;
              return {
                name: faculty.faculty_descr,
                Indigenous: Number(((indigenous / total) * 100).toFixed(2)),
                NonIndigenous: Number(((nonIndigenous / total) * 100).toFixed(2))
              };
            });
          }

          // Chart6: Regional Remote数据
          const regionalData = res.data.result["regional remote"];
          if (Array.isArray(regionalData)) {
            chart6 = regionalData.map(region => ({
              regional_remote: region.regional_remote,
              count: region.count
            }));
          }
        }
        
        setChart3Data(chart3);
        setChart4Data(chart4);
        setChart5Data(chart5);
        setChart6Data(chart6);
      })
      .catch(() => {
        setChart3Data([]);
        setChart4Data([]);
        setChart5Data([]);
        setChart6Data([]);
      })
      .finally(() => {
        setEquityDataLoading(false);
      });
  }, []);

  // 获取CDEV数据（Chart7和Chart8）
  useEffect(() => {
    setCdevDataLoading(true);
    getCdevData()
      .then(res => {
        let chart7 = [];
        let chart8 = [];
        
        if (res.data && res.data.result) {
          // Chart7: CDEV Residency数据
          const residencyData = res.data.result["CDEV by Residency and Course"];
          if (Array.isArray(residencyData)) {
            // 首先收集所有可能的residency类别
            const allResidencyTypes = new Set();
            residencyData.forEach(course => {
              if (Array.isArray(course.residency_breakdown)) {
                course.residency_breakdown.forEach(item => {
                  allResidencyTypes.add(item.residency_group_descr);
                });
              }
            });
            
            // 转换数据，动态处理所有residency类别
            chart7 = residencyData.map(course => {
              const courseData = { 
                name: course.course_name || course.course_code,
                total: course.total || 0  // 保留total字段
              };
              
              // 为所有类别初始化为0
              allResidencyTypes.forEach(type => {
                courseData[type] = 0;
              });
              
              // 处理residency_breakdown数据
              if (Array.isArray(course.residency_breakdown)) {
                course.residency_breakdown.forEach(item => {
                  courseData[item.residency_group_descr] = item.count;
                });
              }
              
              return courseData;
            });
            
            // 保存residency类别信息
            setChart7ResidencyTypes(Array.from(allResidencyTypes));
          }

          // Chart8: CDEV Gender数据
          const genderData = res.data.result["CDEV by Gender"];
          console.log('Chart8 - Raw gender data:', genderData);
          if (Array.isArray(genderData)) {
            chart8 = genderData.map(course => {
              const total = course.total || 1;
              const courseData = { name: course.course_code };
              
              // 初始化性别比例为0
              courseData.Female = 0;
              courseData.Male = 0;
              
              // 处理gender_breakdown数据并转换为百分比
              if (Array.isArray(course.gender_breakdown)) {
                course.gender_breakdown.forEach(item => {
                  const percentage = Number(((item.count / total) * 100).toFixed(1));
                  if (item.gender === 'F') {
                    courseData.Female = percentage;
                  } else if (item.gender === 'M') {
                    courseData.Male = percentage;
                  }
                });
              }
              
              console.log('Chart8 - Processed course data:', courseData);
              return courseData;
            });
          }
          console.log('Chart8 - Final processed data:', chart8);
        }
        
        setChart7Data(chart7);
        setChart8Data(chart8);
      })
      .catch(() => {
        setChart7Data([]);
        setChart7ResidencyTypes([]);
        setChart8Data([]);
      })
      .finally(() => {
        setCdevDataLoading(false);
      });
  }, []);

  // 获取YoY数据（Chart9和Chart10）
  useEffect(() => {
    // 只有在YoY模式下才获取数据
    if (analysisMode === 'yoy_comparison' || analysisMode === 'census_yoy') {
      setYoyDataLoading(true);
      getYoYComparison()
        .then(res => {
          let chart9 = [];
          let chart10 = [];
          
          if (res.data && res.data.result && Array.isArray(res.data.result)) {
            // Chart9: 简单的Faculty对比数据
            chart9 = res.data.result.map(item => ({
              faculty_descr: item.faculty_descr,
              "2024": item["2024"] || 0,
              "2025": item["2025"] || 0
            }));

            // Chart10: Faculty + Residency细分数据
            const chart10Data = [];
            res.data.result.forEach(facultyData => {
              if (facultyData.residency_breakdown && facultyData.residency_breakdown.length > 0) {
                facultyData.residency_breakdown.forEach(residencyData => {
                  const residencyLabel = residencyData.residency_group_descr === 'International' ? 'International' : 'Local';
                  chart10Data.push({
                    faculty_residency: `${residencyLabel}\n${facultyData.faculty_descr.replace('Faculty of ', '').replace('UNSW ', '')}`,
                    faculty_full: facultyData.faculty_descr,
                    residency_type: residencyData.residency_group_descr,
                    "2024": residencyData["2024"] || 0,
                    "2025": residencyData["2025"] || 0
                  });
                });
              }
            });

            // 按faculty和residency排序
            chart10Data.sort((a, b) => {
              if (a.faculty_full !== b.faculty_full) {
                return a.faculty_full.localeCompare(b.faculty_full);
              }
              return a.residency_type.localeCompare(b.residency_type);
            });

            chart10 = chart10Data;
          }
          
          setChart9Data(chart9);
          setChart10Data(chart10);
        })
        .catch(() => {
          setChart9Data([]);
          setChart10Data([]);
        })
        .finally(() => {
          setYoyDataLoading(false);
        });
    } else {
      // 非YoY模式下清空数据
      setChart9Data([]);
      setChart10Data([]);
    }
  }, [analysisMode]);

  // 获取Census数据（Chart_census1）
  useEffect(() => {
    // 只有在Census模式下且有selectedTerm时才获取数据
    if ((analysisMode === 'census_day' || analysisMode === 'census_yoy') && selectedTerm) {
      setCensusDataLoading(true);
      getCensusGenderDrop(selectedTerm)
        .then(res => {
          let chartCensus1 = [];
          
          if (res.data && res.data.result && Array.isArray(res.data.result)) {
            // 转换数据格式，参考Chart9的结构
            chartCensus1 = res.data.result.map(faculty => ({
              faculty_descr: faculty.faculty_descr
                ?.replace('Faculty of ', '')
                .replace('UNSW ', '')
                .replace('University of New South Wales ', ''),
              male_drop: faculty.gender_breakdown?.find(g => g.gender === 'M')?.drop_count || 0,
              female_drop: faculty.gender_breakdown?.find(g => g.gender === 'F')?.drop_count || 0,
              total_drop: faculty.total_drop || 0
            }));
          }
          
          setChartCensus1Data(chartCensus1);
        })
        .catch(() => {
          setChartCensus1Data([]);
        })
        .finally(() => {
          setCensusDataLoading(false);
        });
    } else {
      // 非Census模式下清空数据
      setChartCensus1Data([]);
         }
   }, [analysisMode, selectedTerm]);

  // 生成报告函数
  const generateReport = async (sendByEmail = false) => {
    setIsGeneratingReport(true);
    try {
      // 获取所有选中的图表
      const selectedCharts = Object.entries(chartOptions)
        .filter(([chartId, isSelected]) => isSelected)
        .map(([chartId]) => chartId);

      if (selectedCharts.length === 0) {
        alert('Please select at least one chart to generate the report.');
        setIsGeneratingReport(false);
        return;
      }

      // 检查是否有图表正在加载
      const isAnyLoading = chart2Loading || equityDataLoading || cdevDataLoading || yoyDataLoading || censusDataLoading;
      if (isAnyLoading) {
        alert('Please wait for all charts to finish loading before generating the report.');
        setIsGeneratingReport(false);
        return;
      }

      // 创建PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // 添加报告标题
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      let modeTitle = 'WIL Report';
      if (analysisMode === 'yoy_comparison') {
        modeTitle = 'Year-over-Year Comparison Report';
      } else if (analysisMode === 'census_day') {
        modeTitle = `Census Day Analysis Report${selectedTerm ? ` - ${selectedTerm}` : ''}`;
      } else if (analysisMode === 'census_yoy') {
        modeTitle = `Combined Analysis Report${selectedTerm ? ` - ${selectedTerm}` : ''}`;
      }
      pdf.text(modeTitle, margin, margin + 10);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 20);
      let currentY = margin + 35;

      // 只等待一次，确保所有图表都渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. 并发截图所有选中图表
      const chartScreenshotTasks = selectedCharts.map(chartId => {
        // 处理特殊图表ID，找到对应DOM节点
        let chartElements = [];
        if (chartId === 'gender_participation') {
          chartElements = [
            { el: document.querySelector('[data-chart-id="gender_participation_chart1"]'), title: 'Gender Participation - Faculty Breakdown' },
            { el: document.querySelector('[data-chart-id="gender_participation_chart2"]'), title: 'Gender Participation - Overview' }
          ];
        } else if (chartId === 'wil_participation') {
          chartElements = [
            { el: document.querySelector('[data-chart-id="wil_participation_chart3"]'), title: 'WIL Participation - First Generation' },
            { el: document.querySelector('[data-chart-id="wil_participation_chart4"]'), title: 'WIL Participation - SES' },
            { el: document.querySelector('[data-chart-id="wil_participation_chart5"]'), title: 'WIL Participation - Indigenous Students' },
            { el: document.querySelector('[data-chart-id="wil_participation_chart6"]'), title: 'WIL Participation - Regional Remote' }
          ];
        } else if (chartId === 'cdev_enrolments') {
          chartElements = [
            { el: document.querySelector('[data-chart-id="cdev_enrolments_chart7"]'), title: 'CDEV Enrolments - Residency Status' },
            { el: document.querySelector('[data-chart-id="cdev_enrolments_chart8"]'), title: 'CDEV Enrolments - Gender Proportion' }
          ];
        } else if (chartId === 'yoy_comparison') {
          chartElements = [
            { el: document.querySelector('[data-chart-id="yoy_comparison_chart9"]'), title: 'YoY Comparison - Faculty Breakdown' },
            { el: document.querySelector('[data-chart-id="yoy_comparison_chart10"]'), title: 'YoY Comparison - Residency Status' }
          ];
        } else if (chartId === 'chart_census1') {
          chartElements = [
            { el: document.querySelector('[data-chart-id="chart_census1"]'), title: 'Census Day Gender Drop Analysis' }
          ];
        } else {
          // 兜底：按chartId查找
          chartElements = [
            { el: document.querySelector(`[data-chart-id="${chartId}"]`), title: chartId }
          ];
        }
        // 返回每个chartElement的截图Promise
        return chartElements.map(({ el, title }) => {
          if (!el) return Promise.resolve(null);
          // 保存原始样式
          const originalStyle = {
            width: el.style.width,
            height: el.style.height,
            transform: el.style.transform,
            position: el.style.position,
            overflow: el.style.overflow,
            backgroundColor: el.style.backgroundColor
          };
          // 降低分辨率
          const fixedWidth = 1200;
          const fixedHeight = 600;
          el.style.width = `${fixedWidth}px`;
          el.style.height = `${fixedHeight}px`;
          el.style.transform = 'none';
          el.style.position = 'relative';
          el.style.overflow = 'hidden';
          el.style.backgroundColor = '#ffffff';
          // 子元素背景
          const boxEls = el.querySelectorAll('[class*="MuiBox"], [data-testid*="box"]');
          boxEls.forEach(box => { box.style.backgroundColor = '#ffffff'; });
          const svgEls = el.querySelectorAll('svg');
          svgEls.forEach(svg => { svg.style.backgroundColor = '#ffffff'; });
          // 截图
          return html2canvas(el, {
            backgroundColor: '#ffffff',
            scale: 1,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: fixedWidth,
            height: fixedHeight,
            scrollX: 0,
            scrollY: 0,
            removeContainer: true,
            foreignObjectRendering: false
          }).then(canvas => {
            // 恢复原始样式
            Object.keys(originalStyle).forEach(key => {
              if (originalStyle[key]) {
                el.style[key] = originalStyle[key];
              } else {
                el.style.removeProperty(key);
              }
            });
            boxEls.forEach(box => { box.style.removeProperty('background-color'); });
            svgEls.forEach(svg => { svg.style.removeProperty('background-color'); });
            return { canvas, title };
          }).catch(e => {
            // 恢复原始样式
            Object.keys(originalStyle).forEach(key => {
              if (originalStyle[key]) {
                el.style[key] = originalStyle[key];
              } else {
                el.style.removeProperty(key);
              }
            });
            boxEls.forEach(box => { box.style.removeProperty('background-color'); });
            svgEls.forEach(svg => { svg.style.removeProperty('background-color'); });
            return null;
          });
        });
      });
      // 展平成一维数组
      const allScreenshotPromises = chartScreenshotTasks.flat();
      // 并发截图
      const screenshotResults = await Promise.all(allScreenshotPromises);
      // 2. 顺序插入PDF
      for (const result of screenshotResults) {
        if (!result) continue;
        const { canvas, title } = result;
        const imgData = canvas.toDataURL('image/jpeg', 1);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (currentY + imgHeight + 30 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 15;
        pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      }
      // 保存PDF文件名
      const fileName = `WIL_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      if (sendByEmail) {
        // 生成Blob并上传
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        await sendEmailWithPdf(email, pdfFile);
        alert('Successfully sent the report to your email!');
      } else {
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 邮件发送API
  async function sendEmailWithPdf(email, pdfFile) {
    const formData = new FormData();
    formData.append('file_path', pdfFile);
    formData.append('email', email);
    await axios.post('http://localhost:8088/send_email', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // 传递给ChartOptions的生成报告方法
  const handleGenerateReport = () => {
    if (sendEmail) {
      if (!email || !email.trim()) {
        alert('Please enter a valid email address.');
        return;
      }
      generateReport(true);
    } else {
      generateReport(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: '100vh' }}>
      {/* Main Section */}
      <Box sx={{ flex: 1, p: 4, height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="h1" gutterBottom sx={{ mb: 2 }}>
          Report Preview
        </Typography>

        {/* 分析模式信息 */}
        {analysisMode && (
          <Box sx={{ mb: 4, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #bbdefb' }}>
            <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 500 }}>
              Analysis Mode: {analysisMode === 'yoy_comparison' ? 'Year-over-Year Comparison' : 
                              analysisMode === 'census_day' ? 'Census Day Analysis' : 
                              analysisMode === 'census_yoy' ? 'Census Day + YoY Analysis' :
                              'Default Analysis'}
            </Typography>
          </Box>
        )}
        
        <AISummary
          aiSummaryGenerated={aiSummaryGenerated}
          includeAISummary={includeAISummary}
          setIncludeAISummary={setIncludeAISummary}
          setAiSummaryGenerated={setAiSummaryGenerated}
          hasSelectedCharts={Object.values(chartOptions).some(selected => selected)}
        />
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 2 }}>
          <Box ref={chartRef}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* 基础图表 */}
              {chartOptions['gender_participation'] && (
                <>
                  <div data-chart-id="gender_participation_chart1"><Chart1Bar data={chart1Data} /></div>
                  <div data-chart-id="gender_participation_chart2"><Chart2Donut data={chart2Data} loading={chart2Loading} /></div>
                </>
              )}
              {chartOptions['wil_participation'] && (
                <>
                  <div data-chart-id="wil_participation_chart3"><Chart3FirstGen data={chart3Data} loading={equityDataLoading} /></div>
                  <div data-chart-id="wil_participation_chart4"><Chart4SES data={chart4Data} loading={equityDataLoading} /></div>
                  <div data-chart-id="wil_participation_chart5"><Chart5Indigenous data={chart5Data} loading={equityDataLoading} /></div>
                  <div data-chart-id="wil_participation_chart6"><Chart6Regional data={chart6Data} loading={equityDataLoading} /></div>
                </>
              )}
              {chartOptions['cdev_enrolments'] && (
                <>
                  <div data-chart-id="cdev_enrolments_chart7"><Chart7CDEVResidency data={chart7Data} residencyTypes={chart7ResidencyTypes} loading={cdevDataLoading} /></div>
                  <div data-chart-id="cdev_enrolments_chart8"><Chart8CDEVGender data={chart8Data} loading={cdevDataLoading} /></div>
                </>
              )}
              
              {/* YoY对比图表 */}
              {chartOptions['yoy_comparison'] && (
                <>
                  <div data-chart-id="yoy_comparison_chart9"><Chart9YoYFaculty data={chart9Data} loading={yoyDataLoading} /></div>
                  <div data-chart-id="yoy_comparison_chart10"><Chart10YoYResidency data={chart10Data} loading={yoyDataLoading} /></div>
                </>
              )}

              {/* Census Day图表 */}
              {chartOptions['chart_census1'] && <div data-chart-id="chart_census1"><Chart_Census1 data={chartCensus1Data} loading={censusDataLoading} selectedTerm={selectedTerm} /></div>}

            </Box>
          </Box>
        </Box>
      </Box>
      {/* Side Section */}
      <ChartOptions
        charts={charts}
        chartOptions={chartOptions}
        setChartOptions={setChartOptions}
        sendEmail={sendEmail}
        setSendEmail={setSendEmail}
        email={email}
        setEmail={setEmail}
        generateReport={handleGenerateReport}
        isGeneratingReport={isGeneratingReport}
      />
    </Box>
  );
};

export default EditReport; 