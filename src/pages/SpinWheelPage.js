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

  // Generate colors for the wheel segments
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#F43F5E'
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
      const startAngle = index * anglePerSection - 90; // Start from top
      const endAngle = (index + 1) * anglePerSection - 90;
      const color = colors[index % colors.length];
      
      return {
        option,
        startAngle,
        endAngle,
        color,
        textRotation: startAngle + anglePerSection / 2 // Center text in the segment
      };
    });
  }, [options, colors]); // Added dependencies

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

  // Calculate clip paths for each segment
  const getSegmentPath = (startAngle, endAngle, radius = 150) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 150 + Math.cos(startRad) * radius;
    const y1 = 150 + Math.sin(startRad) * radius;
    const x2 = 150 + Math.cos(endRad) * radius;
    const y2 = 150 + Math.sin(endRad) * radius;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const wheelSections = getWheelSections();
  const canSpin = options.length >= 2 && !isSpinning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/add-options')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to options
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
            Spin the Wheel
          </h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        <div className="card p-6 mb-8">
          <div className="relative w-full max-w-md mx-auto mb-8">
            {/* Wheel Container */}
            <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
              {/* Wheel */}
              <div 
                ref={wheelRef}
                className="relative w-full h-full rounded-full overflow-hidden shadow-xl transition-transform duration-100"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 0.1s linear' : 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                }}
              >
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {wheelSections.map((section, index) => (
                    <path
                      key={index}
                      d={getSegmentPath(section.startAngle, section.endAngle, 150)}
                      fill={section.color}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Center circle */}
                  <circle cx="150" cy="150" r="30" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
                  
                  {/* Text labels */}
                  {wheelSections.map((section, index) => {
                    const radius = 100;
                    const angle = (section.textRotation * Math.PI) / 180;
                    const x = 150 + Math.cos(angle) * radius;
                    const y = 150 + Math.sin(angle) * radius;
                    
                    return (
                      <text
                        key={`text-${index}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="600"
                        transform={`rotate(${section.textRotation + 90}, ${x}, ${y})`}
                        className="pointer-events-none select-none"
                      >
                        {section.option.length > 15 
                          ? section.option.substring(0, 12) + '...' 
                          : section.option}
                      </text>
                    );
                  })}
                </svg>
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-2 w-0 h-0 
                        border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent 
                        border-b-red-600 z-10"></div>
              
              {/* Glow effect when spinning */}
              {isSpinning && (
                <div className="absolute inset-0 rounded-full bg-white bg-opacity-20 animate-pulse"></div>
              )}
            </div>
            
            {/* Result Display */}
            <div className="mt-8 text-center">
              <div className="mb-2 text-sm font-medium text-gray-500">
                {isSpinning ? 'Spinning...' : selectedOption ? 'Selected:' : 'Ready to spin!'}
              </div>
              {selectedOption && (
                <div className="text-2xl font-bold text-gray-900 bg-primary-50 py-3 px-6 rounded-lg border border-primary-100 inline-block">
                  {selectedOption}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={spinWheel}
              disabled={!canSpin}
              className={`btn btn-primary inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl shadow-lg transform transition-all duration-200 ${
                canSpin 
                  ? 'hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </button>
          </div>
        </div>
        
        {/* Options List */}
        {options.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    selectedOption === option 
                      ? 'border-primary-200 bg-primary-50' 
                      : 'border-gray-200 bg-white'
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {index + 1}
                    </div>
                    <span className="truncate">{option}</span>
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
