import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptions } from '../context/OptionsContext';
import { ArrowPathIcon, PlusIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';

const AddOptionsPage = () => {
  const [newOption, setNewOption] = useState('');
  const { 
    options, 
    addOption, 
    removeOption, 
    clearOptions, 
    loading, 
    error: contextError 
  } = useOptions();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle errors from context
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const added = await addOption(newOption);
      if (added) {
        setNewOption('');
      } else {
        setError('This option already exists');
      }
    } catch (err) {
      setError('Failed to add option. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveOption = async (id) => {
    try {
      await removeOption(id);
    } catch (err) {
      setError('Failed to remove option. Please try again.');
    }
  };
  
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all options?')) {
      try {
        await clearOptions();
      } catch (err) {
        setError('Failed to clear options. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-200px)] p-4 w-full">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Add Your Options</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Enter an option..."
              disabled={loading}
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        )}
        
        {/* Go to Spin Wheel Button */}
        {options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
          </motion.div>
        )}

        {options.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Your Options ({options.length})</h2>
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <XMarkIcon className="w-4 h-4" />
                )}
                {loading ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              <AnimatePresence>
                {options.map((option) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group"
                  >
                    <span className="text-gray-200">{option.name}</span>
                    <button
                      onClick={() => handleRemoveOption(option.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove option"
                      disabled={loading}
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <XMarkIcon className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <a
                href="/spin-wheel"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Spin the Wheel <ArrowRightIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOptionsPage;
