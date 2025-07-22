import React from 'react';

// 初始状态
export const initialValue = {
  token: null,
  user: null,
  counter: 0,
  analysisMode: null, // 新增：记录分析模式 ('comparison', 'census', 'default', etc.)
  selectedTerm: null // 新增：记录选择的term ('term1', 'term2', 'term3', etc.)
};

// 创建 Context
export const Context = React.createContext({
  getters: initialValue,
  setters: {
    setToken: () => {},
    setUser: () => {},
    setCounter: () => {},
    setAnalysisMode: () => {}, // 新增：设置分析模式的方法
    setSelectedTerm: () => {} // 新增：设置选择term的方法
  }
});

// 创建一个 Provider 组件
export const ContextProvider = ({ children }) => {
  const [token, setToken] = React.useState(initialValue.token);
  const [user, setUser] = React.useState(initialValue.user);
  const [counter, setCounter] = React.useState(initialValue.counter);
  const [analysisMode, setAnalysisMode] = React.useState(initialValue.analysisMode);
  const [selectedTerm, setSelectedTerm] = React.useState(initialValue.selectedTerm);

  const getters = { token, user, counter, analysisMode, selectedTerm };
  const setters = { setToken, setUser, setCounter, setAnalysisMode, setSelectedTerm };

  return (
    <Context.Provider value={{ getters, setters }}>
      {children}
    </Context.Provider>
  );
}; 