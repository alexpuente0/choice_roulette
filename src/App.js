import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AddOptionsPage from './pages/AddOptionsPage';
import SpinWheelPage from './pages/SpinWheelPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <Routes>
              <Route path="/add-options" element={<AddOptionsPage />} />
              <Route path="/spin-wheel" element={<SpinWheelPage />} />
              <Route path="/" element={<Navigate to="/add-options" replace />} />
              <Route path="*" element={<Navigate to="/add-options" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
