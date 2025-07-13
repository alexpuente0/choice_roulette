import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const SpinWheelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [rotation, setRotation] = useState(0);
  // Removed unused state variables
  // const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef(null);
  const spinTimeout = useRef(null);
  const spinInterval = useRef(null);

  // Generate colors for the wheel segments with purple/violet theme
  const colors = [
    'rgba(139, 92, 246, 0.9)', 'rgba(124, 58, 237, 0.9)', 'rgba(109, 40, 217, 0.9)',
    'rgba(91, 33, 182, 0.9)', 'rgba(76, 29, 149, 0.9)',
    'rgba(167, 139, 250, 0.9)', 'rgba(196, 181, 253, 0.9)',
    'rgba(221, 214, 254, 0.9)', 'rgba(237, 233, 254, 0.9)',
    'rgba(245, 243, 255, 0.9)'
  ];

  // Get options from location state or redirect if none provided
  useEffect(() => {
    if (location.state?.options) {
      setOptions(location.state.options);
    } else {
      navigate('/add-options');
    }
    
    return () => {
      const currentSpinInterval = spinInterval.current;
      const currentSpinTimeout = spinTimeout.current;
      
      if (currentSpinInterval) clearInterval(currentSpinInterval);
      if (currentSpinTimeout) clearTimeout(currentSpinTimeout);
    };
  }, [location.state, navigate]);

  // Calculate the angle for each option on the wheel
  const getWheelSections = useCallback(() => {
    const totalOptions = options.length;
    if (totalOptions === 0) return [];
    
    const anglePerSection = 360 / totalOptions;
    return options.map((option, index) => {
      const startAngle = index * anglePerSection;
      const endAngle = (index + 1) * anglePerSection;
      const color = colors[index % colors.length];
      
      return {
        option,
        startAngle,
        endAngle,
        color,
        textRotation: startAngle + anglePerSection / 2 // Center text in the segment
      };
    });
  }, [options, colors]);

  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;
    
    setIsSpinning(true);
    setSelectedOption(null);
    
    // Random number of full rotations (5-10) plus a random segment
    const spinDuration = 5000; // 5 seconds
    const spinRotations = 5 + Math.floor(Math.random() * 6);
    const selectedIndex = Math.floor(Math.random() * options.length);
    const anglePerSection = 360 / options.length;
    const finalRotation = 360 * spinRotations + (360 - (anglePerSection * selectedIndex) - (anglePerSection / 2));
    
    // Start spinning animation
    let startRotation = rotation % 360;
    const startTime = Date.now();
    
    // Easing function for smooth deceleration
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Apply easing to the progress
      const easedProgress = easeOutQuart(progress);
      
      // Calculate current rotation with easing
      const currentRotation = startRotation + (finalRotation * easedProgress);
      setRotation(currentRotation);
      
      // Update selected option during spin (optional visual effect)
      if (progress < 0.98) { // Don't update in the last 2%
        const currentAngle = (currentRotation + 90) % 360; // Convert to 0-360 range
        const segmentIndex = Math.floor((currentAngle % 360) / anglePerSection);
        const currentOption = options[options.length - 1 - (segmentIndex % options.length)];
        setSelectedOption(currentOption);
      } else {
        setSelectedOption(options[selectedIndex]);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Finalize
        setRotation(startRotation + finalRotation);
        setSelectedOption(options[selectedIndex]);
        setIsSpinning(false);
      }
    };
    
    animate();
  };

  // Calculate SVG path for each segment
  const getSegmentPath = (startAngle, endAngle, radius = 150) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180; // Start from top
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = 150 + Math.cos(startRad) * radius;
    const y1 = 150 + Math.sin(startRad) * radius;
    const x2 = 150 + Math.cos(endRad) * radius;
    const y2 = 150 + Math.sin(endRad) * radius;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  // Calculate text position on the wheel
  const getTextPosition = (angle, radius = 100) => {
    const rad = ((angle - 90) * Math.PI) / 180; // Convert to radians and adjust to start from top
    const x = 150 + Math.cos(rad) * radius;
    const y = 150 + Math.sin(rad) * radius;
    return { x, y };
  };

  const wheelSections = getWheelSections();
  const canSpin = options.length >= 2 && !isSpinning;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/add-options')}
            className="flex items-center text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Options
          </button>
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-200">
            Spin the Wheel!
          </h1>
          <div className="w-24"></div> {/* For balance */}
        </div>

        <div className="relative w-full aspect-square max-w-2xl mx-auto mb-12">
          {/* Wheel Container */}
          <div 
            ref={wheelRef}
            className="w-full h-full relative transition-transform duration-100"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'transform 0.3s ease-out'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 300 300" className="drop-shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              {/* Wheel segments */}
              {wheelSections.map((section, index) => (
                <g key={index}>
                  <path 
                    d={getSegmentPath(section.startAngle, section.endAngle, 140)}
                    fill={section.color}
                    stroke="rgba(30, 41, 59, 0.7)"
                    strokeWidth="1"
                    className="transition-all duration-300 hover:opacity-90"
                  />
                  {/* Text */}
                  {section.option && (
                    <text
                      x={getTextPosition(section.textRotation, 80).x}
                      y={getTextPosition(section.textRotation, 80).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="500"
                      transform={`rotate(${section.textRotation + 90}, ${getTextPosition(section.textRotation, 80).x}, ${getTextPosition(section.textRotation, 80).y})`}
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {section.option.length > 12 ? 
                        `${section.option.substring(0, 10)}...` : 
                        section.option}
                    </text>
                  )}
                </g>
              ))}
              
              {/* Center circle */}
              <circle 
                cx="150" 
                cy="150" 
                r="25" 
                fill="rgb(15, 23, 42)" 
                stroke="rgba(139, 92, 246, 0.8)" 
                strokeWidth="3"
                className="drop-shadow-lg"
              />
              
              {/* Inner circle */}
              <circle 
                cx="150" 
                cy="150" 
                r="15" 
                fill="rgba(139, 92, 246, 0.2)" 
                stroke="rgba(139, 92, 246, 0.5)" 
                strokeWidth="2"
              />
            </svg>
          </div>
          
          {/* Pointer - Moved outside the rotating container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-20">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M16 2L30 30H2L16 2Z" 
                fill="url(#pointerGradient)" 
                stroke="rgba(139, 92, 246, 0.8)" 
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="pointerGradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED"/>
                  <stop offset="1" stopColor="#4C1D95"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Selected option display */}
          <div className="mt-12 text-center animate-fade-in">
            <div className="mb-2 text-lg font-medium text-slate-300">
              {isSpinning ? 'Spinning...' : selectedOption ? 'Selected:' : 'Ready to spin!'}
            </div>
            {selectedOption && (
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-violet-300 text-transparent bg-clip-text px-6 py-3">
                {selectedOption}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={spinWheel}
            disabled={!canSpin}
            className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 ${
              !canSpin 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 transform hover:scale-105 shadow-lg hover:shadow-violet-500/30'
            }`}
          >
            <ArrowPathIcon className={`inline-block w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning...' : 'Spin the Wheel! 🎡'}
          </button>
        </div>

        {/* Options List */}
        {options.length > 0 && (
          <div className="glass p-6 mt-8 rounded-2xl">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Your Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    selectedOption === option 
                      ? 'bg-gradient-to-r from-violet-900/50 to-violet-800/50 border border-violet-700/50' 
                      : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-slate-200">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheelPage;
