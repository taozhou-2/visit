import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import EditReport from './pages/EditReport';

const RouterContainer = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/edit-report" element={<EditReport />} />
    </Routes>
  );
};

export default RouterContainer;
