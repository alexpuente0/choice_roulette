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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
            Choice Roulette
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">Add your options below and let the wheel decide for you!</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleAddOption}>
            <div className="flex flex-col space-y-3">
              <div>
                <label htmlFor="option" className="block text-sm font-medium text-gray-700 mb-1">
                  Add an option
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    ref={inputRef}
                    type="text"
                    id="option"
                    className="input flex-1 min-w-0 block w-full px-4 py-3 text-base rounded-r-none focus:z-10"
                    placeholder="Enter an option..."
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newOption.trim() || isSubmitting}
                    className="btn btn-primary inline-flex items-center px-4 rounded-l-none"
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
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

        <div className="card mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Options</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {options.length} {options.length === 1 ? 'option' : 'options'}
            </span>
          </div>
          
          {options.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            type="button"
            onClick={handleSpinWheel}
            disabled={options.length < 2}
            className={`btn btn-primary inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              options.length < 2 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
            }`}
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Spin the Wheel
          </button>
          
          {options.length === 1 && (
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <p className="text-sm text-gray-500">Add at least 2 options to spin the wheel</p>
            </div>
          )}
            className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-300 ${
              options.length >= 2
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 hover:scale-105 hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50'
};

export default AddOptionsPage;
