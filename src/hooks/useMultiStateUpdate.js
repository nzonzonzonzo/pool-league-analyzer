import { useState, useEffect } from 'react';

/**
 * Custom hook to perform multiple state updates before navigation
 * This hook helps manage complex state transitions that need to be batched
 */
export const useMultiStateUpdate = () => {
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Function to apply all pending updates
  useEffect(() => {
    if (pendingUpdates.length > 0 && !isUpdating) {
      setIsUpdating(true);
      
      // Apply all updates in sequence
      const applyUpdates = async () => {
        for (const update of pendingUpdates) {
          await update();
        }
        
        // Clear updates and reset flag
        setPendingUpdates([]);
        setIsUpdating(false);
      };
      
      applyUpdates();
    }
  }, [pendingUpdates, isUpdating]);
  
  // Add an update to the queue
  const addUpdate = (updateFn) => {
    setPendingUpdates(prev => [...prev, updateFn]);
  };
  
  // Clear all pending updates
  const clearUpdates = () => {
    setPendingUpdates([]);
    setIsUpdating(false);
  };
  
  return { 
    addUpdate, 
    clearUpdates, 
    isUpdating, 
    hasPendingUpdates: pendingUpdates.length > 0 
  };
};