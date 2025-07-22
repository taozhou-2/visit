import React, { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  smartUpload, 
  getAnalysisMode,
  getFileRequirements,
  isValidFileType 
} from '../../helper/Api';
import { Context } from '../../context/context';
import UploadArea from './UploadArea';
import SingleUploadArea from './SingleUploadArea';
import ReportOptions from './ReportOptions';
import UploadHeader from './UploadHeader';

const Upload = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setters } = useContext(Context);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    census: false,
    comparison: false,
  });
  const [oldFiles, setOldFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isDraggingOld, setIsDraggingOld] = useState(false);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const handleReportOptionChange = (option) => {
    setReportOptions(prev => {
      const newOptions = {
        ...prev,
        [option]: !prev[option]
      };
      
      // 切换模式时清空文件列表，避免混乱
      if (option === 'census') {
        if (!prev.census) {
          // 切换到census模式，清空单上传区文件
          setFiles([]);
        } else {
          // 取消census模式，清空双上传区文件和term选择
          setOldFiles([]);
          setNewFiles([]);
          setSelectedTerm(null);
        }
      }
      
      if (option === 'comparison') {
        if (!prev.comparison) {
          // 切换到comparison模式时清空文件，准备接收多个文件
          setFiles([]);
        }
      }
      
      // 清空上传结果状态
      setUploadResult(null);
      
      return newOptions;
    });
  };

  const handleTermSelect = (termKey) => {
    setSelectedTerm(termKey);
  };

  const handleGenerateReport = async () => {
    // 验证文件数量和term选择
    if (reportOptions.census) {
      const requirements = getFileRequirements(reportOptions);
      const requiredOldFiles = requirements.files.find(f => f.area === 'before')?.count || 1;
      const requiredNewFiles = requirements.files.find(f => f.area === 'after')?.count || 1;
      
      if (oldFiles.length < requiredOldFiles || newFiles.length < requiredNewFiles) {
        const message = `${requirements.description} requires ${requiredOldFiles} file${requiredOldFiles > 1 ? 's' : ''} before and ${requiredNewFiles} file${requiredNewFiles > 1 ? 's' : ''} after census day`;
        setUploadResult({ success: false, error: message });
        return;
      }
      
      if (!selectedTerm) {
        setUploadResult({ 
          success: false, 
          error: 'Please select a term for census day analysis' 
        });
        return;
      }
    } else {
      const requirements = getFileRequirements(reportOptions);
      if (files.length < requirements.total) {
        setUploadResult({ 
          success: false, 
          error: `${requirements.description} requires ${requirements.total} file${requirements.total > 1 ? 's' : ''}` 
        });
        return;
      }
    }

    setUploading(true);
    setUploadResult(null);
    
    try {
      // 使用智能上传函数，自动根据模式选择合适的后端接口
      console.log('🚀 Starting upload with:', {
        reportOptions,
        selectedTerm,
        files: files.map(f => f.name),
        oldFiles: oldFiles.map(f => f.name),
        newFiles: newFiles.map(f => f.name)
      });
      
      const response = await smartUpload(reportOptions, files, oldFiles, newFiles);
      
      console.log('✅ Upload successful:', response.data);
      
      const currentAnalysisMode = getAnalysisMode(reportOptions);
      
      // 设置分析模式和选择的term到全局状态
      setters.setAnalysisMode(currentAnalysisMode);
      if (selectedTerm) {
        setters.setSelectedTerm(selectedTerm);
      }
      
      setUploadResult({ 
        success: true, 
        data: response.data,
        analysisMode: currentAnalysisMode
      });
      
      // 直接跳转到分析页面
      navigate('/edit-report', { 
        state: { 
          analysisMode: currentAnalysisMode,
          selectedTerm: selectedTerm,
          tablesUpdated: response.data.result?.tables_updated || [],
          uploadSuccess: true,
          reportOptions: reportOptions
        }
      });
      
    } catch (err) {
      console.error('❌ Upload failed:', err);
      console.error('Error details:', {
        response: err?.response?.data,
        message: err.message,
        status: err?.response?.status
      });
      
      setUploadResult({ 
        success: false, 
        error: err?.response?.data?.message || err.message 
      });
    }
    setUploading(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)` }}>
      {/* Main Section */}
      <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', maxWidth: '70%', mx: 'auto', width: '100%', background: 'rgba(245,245,245,0.92)', borderRadius: 4, boxShadow: 3 }}>
        <UploadHeader theme={theme} />
        
        {/* Census Day Drop双上传区 */}
        {reportOptions.census ? (
          <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            <UploadArea
              title="Data before Census Day"
              files={oldFiles}
              setFiles={setOldFiles}
              isDragging={isDraggingOld}
              setIsDragging={setIsDraggingOld}
              theme={theme}
              reportOptions={reportOptions}
              setUploadResult={setUploadResult}
            />
            <UploadArea
              title="Data after Census Day"
              files={newFiles}
              setFiles={setNewFiles}
              isDragging={isDraggingNew}
              setIsDragging={setIsDraggingNew}
              theme={theme}
              reportOptions={reportOptions}
              setUploadResult={setUploadResult}
            />
          </Box>
        ) : (
          // 原有单上传区
          <SingleUploadArea
            files={files}
            setFiles={setFiles}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            theme={theme}
            reportOptions={reportOptions}
            setUploadResult={setUploadResult}
          />
        )}
      </Box>

      {/* Side Section */}
      <ReportOptions
        theme={theme}
        reportOptions={reportOptions}
        handleReportOptionChange={handleReportOptionChange}
        handleGenerateReport={handleGenerateReport}
        uploading={uploading}
        uploadResult={uploadResult}
        files={files}
        oldFiles={oldFiles}
        newFiles={newFiles}
        selectedTerm={selectedTerm}
        onTermSelect={handleTermSelect}
      />
    </Box>
  );
};

export default Upload; 