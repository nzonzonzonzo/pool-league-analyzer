import React from 'react';

const LightbulbIcon = () => (
  <span className="text-neutral-500 hover:text-neutral-400 transition-colors z-30 cursor-pointer">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" 
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8A6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
    </svg>
  </span>
);

export default LightbulbIcon;