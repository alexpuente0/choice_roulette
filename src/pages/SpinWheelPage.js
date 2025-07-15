import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptions } from '../context/OptionsContext';
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const SpinWheelPage = () => {
  const { options, loading, error: contextError } = useOptions();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [selectionAngle, setSelectionAngle] = useState(270); // 270 degrees is the selection point
  const [error, setError] = useState('');
  const wheelRef = useRef(null);
  const spinTimeout = useRef(null);
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

  const spinWheel = useCallback(() => {
    if (options.length < 2 || isSpinning || loading) return;
    
    setIsSpinning(true);
    setWinner(null);
    setError('');
    
    try {
      // Random rotation between 5-10 full rotations + a random segment
      const spinDegrees = 1800 + Math.floor(Math.random() * 1800);
      const segmentAngle = options.length > 0 ? 360 / options.length : 0;
      
      // Calculate the winning segment (90 degrees is up, so we add 90 to the rotation)
      const normalizedRotation = (rotation + spinDegrees - 39) % 360;
      // Convert to 0-360 range if negative
      const positiveRotation = normalizedRotation < 0 ? normalizedRotation + 360 : normalizedRotation;
      const winningSegment = Math.floor(positiveRotation / segmentAngle);
      const winnerIndex = (options.length - 1 - (winningSegment % options.length)) % options.length;
      
      // Update rotation with animation
      setRotation(prev => prev + spinDegrees);
      
      // Update selection angle
      setSelectionAngle(270); // Always point to the right (90 degrees) where selection is made


      // Set the winner after the spin animation completes
      spinTimeout.current = setTimeout(() => {
        setWinner(options[winnerIndex]);
        setIsSpinning(false);
      }, 5000); // Match this with the CSS transition duration
    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError('Failed to spin the wheel. Please try again.');
      setIsSpinning(false);
    }
  }, [options, isSpinning, loading, rotation]);

  useEffect(() => {
    return () => {
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
    };
  }, []);

  // Generate segments for the wheel
  const renderWheelSegments = () => {
    if (options.length === 0 || loading) return null;
    
    const segmentAngle = 360 / options.length;
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-indigo-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500',
      'from-orange-500 to-red-500',
    ];

    return options.map((option, index) => {
      const rotation = index * segmentAngle;
      const skew = 90 - segmentAngle;
      const colorClass = colors[index % colors.length];
      
      return (
        <div
          key={option.id || index}
          className="absolute w-1/2 h-1/2 origin-bottom-right"
          style={{
            transform: `rotate(${rotation}deg) skewY(${skew}deg)`,
            pointerEvents: 'none',
          }}
        >
          <div className={`absolute w-full h-full bg-gradient-to-br ${colorClass} opacity-90`}>
            <div 
              className="absolute left-1/2 top-1/2 w-1/2 h-1/2 -translate-y-1/2 -translate-x-1/2 transform origin-left"
              style={{
                transform: `rotate(${segmentAngle / 2}deg)`,
                textShadow: '0 0 2px rgba(0,0,0,0.5)',
              }}
            >
              <div 
                className="absolute font-medium text-white"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                  transformOrigin: 'center',
                  width: '80%',
                  height: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: '0 0 3px rgba(0,0,0,0.8)',
                  overflow: 'hidden',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  padding: '5px',
                  maxWidth: '100%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {option.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-300">Loading options...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">No Options Added Yet</h1>
          <p className="text-gray-300 mb-6">
            Add some options first to create your wheel of choices.
          </p>
          <button
            onClick={() => navigate('/add-options')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Add Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-200px)] p-4 w-full">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Spin the Wheel</h1>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
        
        <div className="relative w-full max-w-md mx-auto mb-8">
          {/* Wheel Container */}
          <div 
            ref={wheelRef}
            className="relative w-full aspect-square rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-xl transition-transform duration-5000 ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {renderWheelSegments()}
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 bg-white rounded-full z-10 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          
          {/* Selection Point Pointer (Yellow) - Points to the right (90 degrees) where selection is made */}
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-1 origin-left z-20 pointer-events-none"
            style={{
              transform: `rotate(${selectionAngle}deg)`
            }}
          >
            <div className="w-1/2 h-1 bg-yellow-500 rounded-full absolute right-0 top-1/2 -translate-y-1/2"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"></div>
          </div>

          {/* Main Pointer */}
          <div className="absolute -top-4 left-1/2 -mr-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white transform -translate-x-1/2 z-30"></div>
        </div>

        {/* Winner Display */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-2">Winner!</h2>
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  {winner?.name || 'No winner selected'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={spinWheel}
            disabled={isSpinning || options.length < 2 || loading}
            className={`flex-1 max-w-xs mx-auto py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isSpinning || options.length < 2 || loading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isSpinning || loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                {isSpinning ? 'Spinning...' : 'Loading...'}
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-5 h-5" />
                Spin the Wheel
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/add-options')}
            disabled={loading}
            className="flex-1 max-w-xs mx-auto py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {loading ? 'Loading...' : 'Edit Options'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPage;
