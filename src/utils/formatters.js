/**
 * Format a player's full name to display format (last name initial)
 * @param {string} fullName - The player's full name
 * @returns {string} - Formatted name
 */
export function formatName(fullName) {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  const parts = fullName.split(' ');
  return parts.length <= 1 ? fullName : 
    `${parts.slice(0, parts.length - 1).join(' ')} ${parts[parts.length - 1][0]}.`;
}

/**
 * Efficient function to create a shallow copy of a selections object
 * @param {Object} selections - The selections object to clone
 * @returns {Object} - Cloned selections object
 */
export function cloneSelections(selections) {
  const clone = {};
  for (const gameKey in selections) {
    clone[gameKey] = { 
      home: selections[gameKey].home, 
      away: selections[gameKey].away 
    };
  }
  return clone;
}