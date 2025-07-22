// front/src/helper/Api.jsx
import axios from "axios";

const backendPort = 8088; // Flask 后端端口
const baseURL = `http://localhost:${backendPort}`;

// ===== 文件上传相关 API =====

// 单文件上传（旧版接口）
export const uploadFile = (file, fileType = 2) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_type", fileType);

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 批量文件上传（新版接口）
export const batchUploadFiles = (files, analysisMode) => {
  const formData = new FormData();
  
  // 添加分析模式
  formData.append("analysis_mode", analysisMode);
  
  // 添加文件列表
  files.forEach((file) => {
    formData.append("files", file);
  });
  

  return axios.post(`${baseURL}/batch_upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 智能上传：根据选择的模式自动选择合适的上传方式
export const smartUpload = (reportOptions, files, beforeFiles = [], afterFiles = []) => {
  console.log('Smart upload called with:', { reportOptions, files, beforeFiles, afterFiles });
  
  // 检测分析模式
  const analysisMode = getAnalysisMode(reportOptions);
  console.log('Detected analysis mode:', analysisMode);
  
  let filesToUpload = [];
  
  switch (analysisMode) {
    case 'default':
      // 默认模式：1个文件到CurrentData
      filesToUpload = files.slice(0, 1);
      break;
      
    case 'yoy_comparison':
      // YoY模式：2个文件，第1个到PreviousData，第2个到CurrentData
      filesToUpload = files.slice(0, 2);
      break;
      
    case 'census_day':
      // Census Day模式：2个文件，第1个到BeforeCensusData，第2个到CurrentData
      filesToUpload = [...beforeFiles, ...afterFiles];
      break;
      
    case 'census_yoy':
      // Census + YoY模式：3个文件
      // beforeFiles[0] -> BeforeCensusData
      // beforeFiles[1] -> PreviousData  
      // afterFiles[0] -> CurrentData
      filesToUpload = [...beforeFiles, ...afterFiles];
      break;
      
    default:
      throw new Error(`Unknown analysis mode: ${analysisMode}`);
  }
  
  return batchUploadFiles(filesToUpload, analysisMode);
};

// 分析模式检测函数
export const getAnalysisMode = (reportOptions) => {
  if (reportOptions.census && reportOptions.comparison) {
    return 'census_yoy';
  } else if (reportOptions.census) {
    return 'census_day';
  } else if (reportOptions.comparison) {
    return 'yoy_comparison';
  } else {
    return 'default';
  }
};

// ===== 数据分析相关 API =====

// 获取当前数据的性别参与度分析
export const getParticipationGenderData = () => {
  return axios.get(`${baseURL}/par_gender_agg`);
};

// 获取当前数据的公平性队列分析
export const getEquityCohortData = () => {
  return axios.get(`${baseURL}/equity_cohort_agg`);
};

// 获取当前数据的CDEV分析
export const getCdevData = () => {
  return axios.get(`${baseURL}/cdev_agg`);
};

// 获取YoY对比分析
export const getYoYComparison = () => {
  return axios.get(`${baseURL}/yoy_comparison`);
};

// 获取Census Day对比分析
export const getCensusComparison = () => {
  return axios.get(`${baseURL}/census_comparison`);
};

// 获取Census Day性别drop分析
export const getCensusGenderDrop = (term) => {
  return axios.get(`${baseURL}/census_gender_drop`, {
    params: { term: term }
  });
};

// ===== 通用分析 API =====

// 获取聚合数据（旧版接口）
export const getAggData = (aggType = 1) => {
  return axios.get(`${baseURL}/get_agg`, {
    params: { agg_type: aggType }
  });
};

// 根据分析类型获取当前数据分析结果
export const getCurrentAnalysis = (analysisType) => {
  const endpoints = {
    'gender': '/par_gender_agg',
    'equity': '/equity_cohort_agg', 
    'cdev': '/cdev_agg'
  };
  
  const endpoint = endpoints[analysisType];
  if (!endpoint) {
    throw new Error(`Unknown analysis type: ${analysisType}`);
  }
  
  return axios.get(`${baseURL}${endpoint}`);
};

// ===== 其他服务 API =====

// 发送邮件
export const sendEmail = (emailData) => {
  return axios.post(`${baseURL}/send_email`, emailData);
};

// GPT处理
export const processWithGPT = (data) => {
  return axios.post(`${baseURL}/process-with-gpt`, data);
};

// ===== 调试相关 API =====

// 获取数据库结构信息（调试用）
export const getDataStructure = () => {
  return axios.get(`${baseURL}/debug/data_structure`);
};

// 分析文件列结构（调试用）
export const analyzeFileColumns = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  return axios.post(`${baseURL}/debug/column_mapping`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ===== 文件验证工具函数 =====

// 验证文件类型
export const isValidFileType = (file) => {
  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  return allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
};

// 验证文件数量是否符合分析模式要求
export const validateFileCount = (analysisMode, fileCount) => {
  const requirements = {
    'default': 1,
    'yoy_comparison': 2,
    'census_day': 2,
    'census_yoy': 3
  };
  
  const required = requirements[analysisMode];
  return {
    isValid: fileCount === required,
    required: required,
    actual: fileCount
  };
};

// 获取分析模式的文件要求描述
export const getFileRequirements = (reportOptions) => {
  if (reportOptions.census && reportOptions.comparison) {
    return {
      mode: 'census_yoy',
      description: 'Census Day + Year-over-Year Analysis',
      files: [
        { area: 'before', count: 2, description: 'Before Census Day file + Previous Year file' },
        { area: 'after', count: 1, description: 'Current Year file' }
      ],
      total: 3
    };
  } else if (reportOptions.census) {
    return {
      mode: 'census_day',
      description: 'Census Day Analysis',
      files: [
        { area: 'before', count: 1, description: 'Before Census Day file' },
        { area: 'after', count: 1, description: 'After Census Day file' }
      ],
      total: 2
    };
  } else if (reportOptions.comparison) {
    return {
      mode: 'yoy_comparison',
      description: 'Year-over-Year Analysis',
      files: [
        { area: 'single', count: 2, description: 'Previous Year file + Current Year file' }
      ],
      total: 2
    };
  } else {
    return {
      mode: 'default',
      description: 'Standard Analysis',
      files: [
        { area: 'single', count: 1, description: 'Current data file' }
      ],
      total: 1
    };
  }
};

export default {
  uploadFile,
  batchUploadFiles,
  smartUpload,
  getAnalysisMode,
  getParticipationGenderData,
  getEquityCohortData,
  getCdevData,
  getYoYComparison,
  getCensusComparison,
  getAggData,
  getCurrentAnalysis,
  sendEmail,
  processWithGPT,
  getDataStructure,
  analyzeFileColumns,
  isValidFileType,
  validateFileCount,
  getFileRequirements
};