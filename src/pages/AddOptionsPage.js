import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { optionsCollection } from '../firebase';
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AddOptionsPage = () => {
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch options from Firestore in real-time
  useEffect(() => {
    console.log('Setting up Firestore listener...');
    setLoading(true);
    const q = query(optionsCollection, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log('Received Firestore update');
        const optionsData = [];
        querySnapshot.forEach((doc) => {
          console.log('Processing document:', doc.id, doc.data());
          optionsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log('Setting options state:', optionsData);
        setOptions(optionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error in Firestore listener:', {
          code: error.code,
          message: error.message,
          details: error.details,
          stack: error.stack
        });
        setError('Failed to load options. Please refresh the page.');
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, []);

  const handleAddOption = async (e) => {
    e.preventDefault();
    console.log('handleAddOption called with:', newOption);
    if (!newOption.trim() || isSubmitting) {
      console.log('Skipping - empty option or already submitting');
      return;
    }

    try {
      console.log('Starting to add option...');
      setIsSubmitting(true);
      setError('');
      
      const newOptionData = {
        name: newOption.trim(),
        timestamp: serverTimestamp()
      };
      
      console.log('Attempting to add document with data:', newOptionData);
      const docRef = await addDoc(optionsCollection, newOptionData);
      console.log('Document added with ID:', docRef.id);
      
      setNewOption('');
      inputRef.current?.focus();
      console.log('Option added successfully');
    } catch (error) {
      console.error('Error adding option:', {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
      });
      setError('Failed to add option. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOption = async (id) => {
    try {
      console.log('Attempting to remove option with ID:', id);
      setError('');
      await deleteDoc(doc(optionsCollection, id));
      console.log('Successfully removed option with ID:', id);
    } catch (error) {
      console.error('Error removing option:', {
        id,
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
      });
      setError('Failed to remove option. Please try again.');
    }
  };

  const handleSpinWheel = () => {
    const validOptions = options.map(option => option.name);
    if (validOptions.length > 0) {
      navigate('/spin-wheel', { state: { options: validOptions } });
    } else {
      setError('Please add at least one option');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center glass p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-200">
            Choice Roulette
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-lg">Add your options below and let the wheel decide for you!</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-2xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleAddOption}>
            <div className="flex flex-col space-y-3">
              <div>
                <label htmlFor="option" className="block text-sm font-medium text-slate-300 mb-2">
                  Add an option
                </label>
                <div className="flex rounded-lg shadow-sm bg-slate-800/50 border border-slate-700/50 focus-within:border-violet-500/50 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    id="option"
                    className="flex-1 min-w-0 block w-full px-4 py-3 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 border-0"
                    placeholder="Enter an option..."
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newOption.trim() || isSubmitting}
                    className={`inline-flex items-center px-6 py-3 border-l border-slate-700/50 text-sm font-medium rounded-r-md transition-all duration-200 ${
                      !newOption.trim() || isSubmitting
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="glass p-6 rounded-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200">Your Options</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-900/50 text-violet-300 border border-violet-800/50">
              {options.length} {options.length === 1 ? 'option' : 'options'}
            </span>
          </div>
          
          {options.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-14 w-14 text-violet-500/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-200">No options yet</h3>
              <p className="mt-1 text-slate-400">Add your first option to get started!</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700/50">
              {options.map((option, index) => (
                <li key={option.id} className="py-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-900/50 text-violet-300 text-xs font-bold mr-3">
                        {index + 1}
                      </span>
                      <p className="text-slate-200 font-medium">{option.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="ml-4 p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={handleSpinWheel}
            disabled={options.length < 2}
            className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-300 ${
              options.length >= 2
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 hover:scale-105 hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            {options.length >= 2 ? 'Spin the Wheel! 🎡' : 'Add 2+ options to spin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOptionsPage;
