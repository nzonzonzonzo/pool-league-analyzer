import React, { useState, useEffect, useRef } from 'react';

function SearchableDropdown({ options, value, onChange, placeholder, minChars = 1 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const optionsRef = useRef([]);

  // Filter options based on search term - WITH FIXED NULL CHECK
  const filteredOptions = options.filter(option => {
    // Skip null/undefined values
    if (!option) return false;
    
    // Handle the case where searchTerm might be null/undefined
    const search = searchTerm || '';
    
    try {
      // Try the normal string operation with a safety net
      return option.toLowerCase().includes(search.toLowerCase());
    } catch (e) {
      // If any error occurs, convert to string and try again
      try {
        return String(option).toLowerCase().includes(search.toLowerCase());
      } catch (e2) {
        // If all else fails, exclude this item
        console.warn('Could not filter option:', option);
        return false;
      }
    }
  });
  
  // Reset focused index when filtered options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions.length]);
  
  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Handle option selection
  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Prevent default behavior for arrow keys
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "ArrowDown") {
      // Only open dropdown if minimum chars are typed or we have a value
      if (!isOpen && (searchTerm.length >= minChars || value)) {
        setIsOpen(true);
      } else if (isOpen) {
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      setFocusedIndex(prev => 
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      handleSelect(filteredOptions[focusedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Scroll into view when using keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [focusedIndex]);

  // Function to check if dropdown should be shown
  const shouldShowDropdown = () => {
    return isOpen && (searchTerm.length >= minChars || value);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center border rounded p-2 cursor-pointer bg-neutral-50 hover:bg-neutral-100"
        onClick={() => {
          if (searchTerm.length >= minChars || value) {
            setIsOpen(!isOpen);
          }
        }}
      >
        <input
          type="text"
          className="w-full bg-transparent border-none focus:outline-none text-neutral-800"
          placeholder={placeholder || "Search..."}
          value={searchTerm || value}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);
            setIsOpen(newValue.length >= minChars);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (searchTerm.length >= minChars || value) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {shouldShowDropdown() && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-neutral-800 border border-neutral-600 rounded-lg">
          {searchTerm.length < minChars && !value ? (
            <div className="p-2 text-neutral-500">Type at least {minChars} characters to search</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                ref={el => optionsRef.current[index] = el}
                className={
                  focusedIndex === index 
                    ? "p-2 cursor-pointer text-xs bg-primary text-neutral-50" 
                    : "p-2 bg-neutral-50 cursor-pointer text-xs text-neutral-600 hover:bg-primary-light hover:text-neutral-900"
                }
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                style={{
                  transition: "all 0.2s ease"
                }}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2 text-neutral-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableDropdown;