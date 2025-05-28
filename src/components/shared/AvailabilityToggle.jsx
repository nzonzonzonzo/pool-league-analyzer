import React from 'react';

const AvailabilityToggle = ({ isAvailable, onChange }) => {
  return (
    <label className="toggle-switch">
      <input 
        type="checkbox"
        checked={isAvailable}
        onChange={(e) => {
          console.log('Toggle clicked, new value:', e.target.checked);
          onChange();
        }} 
      />
      <span className="toggle-slider"></span>
    </label>
  );
};

export default AvailabilityToggle;