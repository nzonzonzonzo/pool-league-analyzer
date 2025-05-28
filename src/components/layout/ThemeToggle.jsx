import React from 'react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <span 
      onClick={toggleDarkMode}
      className="fixed text-xs text-neutral-500 hover:text-neutral-400 transition-colors z-30 cursor-pointer"
      style={{ bottom: '1rem', right: '1rem' }}
    >
      Change theme
    </span>
  );
};

export default ThemeToggle;