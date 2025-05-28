import React from 'react';
import LightbulbIcon from './icons/LightbulbIcon';

const FloatingInfoButton = ({ onClick }) => (
  <button 
    className="fixed top-4 right-4 z-40 p-0 bg-transparent hover:opacity-80 transition-opacity duration-200"
    onClick={onClick}
    aria-label="Show Information"
  >
    <LightbulbIcon />
  </button>
);

export default FloatingInfoButton;