import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddOptionsPage from './pages/AddOptionsPage';
import SpinWheelPage from './pages/SpinWheelPage';
import { ArrowPathIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { OptionsProvider } from './context/OptionsContext';
import './index.css';

const NavLink = ({ to, children, icon: Icon, currentPath }) => {
  const isActive = currentPath === to;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <a
        href={to}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
          isActive
            ? 'bg-purple-600/20 text-purple-400'
            : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
        <span className="font-medium">{children}</span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
            initial={false}
            transition={{
              type: 'spring',
              bounce: 0.2,
              duration: 0.6
            }}
          />
        )}
      </a>
    </motion.div>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
  
        {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Choice Roulette. Made with ❤️</p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <OptionsProvider>
      <Router>
        <AppLayout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/add-options" element={<AddOptionsPage />} />
              <Route path="/spin-wheel" element={<SpinWheelPage />} />
              <Route path="/" element={<Navigate to="/add-options" replace />} />
            </Routes>
          </AnimatePresence>
        </AppLayout>
      </Router>
    </OptionsProvider>
  );
}

export default App;
