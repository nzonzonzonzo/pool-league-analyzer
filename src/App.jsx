import React, { useState, useEffect, useRef, useReducer } from "react";
import "./App.css";

// ==============================================
// DEBUG CONFIGURATION
// ==============================================
const DEBUG = {
  enabled: true,          // Master toggle for all debugging
  logStateChanges: true,  // Log state transitions
  logErrors: true,        // Log errors
  logRendering: true,     // Log component rendering
  logCalculations: true,  // Log algorithm calculations
  componentBorders: false // Show component borders for visual debugging
};

// Global debug logger that prepends timestamps and can be easily toggled
function debugLog(category, message, data) {
  if (!DEBUG.enabled) return;
  
  // Only log if the specific category is enabled
  if (!DEBUG[`log${category}`] && category !== 'ALWAYS') return;
  
  const timestamp = new Date().toISOString().substring(11, 23);
  const prefix = `[${timestamp}][${category}]`;
  
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

// Debug component to show the current state - can be toggled on/off
const DebugPanel = ({ state, visible = false }) => {
  if (!visible || !DEBUG.enabled) return null;
  
  return (
    <div className="fixed bottom-0 right-0 max-w-md max-h-96 overflow-auto bg-gray-800 text-white p-4 m-4 z-50 text-xs opacity-80 rounded shadow-lg">
      <h3 className="text-sm font-bold mb-2">App State</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

// Error boundary component to catch and display render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    debugLog('Errors', 'Component error caught', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <details className="text-sm">
            <summary>View error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==============================================
// CORE UTILITIES
// ==============================================

// Format a player's name for display (e.g., "John Doe" -> "John D.")
const formatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  try {
    const parts = fullName.split(' ');
    const result = parts.length <= 1 
      ? fullName 
      : `${parts.slice(0, parts.length - 1).join(' ')} ${parts[parts.length - 1][0]}.`;
    
    debugLog('StateChanges', `Formatted name: ${fullName} -> ${result}`);
    return result;
  } catch (error) {
    debugLog('Errors', 'Error formatting name', { fullName, error });
    return fullName; // Return original on error
  }
};

// Create a deep copy of selections object with new references to ensure immutability
function deepCloneObject(obj) {
  try {
    debugLog('StateChanges', 'Deep cloning object', { originalObject: obj });
    
    // Handle null/undefined
    if (obj === null || obj === undefined) return obj;
    
    // Handle primitive types
    if (typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      const clonedArray = obj.map(item => deepCloneObject(item));
      debugLog('StateChanges', 'Cloned array', { 
        original: obj, 
        clone: clonedArray,
        sameReference: obj === clonedArray
      });
      return clonedArray;
    }
    
    // Handle regular objects
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepCloneObject(obj[key]);
    });
    
    debugLog('StateChanges', 'Cloned object', { 
      original: obj, 
      clone: clonedObj,
      sameReference: obj === clonedObj
    });
    
    return clonedObj;
  } catch (error) {
    debugLog('Errors', 'Error deep cloning object', { obj, error });
    // Fallback to JSON parse/stringify method
    return JSON.parse(JSON.stringify(obj));
  }
}

// ==============================================
// UI COMPONENTS
// ==============================================

// SVG Icon Components
const LightbulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#bdc1c6"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8A6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#bdc1c6"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Floating info button
const FloatingInfoButton = ({ onClick }) => {
  debugLog('Rendering', 'Rendering FloatingInfoButton');
  return (
    <button 
      className="fixed top-4 right-4 z-40 p-0 bg-transparent hover:opacity-80 transition-opacity duration-200"
      onClick={() => {
        debugLog('StateChanges', 'Info button clicked');
        onClick();
      }}
      aria-label="Show Information"
    >
      <LightbulbIcon />
    </button>
  );
};

// Info Popup Component
const InfoPopup = ({ isOpen, onClose }) => {
  debugLog('Rendering', 'Rendering InfoPopup, isOpen:', isOpen);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" 
      onClick={() => {
        debugLog('StateChanges', 'InfoPopup backdrop clicked, closing');
        onClose();
      }}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto m-4" 
        onClick={(e) => {
          debugLog('StateChanges', 'InfoPopup content clicked, preventing propagation');
          e.stopPropagation();
        }}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-white">How Win Probabilities and Optimal Matchups Are Calculated</h2>
          <button className="bg-transparent hover:opacity-80 transition-opacity duration-200" 
            onClick={() => {
              debugLog('StateChanges', 'InfoPopup close button clicked');
              onClose();
            }}>
            <CloseIcon />
          </button>
        </div>
        
        <p className="mb-4 text-gray-300">The Pool Team Stats Analyzer uses advanced algorithms to both calculate individual matchup probabilities and determine the optimal overall lineup strategy.</p>
        
        <h3 className="text-lg font-medium mb-2 text-white">Individual Matchup Probability Factors</h3>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Base Win Percentages:</span> Each player's overall win percentage serves as the foundation (30% weight)</li>
          <li className="mb-1"><span className="font-medium">Head-to-Head History:</span> Direct matchup results between the specific players are heavily weighted:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>More previous matches = stronger influence (up to 50% weight)</li>
              <li>Recent matches count more than older ones</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Performance Against Similar Handicap Levels:</span> How well players perform against opponents of comparable skill levels:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Tracks win rates against higher, equal, and lower handicapped players</li>
              <li>Helps predict performance in matchups with specific opponent types</li>
            </ul>
          </li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-white">Team Lineup Optimization (Hungarian Algorithm)</h3>
        <p className="mb-2 text-gray-300">To determine the best possible combination of player matchups for your entire team, we implement the Hungarian Algorithm – a sophisticated mathematical approach used in assignment problems. Here's how it works:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Cost Matrix Creation:</span> The system builds a matrix where:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Each row represents one of your players</li>
              <li>Each column represents an opponent</li>
              <li>Each cell contains the "cost" (calculated as 1 minus the win probability)</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Optimal Assignment:</span> The Hungarian Algorithm finds the combination of assignments that minimizes the total cost, effectively:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Maximizing the team's overall win probability</li>
              <li>Ensuring each player is matched against the opponent that creates the best team outcome</li>
              <li>Finding the mathematically optimal solution among all possible combinations</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Strategic Balance:</span> Rather than simply matching your best player against their best player, the algorithm may discover non-intuitive matchups that give your team the highest probability of overall success.</li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-white">The Calculation Process</h3>
        <p className="mb-2 text-gray-300">For each potential lineup configuration, the system:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li>Calculates individual win probabilities for all possible player combinations</li>
          <li>Applies the Hungarian Algorithm to find the globally optimal set of matchups</li>
          <li>Recommends the lineup with the highest mathematical probability of team success</li>
        </ol>
        
        <p className="mb-0 italic text-gray-300">This sophisticated approach goes far beyond simple one-to-one matchup analysis, giving your team a significant strategic advantage based on historical performance data and advanced mathematical optimization.</p>
      </div>
    </div>
  );
};

// ==============================================
// DROPDOWN COMPONENT
// ==============================================

// Enhanced SearchableDropdown with minimum character requirement and debugging
function SearchableDropdown({ id, options, value, onChange, placeholder, minChars = 2 }) {
  const componentId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  debugLog('Rendering', `Rendering SearchableDropdown [${componentId}]`, { 
    optionsCount: options?.length,
    currentValue: value,
    placeholder,
    minChars
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const optionsRef = useRef([]);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    try {
      return option.toLowerCase().includes((searchTerm || '').toLowerCase());
    } catch (error) {
      debugLog('Errors', 'Error filtering options', { option, searchTerm, error });
      return false;
    }
  });
  
  debugLog('StateChanges', `[${componentId}] Filtered options`, { 
    searchTerm, 
    totalOptions: options.length, 
    filteredCount: filteredOptions.length 
  });

  // Reset focused index when filtered options change
  useEffect(() => {
    debugLog('StateChanges', `[${componentId}] Filtered options changed, resetting focusedIndex`);
    setFocusedIndex(-1);
  }, [filteredOptions.length, componentId]);

  // Handle outside click to close dropdown
  useEffect(() => {
    debugLog('StateChanges', `[${componentId}] Setting up outside click handler`);
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        debugLog('StateChanges', `[${componentId}] Outside click detected, closing dropdown`);
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      debugLog('StateChanges', `[${componentId}] Cleaning up outside click handler`);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentId]);

  // Handle option selection
  const handleSelect = (option) => {
    debugLog('StateChanges', `[${componentId}] Option selected:`, option);
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    debugLog('StateChanges', `[${componentId}] Key pressed:`, e.key);
    
    // Prevent default behavior for arrow keys
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "ArrowDown") {
      // Only open dropdown if minimum chars are typed or we have a value
      if (!isOpen && (searchTerm.length >= minChars || value)) {
        debugLog('StateChanges', `[${componentId}] Opening dropdown on ArrowDown`);
        setIsOpen(true);
      } else if (isOpen) {
        const newIndex = focusedIndex < filteredOptions.length - 1 ? focusedIndex + 1 : 0;
        debugLog('StateChanges', `[${componentId}] Changing focusedIndex on ArrowDown:`, newIndex);
        setFocusedIndex(newIndex);
      }
    } else if (e.key === "ArrowUp") {
      const newIndex = focusedIndex > 0 ? focusedIndex - 1 : filteredOptions.length - 1;
      debugLog('StateChanges', `[${componentId}] Changing focusedIndex on ArrowUp:`, newIndex);
      setFocusedIndex(newIndex);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      debugLog('StateChanges', `[${componentId}] Selecting option on Enter:`, filteredOptions[focusedIndex]);
      handleSelect(filteredOptions[focusedIndex]);
    } else if (e.key === "Escape") {
      debugLog('StateChanges', `[${componentId}] Closing dropdown on Escape`);
      setIsOpen(false);
    }
  };

  // Scroll into view when using keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      debugLog('StateChanges', `[${componentId}] Scrolling to focusedIndex:`, focusedIndex);
      optionsRef.current[focusedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [focusedIndex, componentId]);

  // Function to check if dropdown should be shown
  const shouldShowDropdown = () => {
    const result = isOpen && (searchTerm.length >= minChars || value);
    debugLog('StateChanges', `[${componentId}] shouldShowDropdown:`, result, {
      isOpen,
      searchTermLength: searchTerm?.length || 0,
      minChars,
      hasValue: Boolean(value)
    });
    return result;
  };

  return (
    <div 
      className={`relative w-full ${DEBUG.componentBorders ? 'border border-red-300' : ''}`}
      ref={dropdownRef}
      data-testid={componentId}
    >
      <div 
        className="flex items-center border rounded p-2 cursor-pointer bg-neutral-50 hover:bg-neutral-100"
        onClick={() => {
          if (searchTerm.length >= minChars || value) {
            debugLog('StateChanges', `[${componentId}] Container clicked, toggling dropdown`);
            setIsOpen(!isOpen);
          } else {
            debugLog('StateChanges', `[${componentId}] Container clicked, but not enough chars to open`);
          }
        }}
      >
        <input
          type="text"
          className="w-full bg-transparent border-none focus:outline-none text-neutral-800"
          placeholder={placeholder || "Search..."}
          value={searchTerm || value || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            debugLog('StateChanges', `[${componentId}] Input changed:`, newValue);
            setSearchTerm(newValue);
            setIsOpen(newValue.length >= minChars);
          }}
          onClick={(e) => {
            debugLog('StateChanges', `[${componentId}] Input clicked`);
            e.stopPropagation();
            if (searchTerm.length >= minChars || value) {
              debugLog('StateChanges', `[${componentId}] Opening dropdown on input click`);
              setIsOpen(true);
            } else {
              debugLog('StateChanges', `[${componentId}] Not enough chars to open on input click`);
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {shouldShowDropdown() && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-neutral-800 border border-neutral-600 rounded-lg">
          {searchTerm.length < minChars && !value ? (
            <div className="p-2 text-neutral-500">
              Type at least {minChars} characters to search
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              debugLog('Rendering', `[${componentId}] Rendering option:`, { 
                option, 
                index, 
                isFocused: index === focusedIndex 
              });
              return (
                <div
                  key={`${componentId}-option-${index}`}
                  ref={el => optionsRef.current[index] = el}
                  className={
                    focusedIndex === index 
                      ? "p-2 cursor-pointer text-xs bg-primary text-neutral-50" 
                      : "p-2 bg-neutral-50 cursor-pointer text-xs text-neutral-600 hover:bg-primary-light hover:text-neutral-900"
                  }
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => {
                    debugLog('StateChanges', `[${componentId}] Option mouse enter:`, index);
                    setFocusedIndex(index);
                  }}
                >
                  {option}
                </div>
              );
            })
          ) : (
            <div className="p-2 text-neutral-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================
// STATE MANAGEMENT SETUP
// ==============================================

// Define action types for our reducer
const ACTION_TYPES = {
  // Data loading actions
  LOAD_DATA_START: 'LOAD_DATA_START',
  LOAD_DATA_SUCCESS: 'LOAD_DATA_SUCCESS',
  LOAD_DATA_ERROR: 'LOAD_DATA_ERROR',
  
  // UI actions
  TOGGLE_INFO_POPUP: 'TOGGLE_INFO_POPUP',
  TOGGLE_DEBUG_PANEL: 'TOGGLE_DEBUG_PANEL',
  SET_CALCULATING: 'SET_CALCULATING',
  
  // Game flow actions
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_COIN_FLIP: 'SET_COIN_FLIP',
  
  // Selection actions
  SET_SELECTED_TEAMS: 'SET_SELECTED_TEAMS',
  SET_AVAILABLE_PLAYERS: 'SET_AVAILABLE_PLAYERS',
  SELECT_PLAYER: 'SELECT_PLAYER',
  SET_BEST_PLAYER: 'SET_BEST_PLAYER',
  SET_OPTIMAL_PLAYER: 'SET_OPTIMAL_PLAYER',
  SET_AUTO_SELECTED_PLAYER: 'SET_AUTO_SELECTED_PLAYER',
  
  // Reset action
  RESET_APP: 'RESET_APP',
  
  // Debug actions
  LOG_STATE: 'LOG_STATE',
  CREATE_STATE_SNAPSHOT: 'CREATE_STATE_SNAPSHOT',
  REVERT_TO_SNAPSHOT: 'REVERT_TO_SNAPSHOT'
};

// Initial state for our reducer
const initialState = {
  // UI state
  loading: false,       // Changed to false initially to prevent blank screen
  loadingError: null,
  isCalculating: false,
  showInfoPopup: false,
  showDebugPanel: DEBUG.enabled,
  
  // Game state
  currentStep: "team-selection", // Initial step
  previousStep: null,           // For tracking transitions
  wonCoinFlip: null,
  
  // Data state
  allMatches: [],
  filteredMatches: [],
  teamStats: [],
  teams: [],
  
  // Selection state
  selectedHomeTeam: "",
  selectedAwayTeam: "",
  homeTeamPlayers: [],
  awayTeamPlayers: [],
  availableHomePlayers: [],
  availableAwayPlayers: [],
  
  // Algorithm results
  optimalPlayer: null,
  calculatedBestPlayer: null,
  lastAutoSelectedPlayer: null,
  
  // Game selections
  selectedPlayers: {
    game1: { home: null, away: null },
    game2: { home: null, away: null },
    game3: { home: null, away: null },
    game4: { home: null, away: null },
  },
  
  // Process tracking
  isProcessingSelection: false,
  processingGame: null,
  
  // Debugging state
  stateHistory: [],
  transitionLog: []
};

// Filter matches to only include those between the selected teams
function filterMatchesForTeams(allMatches, homeTeamPlayers, awayTeamPlayers) {
  debugLog('Calculations', 'Filtering matches for selected teams', {
    allMatchesCount: allMatches?.length,
    homeTeamPlayersCount: homeTeamPlayers?.length,
    awayTeamPlayersCount: awayTeamPlayers?.length
  });
  
  // Input validation
  if (!allMatches || !homeTeamPlayers || !awayTeamPlayers) {
    debugLog('Errors', 'Invalid inputs for filterMatchesForTeams', {
      allMatchesValid: Boolean(allMatches),
      homeTeamPlayersValid: Boolean(homeTeamPlayers),
      awayTeamPlayersValid: Boolean(awayTeamPlayers)
    });
    return [];
  }
  
  // Create arrays of player names for efficient lookup
  const homePlayerNames = homeTeamPlayers.map(p => normalizePlayerName(p.name));
  const awayPlayerNames = awayTeamPlayers.map(p => normalizePlayerName(p.name));
  
  debugLog('Calculations', 'Created player name arrays for filtering', {
    homePlayerNames,
    awayPlayerNames
  });
  
  // Filter the matches
  const filteredMatches = allMatches.filter(match => {
    try {
      const homePlayerNorm = normalizePlayerName(match.homePlayer);
      const awayPlayerNorm = normalizePlayerName(match.awayPlayer);
      
      // Check if both players belong to the selected teams (in any combination)
      const isHomeVsAway = 
        (homePlayerNames.includes(homePlayerNorm) && awayPlayerNames.includes(awayPlayerNorm)) ||
        (homePlayerNames.includes(awayPlayerNorm) && awayPlayerNames.includes(homePlayerNorm));
      
      const isNotForfeit = !match.forfeit;
      
      return isHomeVsAway && isNotForfeit;
    } catch (error) {
      debugLog('Errors', 'Error filtering match', { match, error });
      return false;
    }
  });
  
  debugLog('Calculations', `Filtered matches: ${filteredMatches.length} of ${allMatches.length} matches`);
  return filteredMatches;
}

// Helper to create a transition log entry
function createTransitionLogEntry(actionType, payload, prevState, nextState) {
  return {
    timestamp: new Date().toISOString(),
    actionType,
    payload: deepCloneObject(payload),
    changes: getStateDiff(prevState, nextState)
  };
}

// Helper to compare state objects and identify what changed
function getStateDiff(prevState, nextState) {
  if (!prevState || !nextState) return {};
  
  const changes = {};
  
  // Check top-level properties
  Object.keys(nextState).forEach(key => {
    // Skip history and logs
    if (['stateHistory', 'transitionLog'].includes(key)) return;
    
    if (JSON.stringify(prevState[key]) !== JSON.stringify(nextState[key])) {
      // For complex objects, we want to show what specifically changed
      if (typeof nextState[key] === 'object' && nextState[key] !== null) {
        if (Array.isArray(nextState[key])) {
          changes[key] = {
            type: 'array',
            prevLength: prevState[key]?.length || 0,
            nextLength: nextState[key].length,
            changed: true
          };
        } else {
          // For objects, check which properties changed
          const objectChanges = {};
          let hasChanges = false;
          
          Object.keys(nextState[key] || {}).forEach(subKey => {
            if (JSON.stringify(prevState[key]?.[subKey]) !== JSON.stringify(nextState[key][subKey])) {
              objectChanges[subKey] = {
                from: prevState[key]?.[subKey],
                to: nextState[key][subKey]
              };
              hasChanges = true;
            }
          });
          
          if (hasChanges) {
            changes[key] = {
              type: 'object',
              changes: objectChanges
            };
          }
        }
      } else {
        // For primitive values, just show the change
        changes[key] = {
          from: prevState[key],
          to: nextState[key]
        };
      }
    }
  });
  
  return changes;
}

// ==============================================
// REDUCER IMPLEMENTATION
// ==============================================

// Reducer function to handle all state updates with detailed logging
function appReducer(state, action) {
  // Create a copy of the state to work with
  let nextState = { ...state };
  
  debugLog('StateChanges', `[REDUCER] Processing action: ${action.type}`, { 
    payload: action.payload,
    currentStep: state.currentStep
  });
  
  try {
    switch (action.type) {
      case ACTION_TYPES.LOAD_DATA_START:
        debugLog('StateChanges', '[REDUCER] Starting data loading');
        nextState = { 
          ...state, 
          loading: true,
          loadingError: null
        };
        break;
        
      case ACTION_TYPES.LOAD_DATA_SUCCESS:
        debugLog('StateChanges', '[REDUCER] Data loaded successfully', {
          matchesCount: action.payload.allMatches?.length,
          teamsCount: action.payload.teams?.length,
          statsCount: action.payload.teamStats?.length
        });
        
        nextState = { 
          ...state, 
          ...action.payload,
          loading: false,
          loadingError: null
        };
        break;
        
      case ACTION_TYPES.LOAD_DATA_ERROR:
        debugLog('Errors', '[REDUCER] Data loading error', action.payload);
        nextState = { 
          ...state, 
          loading: false,
          loadingError: action.payload
        };
        break;
        
      case ACTION_TYPES.TOGGLE_INFO_POPUP:
        const showInfoPopup = action.payload !== undefined 
          ? Boolean(action.payload) 
          : !state.showInfoPopup;
          
        debugLog('StateChanges', `[REDUCER] Toggling info popup to: ${showInfoPopup}`);
        nextState = { 
          ...state, 
          showInfoPopup 
        };
        break;
        
      case ACTION_TYPES.TOGGLE_DEBUG_PANEL:
        const showDebugPanel = action.payload !== undefined 
          ? Boolean(action.payload) 
          : !state.showDebugPanel;
          
        debugLog('StateChanges', `[REDUCER] Toggling debug panel to: ${showDebugPanel}`);
        nextState = { 
          ...state, 
          showDebugPanel 
        };
        break;
        
      case ACTION_TYPES.SET_CALCULATING:
        debugLog('StateChanges', `[REDUCER] Setting calculating state to: ${action.payload}`);
        nextState = { 
          ...state, 
          isCalculating: Boolean(action.payload) 
        };
        break;
        
      case ACTION_TYPES.SET_CURRENT_STEP:
        debugLog('StateChanges', `[REDUCER] Changing step from ${state.currentStep} to ${action.payload}`);
        nextState = { 
          ...state, 
          currentStep: action.payload,
          previousStep: state.currentStep,
          // Reset processing flags when changing steps
          isProcessingSelection: false,
          processingGame: null
        };
        break;
        
      case ACTION_TYPES.SET_COIN_FLIP:
        debugLog('StateChanges', `[REDUCER] Setting coin flip result to: ${action.payload}`);
        nextState = { 
          ...state, 
          wonCoinFlip: Boolean(action.payload) 
        };
        break;
        
      case ACTION_TYPES.SET_SELECTED_TEAMS:
        const { homeTeam, awayTeam } = action.payload;
        debugLog('StateChanges', '[REDUCER] Setting selected teams', {
          homeTeam,
          awayTeam,
          previousHomeTeam: state.selectedHomeTeam,
          previousAwayTeam: state.selectedAwayTeam
        });
        
        // Filter team players based on team names
        const homeTeamPlayers = homeTeam 
          ? state.teamStats.filter(player => player.team === homeTeam)
          : [];
          
        const awayTeamPlayers = awayTeam 
          ? state.teamStats.filter(player => player.team === awayTeam)
          : [];
        
        debugLog('StateChanges', '[REDUCER] Filtered team players', {
          homeTeamPlayersCount: homeTeamPlayers.length,
          awayTeamPlayersCount: awayTeamPlayers.length
        });

        // Filter matches to only include those between the selected teams
        const filteredMatches = filterMatchesForTeams(state.allMatches, homeTeamPlayers, awayTeamPlayers);
        
        nextState = { 
          ...state, 
          selectedHomeTeam: homeTeam || state.selectedHomeTeam,
          selectedAwayTeam: awayTeam || state.selectedAwayTeam,
          homeTeamPlayers,
          awayTeamPlayers
        };
        break;
        
      case ACTION_TYPES.SET_AVAILABLE_PLAYERS:
        debugLog('StateChanges', '[REDUCER] Setting available players', {
          homeCount: action.payload.home?.length,
          awayCount: action.payload.away?.length,
          previousHomeCount: state.availableHomePlayers.length,
          previousAwayCount: state.availableAwayPlayers.length
        });
        
        nextState = { 
          ...state, 
          availableHomePlayers: action.payload.home || state.availableHomePlayers,
          availableAwayPlayers: action.payload.away || state.availableAwayPlayers
        };
        break;
        
      case ACTION_TYPES.SELECT_PLAYER:
        const { game, team, player } = action.payload;
        
        debugLog('StateChanges', '[REDUCER] Selecting player', {
          game,
          team,
          player: player?.name,
          currentProcessingGame: state.processingGame
        });
        
        // Perform validation to prevent issues
        if (!game || !team || !player || !player.name) {
          debugLog('Errors', '[REDUCER] Invalid player selection data', action.payload);
          return state; // Return unchanged state
        }
        
        // Create a deep copy of the selectedPlayers object to ensure immutability
        const updatedSelectedPlayers = deepCloneObject(state.selectedPlayers);
        
        // Ensure the game object exists
        if (!updatedSelectedPlayers[game]) {
          updatedSelectedPlayers[game] = { home: null, away: null };
        }
        
        // Update the selected player
        updatedSelectedPlayers[game][team] = player;
        
        // Create copies of the available players arrays
        let updatedAvailableHomePlayers = [...state.availableHomePlayers];
        let updatedAvailableAwayPlayers = [...state.availableAwayPlayers];
        
        // Remove the selected player from the appropriate available list
        if (team === 'home') {
          updatedAvailableHomePlayers = updatedAvailableHomePlayers.filter(
            p => p.name !== player.name
          );
          debugLog('StateChanges', '[REDUCER] Removed player from availableHomePlayers', {
            playerName: player.name,
            beforeCount: state.availableHomePlayers.length,
            afterCount: updatedAvailableHomePlayers.length
          });
        } else {
          updatedAvailableAwayPlayers = updatedAvailableAwayPlayers.filter(
            p => p.name !== player.name
          );
          debugLog('StateChanges', '[REDUCER] Removed player from availableAwayPlayers', {
            playerName: player.name,
            beforeCount: state.availableAwayPlayers.length,
            afterCount: updatedAvailableAwayPlayers.length
          });
        }
        
        nextState = {
          ...state,
          selectedPlayers: updatedSelectedPlayers,
          availableHomePlayers: updatedAvailableHomePlayers,
          availableAwayPlayers: updatedAvailableAwayPlayers,
          isProcessingSelection: true,
          processingGame: game
        };
        break;
        
      case ACTION_TYPES.SET_BEST_PLAYER:
        debugLog('StateChanges', '[REDUCER] Setting best player', {
          playerName: action.payload?.name
        });
        
        nextState = {
          ...state,
          calculatedBestPlayer: action.payload,
          isCalculating: false
        };
        break;
        
      case ACTION_TYPES.SET_OPTIMAL_PLAYER:
        debugLog('StateChanges', '[REDUCER] Setting optimal player', {
          playerName: action.payload?.name
        });
        
        nextState = {
          ...state,
          optimalPlayer: action.payload,
          isCalculating: false
        };
        break;
        
      case ACTION_TYPES.SET_AUTO_SELECTED_PLAYER:
        debugLog('StateChanges', '[REDUCER] Setting auto-selected player', {
          player: action.payload?.player?.name,
          opponent: action.payload?.opponent?.name,
          gameNumber: action.payload?.gameNumber,
          winProbability: action.payload?.winProbability
        });
        
        nextState = {
          ...state,
          lastAutoSelectedPlayer: action.payload
        };
        break;
        
      case ACTION_TYPES.RESET_APP:
        debugLog('StateChanges', '[REDUCER] Resetting app state');
        
        // Preserve loaded data when resetting
        nextState = {
          ...initialState,
          allMatches: state.allMatches,
          teamStats: state.teamStats,
          teams: state.teams,
          loading: false
        };
        break;
        
      case ACTION_TYPES.LOG_STATE:
        // This action just logs the current state without changing it
        debugLog('ALWAYS', '[REDUCER] Current state snapshot', { state });
        return state; // Return unchanged state
        
      case ACTION_TYPES.CREATE_STATE_SNAPSHOT:
        debugLog('StateChanges', '[REDUCER] Creating state snapshot', {
          label: action.payload?.label,
          historyLength: state.stateHistory.length
        });
        
        // Add current state to history
        const newSnapshot = {
          timestamp: new Date().toISOString(),
          label: action.payload?.label || `Snapshot #${state.stateHistory.length + 1}`,
          state: deepCloneObject(state)
        };
        
        nextState = {
          ...state,
          stateHistory: [...state.stateHistory, newSnapshot]
        };
        break;
        
      case ACTION_TYPES.REVERT_TO_SNAPSHOT:
        const snapshotIndex = action.payload?.index;
        const snapshotLabel = action.payload?.label;
        
        debugLog('StateChanges', '[REDUCER] Attempting to revert to snapshot', {
          index: snapshotIndex,
          label: snapshotLabel
        });
        
        // Find the snapshot by index or label
        let targetSnapshot = null;
        
        if (snapshotIndex !== undefined && state.stateHistory[snapshotIndex]) {
          targetSnapshot = state.stateHistory[snapshotIndex];
        } else if (snapshotLabel) {
          targetSnapshot = state.stateHistory.find(s => s.label === snapshotLabel);
        }
        
        if (targetSnapshot) {
          debugLog('StateChanges', '[REDUCER] Reverting to snapshot', {
            timestamp: targetSnapshot.timestamp,
            label: targetSnapshot.label
          });
          
          // Keep the history and add a new entry showing the reversion
          const stateHistory = [
            ...state.stateHistory,
            {
              timestamp: new Date().toISOString(),
              label: `Reverted to: ${targetSnapshot.label}`,
              isReversion: true,
              originalTimestamp: targetSnapshot.timestamp
            }
          ];
          
          // Return the stored state with the updated history
          return {
            ...targetSnapshot.state,
            stateHistory
          };
        } else {
          debugLog('Errors', '[REDUCER] Failed to find snapshot to revert to', {
            availableSnapshots: state.stateHistory.map(s => ({ 
              label: s.label, 
              timestamp: s.timestamp 
            }))
          });
          return state; // Return unchanged state if snapshot not found
        }
        
      default:
        debugLog('Errors', `[REDUCER] Unknown action type: ${action.type}`);
        return state; // Return unchanged state for unknown actions
    }
    
    // Add a new transition log entry if the state is changing
    if (nextState !== state) {
      const logEntry = createTransitionLogEntry(
        action.type,
        action.payload,
        state,
        nextState
      );
      
      // Add the transition log to the new state
      nextState.transitionLog = [...nextState.transitionLog, logEntry];
      
      // Log the state change
      debugLog('StateChanges', '[REDUCER] State updated', { 
        actionType: action.type,
        changes: logEntry.changes
      });
    }
    
    return nextState;
  } catch (error) {
    // Log any errors in the reducer
    debugLog('Errors', '[REDUCER] Error processing action', {
      actionType: action.type,
      payload: action.payload,
      error
    });
    
    // Return unchanged state on error to prevent app crashes
    return state;
  }
}

// ==============================================
// MATRIX UTILITIES AND HUNGARIAN ALGORITHM
// ==============================================

// Helper function to make a deep copy of a matrix
function makeMatrixCopy(matrix) {
  debugLog('Calculations', 'Making matrix copy', { 
    originalDimensions: matrix ? `${matrix.length}x${matrix[0]?.length}` : 'null' 
  });
  
  try {
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      debugLog('Errors', 'Invalid matrix for copying', { matrix });
      return [];
    }
    
    const copy = matrix.map(row => [...row]);
    
    debugLog('Calculations', 'Matrix copy created', { 
      newDimensions: `${copy.length}x${copy[0]?.length}`,
      sameReference: matrix === copy
    });
    
    return copy;
  } catch (error) {
    debugLog('Errors', 'Error copying matrix', { error });
    return [];
  }
}

// Validate a cost matrix before Hungarian algorithm
function validateCostMatrix(matrix) {
  // Check if matrix exists
  if (!matrix) {
    debugLog('Errors', 'Matrix is null or undefined');
    return false;
  }
  
  // Check if matrix is an array
  if (!Array.isArray(matrix)) {
    debugLog('Errors', 'Matrix is not an array');
    return false;
  }
  
  // Check if matrix has rows
  if (matrix.length === 0) {
    debugLog('Errors', 'Matrix has no rows');
    return false;
  }
  
  // Check if all rows are arrays
  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i])) {
      debugLog('Errors', `Row ${i} is not an array`);
      return false;
    }
  }
  
  // Check if all rows have the same length
  const rowLength = matrix[0].length;
  for (let i = 1; i < matrix.length; i++) {
    if (matrix[i].length !== rowLength) {
      debugLog('Errors', `Inconsistent row lengths: row 0 = ${rowLength}, row ${i} = ${matrix[i].length}`);
      return false;
    }
  }
  
  // Check if all elements are numbers
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (typeof matrix[i][j] !== 'number' || isNaN(matrix[i][j])) {
        debugLog('Errors', `Element at [${i}][${j}] is not a valid number: ${matrix[i][j]}`);
        return false;
      }
    }
  }
  
  debugLog('Calculations', 'Matrix validation passed', { 
    dimensions: `${matrix.length}x${matrix[0].length}` 
  });
  return true;
}

// Hungarian algorithm implementation with detailed logging
function hungarianOptimalAssignment(matrix) {
  debugLog('Calculations', 'Starting Hungarian algorithm', { 
    matrixProvided: Boolean(matrix),
    matrixDimensions: matrix ? `${matrix.length}x${matrix[0]?.length}` : 'N/A'
  });
  
  // Validate the input matrix
  if (!validateCostMatrix(matrix)) {
    debugLog('Errors', 'Matrix validation failed, returning empty result');
    return [];
  }
  
  try {
    // Make a deep copy of the cost matrix
    const cost = makeMatrixCopy(matrix);
    const m = cost.length;
    const n = cost[0].length;
    
    debugLog('Calculations', 'Hungarian algorithm processing', { 
      matrixDimensions: `${m}x${n}` 
    });
    
    // Step 1: Subtract row minima
    debugLog('Calculations', 'Step 1: Subtracting row minima');
    for (let i = 0; i < m; i++) {
      // Find minimum value in row
      let minVal = Infinity;
      for (let j = 0; j < n; j++) {
        // Fix any invalid values
        if (typeof cost[i][j] !== "number" || isNaN(cost[i][j])) {
          debugLog('Errors', `Invalid value at [${i}][${j}], defaulting to 0.5`);
          cost[i][j] = 0.5; // Default to 0.5 if invalid
        }

        if (cost[i][j] < minVal) {
          minVal = cost[i][j];
        }
      }

      // Subtract minimum from each element in the row
      if (minVal !== Infinity) {
        debugLog('Calculations', `Row ${i} minimum value: ${minVal}`);
        for (let j = 0; j < n; j++) {
          cost[i][j] -= minVal;
        }
      } else {
        debugLog('Errors', `Could not find minimum in row ${i}`);
      }
    }

    // Step 2: Subtract column minima
    debugLog('Calculations', 'Step 2: Subtracting column minima');
    for (let j = 0; j < n; j++) {
      // Find minimum value in column
      let minVal = Infinity;
      for (let i = 0; i < m; i++) {
        if (cost[i][j] < minVal) {
          minVal = cost[i][j];
        }
      }

      // Subtract minimum from each element in the column
      if (minVal !== Infinity) {
        debugLog('Calculations', `Column ${j} minimum value: ${minVal}`);
        for (let i = 0; i < m; i++) {
          cost[i][j] -= minVal;
        }
      } else {
        debugLog('Errors', `Could not find minimum in column ${j}`);
      }
    }

    // Initialize key data structures for the Hungarian algorithm
    debugLog('Calculations', 'Step 3: Initializing data structures');
    const rowCovered = Array(m).fill(false);
    const colCovered = Array(n).fill(false);
    const starMatrix = Array(m)
      .fill()
      .map(() => Array(n).fill(false));
    const primeMatrix = Array(m)
      .fill()
      .map(() => Array(n).fill(false));

    // Find all zeros and star them if possible
    debugLog('Calculations', 'Step 4: Finding initial zeros to star');
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (Math.abs(cost[i][j]) < 0.0001 && !rowCovered[i] && !colCovered[j]) {
          debugLog('Calculations', `Starring zero at [${i}][${j}]`);
          starMatrix[i][j] = true;
          rowCovered[i] = true;
          colCovered[j] = true;
        }
      }
    }

    // Reset row and column covered arrays
    debugLog('Calculations', 'Step 5: Resetting covered arrays');
    rowCovered.fill(false);
    colCovered.fill(false);

    // Cover all columns containing starred zeros
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (starMatrix[i][j]) {
          debugLog('Calculations', `Covering column ${j} (starred zero at [${i}][${j}])`);
          colCovered[j] = true;
        }
      }
    }

    // Count covered columns
    const countCoveredCols = () => colCovered.filter(Boolean).length;
    debugLog('Calculations', `Columns covered: ${countCoveredCols()} of ${n}`);

    // Main algorithm loop
    let iteration = 0;
    const MAX_ITERATIONS = 1000; // Safety check
    
    while (countCoveredCols() < n && iteration < MAX_ITERATIONS) {
      iteration++;
      debugLog('Calculations', `Main loop iteration ${iteration}, covered columns: ${countCoveredCols()}`);
      
      // Find an uncovered zero
      let row = -1, col = -1;
      let foundZero = false;
      
      for (let i = 0; i < m; i++) {
        if (rowCovered[i]) continue;

        for (let j = 0; j < n; j++) {
          if (colCovered[j]) continue;

          if (Math.abs(cost[i][j]) < 0.0001) {
            row = i;
            col = j;
            foundZero = true;
            break;
          }
        }

        if (foundZero) break;
      }

      if (!foundZero) {
        // If no uncovered zero found, create new zeros by adjusting the matrix
        debugLog('Calculations', 'No uncovered zero found, creating new zeros');
        
        // Find the smallest uncovered value
        let minVal = Infinity;
        for (let i = 0; i < m; i++) {
          if (rowCovered[i]) continue;

          for (let j = 0; j < n; j++) {
            if (colCovered[j]) continue;

            if (cost[i][j] < minVal) {
              minVal = cost[i][j];
            }
          }
        }

        debugLog('Calculations', `Smallest uncovered value: ${minVal}`);

        if (minVal === Infinity) {
          debugLog('Errors', 'Could not find minimum uncovered value, breaking loop');
          break;
        }

        // Add minValue to every covered row
        for (let i = 0; i < m; i++) {
          if (rowCovered[i]) {
            for (let j = 0; j < n; j++) {
              cost[i][j] += minVal;
            }
          }
        }

        // Subtract minValue from every uncovered column
        for (let j = 0; j < n; j++) {
          if (!colCovered[j]) {
            for (let i = 0; i < m; i++) {
              cost[i][j] -= minVal;
            }
          }
        }

        continue; // Continue the main loop
      }

      debugLog('Calculations', `Found uncovered zero at [${row}][${col}]`);
      
      // Prime the found uncovered zero
      primeMatrix[row][col] = true;

      // Check if there is a starred zero in the row
      let starCol = -1;
      for (let j = 0; j < n; j++) {
        if (starMatrix[row][j]) {
          starCol = j;
          break;
        }
      }

      if (starCol === -1) {
        // No starred zero in the row, we have an augmenting path
        debugLog('Calculations', `No starred zero in row ${row}, constructing augmenting path`);
        
        // Construct the augmenting path
        const path = [[row, col]];

        let pathComplete = false;
        let pathIteration = 0;
        const MAX_PATH_ITERATIONS = 100; // Safety check
        
        while (!pathComplete && pathIteration < MAX_PATH_ITERATIONS) {
          pathIteration++;
          
          // Find a starred zero in the column
          let starRow = -1;
          for (let i = 0; i < m; i++) {
            if (starMatrix[i][path[path.length - 1][1]]) {
              starRow = i;
              break;
            }
          }

          if (starRow === -1) {
            debugLog('Calculations', 'No starred zero in column, path is complete');
            pathComplete = true;
            break;
          }

          // Add the starred zero to the path
          path.push([starRow, path[path.length - 1][1]]);
          debugLog('Calculations', `Added starred zero at [${starRow}][${path[path.length - 2][1]}] to path`);

          // Find a primed zero in the row
          let primeCol = -1;
          for (let j = 0; j < n; j++) {
            if (primeMatrix[starRow][j]) {
              primeCol = j;
              break;
            }
          }

          // Add the primed zero to the path
          path.push([starRow, primeCol]);
          debugLog('Calculations', `Added primed zero at [${starRow}][${primeCol}] to path`);
        }

        if (pathIteration >= MAX_PATH_ITERATIONS) {
          debugLog('Errors', 'Path construction exceeded maximum iterations, breaking');
          break;
        }

        // Augment the path - convert starred to non-starred and vice versa
        debugLog('Calculations', `Augmenting path with ${path.length} elements`);
        for (let i = 0; i < path.length; i++) {
          const [pathRow, pathCol] = path[i];

          if (starMatrix[pathRow][pathCol]) {
            debugLog('Calculations', `Unstarring [${pathRow}][${pathCol}]`);
            starMatrix[pathRow][pathCol] = false;
          } else {
            debugLog('Calculations', `Starring [${pathRow}][${pathCol}]`);
            starMatrix[pathRow][pathCol] = true;
          }
        }

        // Reset primeMatrix and coverings
        debugLog('Calculations', 'Resetting prime matrix and coverings');
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            primeMatrix[i][j] = false;
          }
        }

        rowCovered.fill(false);
        colCovered.fill(false);

        // Cover columns with starred zeros
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            if (starMatrix[i][j]) {
              colCovered[j] = true;
            }
          }
        }
        
        debugLog('Calculations', `After augmentation, columns covered: ${countCoveredCols()}`);
      } else {
        // There is a starred zero in the row
        debugLog('Calculations', `Found starred zero at [${row}][${starCol}] in same row`);
        debugLog('Calculations', `Covering row ${row} and uncovering column ${starCol}`);
        
        // Cover the row and uncover the column with the starred zero
        rowCovered[row] = true;
        colCovered[starCol] = false;
      }
    }

    if (iteration >= MAX_ITERATIONS) {
      debugLog('Errors', 'Hungarian algorithm exceeded maximum iterations');
    }

    // Extract the assignments from the starred zeros
    const hungarianAssignments = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (starMatrix[i][j]) {
          hungarianAssignments.push([i, j]);
          debugLog('Calculations', `Final assignment: row ${i} -> column ${j}`);
        }
      }
    }

    debugLog('Calculations', `Hungarian algorithm completed with ${hungarianAssignments.length} assignments`);
    return hungarianAssignments;
  } catch (error) {
    debugLog('Errors', 'Error in Hungarian algorithm', { error });
    return [];
  }
}

// ==============================================
// PLAYER STATISTICS CALCULATION FUNCTIONS
// ==============================================

// Helper function to determine if home player selects blind based on game number and coin flip
function shouldHomePlayerSelectBlind(game, wonCoinFlip) {
  if (!game) {
    debugLog('Errors', 'Invalid game parameter in shouldHomePlayerSelectBlind', { game, wonCoinFlip });
    return false;
  }
  
  const gameNumber = parseInt(game.replace("game", ""));
  
  if (isNaN(gameNumber) || gameNumber < 1 || gameNumber > 4) {
    debugLog('Errors', 'Invalid game number in shouldHomePlayerSelectBlind', { game, gameNumber, wonCoinFlip });
    return false;
  }
  
  // Determine if home player selects blind based on coin flip and game number
  const result = wonCoinFlip ? 
    (gameNumber === 2 || gameNumber === 4) : 
    (gameNumber === 1 || gameNumber === 3);
  
  debugLog('Calculations', `Should home player select blind for game ${gameNumber}?`, { 
    game, 
    wonCoinFlip, 
    result 
  });
  
  return result;
}

// Helper to normalize player names for case-insensitive comparison
function normalizePlayerName(name) {
  if (!name) {
    debugLog('Errors', 'Null or undefined name in normalizePlayerName');
    return '';
  }
  
  if (typeof name !== 'string') {
    debugLog('Errors', 'Non-string name in normalizePlayerName', { name, type: typeof name });
    return '';
  }
  
  const normalized = name.toLowerCase().trim();
  return normalized;
}

// Calculate win rates by handicap level with detailed logging
function calculateWinRatesByHandicap(playerName, allMatches) {
  debugLog('Calculations', 'Calculating win rates by handicap', { 
    playerName, 
    matchesCount: allMatches?.length 
  });
  
  // Input validation
  if (!playerName || !allMatches || !Array.isArray(allMatches)) {
    debugLog('Errors', 'Invalid inputs for calculateWinRatesByHandicap', { 
      playerName, 
      allMatchesValid: Boolean(allMatches && Array.isArray(allMatches)) 
    });
    return { lower: 0, equal: 0, higher: 0 };
  }
  
  // Normalize player name for comparison
  const playerNameNorm = normalizePlayerName(playerName);
  
  // Filter to matches involving this player
  const playerMatches = allMatches.filter(match => {
    try {
      const homePlayerNorm = normalizePlayerName(match.homePlayer);
      const awayPlayerNorm = normalizePlayerName(match.awayPlayer);
      const isPlayerInMatch = (homePlayerNorm === playerNameNorm || awayPlayerNorm === playerNameNorm);
      const isNotForfeit = !match.forfeit;
      
      return isPlayerInMatch && isNotForfeit;
    } catch (error) {
      debugLog('Errors', 'Error filtering player matches', { match, error });
      return false;
    }
  });
  
  debugLog('Calculations', `Found ${playerMatches.length} matches for player ${playerName}`);

  // Initialize result categories
  const results = {
    lower: { wins: 0, total: 0 },  // Player has lower handicap than opponent
    equal: { wins: 0, total: 0 },  // Player has equal handicap to opponent
    higher: { wins: 0, total: 0 }, // Player has higher handicap than opponent
  };

  // Process each match
  playerMatches.forEach((match, index) => {
    try {
      let playerHCP, opponentHCP, isWinner;

      // Determine if player was home or away
      if (normalizePlayerName(match.homePlayer) === playerNameNorm) {
        playerHCP = match.homeHCP;
        opponentHCP = match.awayHCP;
        isWinner = normalizePlayerName(match.winner) === playerNameNorm;
        
        debugLog('Calculations', `Match ${index}: ${playerName} was HOME player`, { 
          opponent: match.awayPlayer,
          playerHCP,
          opponentHCP,
          won: isWinner
        });
      } else {
        playerHCP = match.awayHCP;
        opponentHCP = match.homeHCP;
        isWinner = normalizePlayerName(match.winner) === playerNameNorm;
        
        debugLog('Calculations', `Match ${index}: ${playerName} was AWAY player`, { 
          opponent: match.homePlayer,
          playerHCP,
          opponentHCP,
          won: isWinner
        });
      }

      // Categorize by handicap comparison
      let category;
      if (playerHCP < opponentHCP) {
        category = "lower";
      } else if (playerHCP === opponentHCP) {
        category = "equal";
      } else {
        category = "higher";
      }
      
      debugLog('Calculations', `Match ${index} category: ${category}`);

      // Update results
      results[category].total++;
      if (isWinner) {
        results[category].wins++;
      }
    } catch (error) {
      debugLog('Errors', `Error processing match ${index}`, { match, error });
    }
  });

  // Calculate win rates
  const winRates = {};
  for (const [category, data] of Object.entries(results)) {
    winRates[category] = data.total > 0 ? data.wins / data.total : 0;
    
    debugLog('Calculations', `${playerName} ${category} handicap win rate:`, { 
      wins: data.wins,
      total: data.total,
      rate: winRates[category]
    });
  }

  return winRates;
}

// Get head-to-head record between two players with detailed logging
function getHeadToHeadRecord(player1, player2, allMatches) {
  debugLog('Calculations', 'Getting head-to-head record', { 
    player1, 
    player2, 
    matchesCount: allMatches?.length 
  });
  
  // Input validation
  if (!player1 || !player2 || !allMatches || !Array.isArray(allMatches)) {
    debugLog('Errors', 'Invalid inputs for getHeadToHeadRecord', { 
      player1: Boolean(player1), 
      player2: Boolean(player2),
      allMatchesValid: Boolean(allMatches && Array.isArray(allMatches)) 
    });
    return { player1Wins: 0, player2Wins: 0, totalMatches: 0 };
  }
  
  // Normalize player names for comparison
  const player1Norm = normalizePlayerName(player1);
  const player2Norm = normalizePlayerName(player2);
  
  // Filter to direct matches between these players
  const directMatches = allMatches.filter(match => {
    try {
      const homePlayerNorm = normalizePlayerName(match.homePlayer);
      const awayPlayerNorm = normalizePlayerName(match.awayPlayer);
      
      const isDirectMatch = 
        (homePlayerNorm === player1Norm && awayPlayerNorm === player2Norm) ||
        (homePlayerNorm === player2Norm && awayPlayerNorm === player1Norm);
      
      const isNotForfeit = !match.forfeit;
      
      return isDirectMatch && isNotForfeit;
    } catch (error) {
      debugLog('Errors', 'Error filtering direct matches', { match, error });
      return false;
    }
  });
  
  debugLog('Calculations', `Found ${directMatches.length} direct matches between ${player1} and ${player2}`);

  // Initialize head-to-head record
  const record = {
    player1Wins: 0,
    player2Wins: 0,
    totalMatches: directMatches.length,
  };

  // Count wins for each player
  directMatches.forEach((match, index) => {
    try {
      const winnerNorm = normalizePlayerName(match.winner);
      
      if (winnerNorm === player1Norm) {
        record.player1Wins++;
        debugLog('Calculations', `Match ${index}: ${player1} won`);
      } else if (winnerNorm === player2Norm) {
        record.player2Wins++;
        debugLog('Calculations', `Match ${index}: ${player2} won`);
      } else {
        debugLog('Errors', `Match ${index} has invalid winner: ${match.winner}`);
      }
    } catch (error) {
      debugLog('Errors', `Error processing match ${index}`, { match, error });
    }
  });
  
  debugLog('Calculations', 'Head-to-head record summary', { 
    player1Wins: record.player1Wins,
    player2Wins: record.player2Wins,
    totalMatches: record.totalMatches,
    player1WinRate: record.totalMatches > 0 ? record.player1Wins / record.totalMatches : 0
  });

  return record;
}

// Calculate win probability between two players with detailed logging
function calculateWinProbability(player1, player2, teamStats, allMatches) {
  debugLog('Calculations', 'Calculating win probability', { 
    player1, 
    player2, 
    teamStatsCount: teamStats?.length,
    matchesCount: allMatches?.length
  });
  
  // Input validation
  if (!player1 || !player2 || !teamStats || !allMatches) {
    debugLog('Errors', 'Invalid inputs for calculateWinProbability', { 
      player1: Boolean(player1), 
      player2: Boolean(player2),
      teamStatsValid: Boolean(teamStats), 
      allMatchesValid: Boolean(allMatches) 
    });
    return 0.5; // Default to 50% if inputs are invalid
  }

  // Find player stats in team stats array
  const player1Stats = teamStats.find((p) => p.name === player1);
  const player2Stats = teamStats.find((p) => p.name === player2);
  
  debugLog('Calculations', 'Player stats found', { 
    player1StatsFound: Boolean(player1Stats),
    player2StatsFound: Boolean(player2Stats)
  });

  if (!player1Stats || !player2Stats) {
    debugLog('Errors', 'Could not find stats for one or both players', {
      player1: player1,
      player2: player2,
      player1Stats: Boolean(player1Stats),
      player2Stats: Boolean(player2Stats)
    });
    return 0.5; // Default to 50% if player stats not found
  }

  // Step 1: Base probability from raw win percentages
  let p1WinPercentage = 0.5;
  let p2WinPercentage = 0.5;

  try {
    p1WinPercentage = parseFloat(player1Stats.winPercentage) / 100;
    p2WinPercentage = parseFloat(player2Stats.winPercentage) / 100;
    
    debugLog('Calculations', 'Base win percentages', { 
      player1WinPct: p1WinPercentage,
      player2WinPct: p2WinPercentage
    });
  } catch (e) {
    debugLog('Errors', 'Error parsing win percentages', { 
      player1WinPct: player1Stats.winPercentage,
      player2WinPct: player2Stats.winPercentage,
      error: e
    });
  }

  // Step 2: Adjust for historical head-to-head performance
  const h2h = getHeadToHeadRecord(player1, player2, allMatches);
  let h2hAdjustment = 0;

  if (h2h.totalMatches > 0) {
    const h2hWinRate = h2h.player1Wins / h2h.totalMatches;
    // Weight the head-to-head results (more weight if more matches played)
    const h2hWeight = Math.min(h2h.totalMatches / 5, 0.5); // Cap at 50% influence
    h2hAdjustment = (h2hWinRate - 0.5) * h2hWeight;
    
    debugLog('Calculations', 'Head-to-head adjustment', { 
      h2hWinRate,
      h2hWeight,
      h2hAdjustment
    });
  } else {
    debugLog('Calculations', 'No head-to-head history, no adjustment');
  }

  // Step 3: Calculate performance against similar handicap levels
  const p1VsHandicap = calculateWinRatesByHandicap(player1, allMatches);
  const p2VsHandicap = calculateWinRatesByHandicap(player2, allMatches);
  
  debugLog('Calculations', 'Handicap performance stats', { 
    player1Handicap: player1Stats.handicap,
    player2Handicap: player2Stats.handicap,
    player1VsHandicap: p1VsHandicap,
    player2VsHandicap: p2VsHandicap
  });

  // Get the handicap difference and determine handicap category
  const handicapDiff = player1Stats.handicap - player2Stats.handicap;
  let handicapCategory = '';
  
  if (handicapDiff < 0) {
    handicapCategory = 'higher'; // Player 1 has lower handicap, plays against higher
  } else if (handicapDiff > 0) {
    handicapCategory = 'lower';  // Player 1 has higher handicap, plays against lower
  } else {
    handicapCategory = 'equal';  // Equal handicaps
  }
  
  debugLog('Calculations', 'Handicap difference analysis', { 
    handicapDiff,
    handicapCategory
  });
  
  // Calculate the handicap adjustment
  let handicapCategoryAdjustment = 0;
  if (handicapDiff < 0) {
    // Player 1 is playing against a higher handicapped player
    handicapCategoryAdjustment =
      ((p1VsHandicap.higher || 0) - (p2VsHandicap.lower || 0)) * 0.1;
  } else if (handicapDiff > 0) {
    // Player 1 is playing against a lower handicapped player
    handicapCategoryAdjustment =
      ((p1VsHandicap.lower || 0) - (p2VsHandicap.higher || 0)) * 0.1;
  } else {
    // Equal handicaps
    handicapCategoryAdjustment =
      ((p1VsHandicap.equal || 0) - (p2VsHandicap.equal || 0)) * 0.1;
  }
  
  debugLog('Calculations', 'Handicap category adjustment', { 
    handicapCategory,
    handicapCategoryAdjustment
  });

  // Step 4: Combine all factors and ensure probability is between 0.05 and 0.95
  const baselineProbability = 0.5;
  const rawWinPercentageWeight = 0.3;
  
  const combinedProbability = 
    baselineProbability + 
    (p1WinPercentage - p2WinPercentage) * rawWinPercentageWeight +
    h2hAdjustment +
    handicapCategoryAdjustment;
  
  // Clamp to reasonable range
  const finalProbability = Math.max(0.05, Math.min(0.95, combinedProbability));
  
  debugLog('Calculations', 'Final win probability calculation', { 
    baselineProbability,
    winPercentageContribution: (p1WinPercentage - p2WinPercentage) * rawWinPercentageWeight,
    h2hAdjustment,
    handicapCategoryAdjustment,
    combinedProbability,
    finalProbability: finalProbability
  });

  return finalProbability;
}

// ==============================================
// PLAYER SELECTION OPTIMIZATION FUNCTIONS
// ==============================================

// Find the optimal player selection for responding to an opponent's choice
function findBestResponsePlayer(gameNumber, opponentPlayer, availableHomePlayers, availableAwayPlayers, selectedPlayers, teamStats, filteredMatches) {
  debugLog('Calculations', 'Finding best response player', { 
    gameNumber, 
    opponentPlayer: opponentPlayer?.name,
    availableHomePlayers: availableHomePlayers?.map(p => p.name),
    availableAwayPlayersCount: availableAwayPlayers?.length,
    filteredMatchesCount: filteredMatches?.length,
    selectedGames: Object.keys(selectedPlayers || {}).filter(game => 
      selectedPlayers[game]?.home || selectedPlayers[game]?.away
    )
  });
  
  // Validate inputs
  if (!opponentPlayer || !opponentPlayer.name) {
    debugLog('Errors', 'Invalid opponent player in findBestResponsePlayer');
    return null;
  }
  
  if (!availableHomePlayers || !Array.isArray(availableHomePlayers) || availableHomePlayers.length === 0) {
    debugLog('Errors', 'No available home players in findBestResponsePlayer');
    return null;
  }
  
  if (!teamStats || !allMatches) {
    debugLog('Errors', 'Missing teamStats or allMatches in findBestResponsePlayer');
    return null;
  }
  
  // If only one player left, return them
  if (availableHomePlayers.length === 1) {
    debugLog('Calculations', 'Only one home player available, returning them', {
      player: availableHomePlayers[0]?.name
    });
    return availableHomePlayers[0];
  }
  
  // Get remaining away players (excluding the selected opponent)
  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== opponentPlayer.name);
  
  debugLog('Calculations', 'Remaining away players', {
    count: remainingAwayPlayers.length,
    players: remainingAwayPlayers.map(p => p.name)
  });
  
  // If this is the last game (no remaining opponents), simply find best direct matchup
  if (remainingAwayPlayers.length === 0) {
    debugLog('Calculations', 'Last game (no remaining opponents), finding best direct matchup');
    
    let bestPlayer = null;
    let highestWinProb = -1;
    
    for (const homePlayer of availableHomePlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        opponentPlayer.name,
        teamStats,
        filteredMatches 
      );
      
      debugLog('Calculations', `Direct matchup: ${homePlayer.name} vs ${opponentPlayer.name}`, {
        winProbability: winProb
      });
      
      if (winProb > highestWinProb) {
        highestWinProb = winProb;
        bestPlayer = homePlayer;
        
        debugLog('Calculations', `New best direct matchup: ${homePlayer.name}`, {
          winProbability: winProb
        });
      }
    }
    
    debugLog('Calculations', `Best direct matchup found: ${bestPlayer?.name}`, {
      winProbability: highestWinProb
    });
    
    return bestPlayer;
  }
  
  // For all other cases, use Hungarian algorithm to find optimal assignment
  
  // Create cost matrix for Hungarian algorithm
  debugLog('Calculations', 'Creating cost matrix for Hungarian algorithm');
  
  const costMatrix = [];
  const homePlayerNameMap = {}; // Maps row indices to home player objects
  
  for (let i = 0; i < availableHomePlayers.length; i++) {
    const homePlayer = availableHomePlayers[i];
    homePlayerNameMap[i] = homePlayer;
    
    const row = [];
    
    // First column is for the current opponent player
    const winProb = calculateWinProbability(
      homePlayer.name,
      opponentPlayer.name,
      teamStats,
      state.filteredMatches
    );
    
    debugLog('Calculations', `Cost matrix: ${homePlayer.name} vs ${opponentPlayer.name}`, {
      winProbability: winProb,
      cost: 1 - winProb
    });
    
    row.push(1 - winProb); // Convert to cost
    
    // Add columns for remaining opponent players
    for (const awayPlayer of remainingAwayPlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        state.filteredMatches
      );
      
      debugLog('Calculations', `Cost matrix: ${homePlayer.name} vs ${awayPlayer.name}`, {
        winProbability: winProb,
        cost: 1 - winProb
      });
      
      row.push(1 - winProb);
    }
    
    costMatrix.push(row);
  }
  
  // Add dummy rows if needed to make the matrix square
  const requiredRows = 1 + remainingAwayPlayers.length;
  
  if (costMatrix.length < requiredRows) {
    debugLog('Calculations', `Adding ${requiredRows - costMatrix.length} dummy rows to cost matrix`);
    
    while (costMatrix.length < requiredRows) {
      const dummyRow = Array(requiredRows).fill(1); // High cost for dummy assignments
      costMatrix.push(dummyRow);
    }
  }
  
  // Log the cost matrix
  debugLog('Calculations', 'Final cost matrix for Hungarian algorithm', {
    rows: costMatrix.length,
    columns: costMatrix[0]?.length,
    matrix: costMatrix
  });
  
  // Run Hungarian algorithm
  debugLog('Calculations', 'Running Hungarian algorithm');
  const assignments = hungarianOptimalAssignment(costMatrix);
  
  debugLog('Calculations', 'Hungarian algorithm assignments', {
    assignmentsCount: assignments.length,
    assignments
  });
  
  // Find which home player is assigned to the current opponent (column 0)
  let selectedHomePlayerIndex = -1;
  
  for (const [rowIdx, colIdx] of assignments) {
    if (colIdx === 0 && rowIdx < availableHomePlayers.length) {
      selectedHomePlayerIndex = rowIdx;
      debugLog('Calculations', `Found assignment for opponent: row ${rowIdx}`);
      break;
    }
  }
  
  // If no assignment found, fallback to best direct matchup
  if (selectedHomePlayerIndex === -1) {
    debugLog('Calculations', 'No assignment found for opponent, falling back to direct matchup');
    
    let bestPlayer = null;
    let highestWinProb = -1;
    
    for (const homePlayer of availableHomePlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        opponentPlayer.name,
        teamStats,
        state.filteredMatches
      );
      
      debugLog('Calculations', `Fallback direct matchup: ${homePlayer.name} vs ${opponentPlayer.name}`, {
        winProbability: winProb
      });
      
      if (winProb > highestWinProb) {
        highestWinProb = winProb;
        bestPlayer = homePlayer;
        
        debugLog('Calculations', `New best fallback matchup: ${homePlayer.name}`, {
          winProbability: winProb
        });
      }
    }
    
    debugLog('Calculations', `Fallback matchup found: ${bestPlayer?.name}`, {
      winProbability: highestWinProb
    });
    
    return bestPlayer;
  }
  
  // Return the selected home player
  const selectedPlayer = homePlayerNameMap[selectedHomePlayerIndex];
  
  debugLog('Calculations', `Best response player found: ${selectedPlayer?.name}`, {
    rowIndex: selectedHomePlayerIndex
  });
  
  return selectedPlayer;
}

// Find optimal blind selection player
function findOptimalBlindPlayer(availableHomePlayers, availableAwayPlayers, teamStats, filteredMatches) {
  debugLog('Calculations', 'Finding optimal blind player', { 
    availableHomePlayers: availableHomePlayers?.map(p => p.name),
    availableAwayPlayersCount: availableAwayPlayers?.length,
    filteredMatchesCount: filteredMatches?.length
  });
  
  // Validate inputs
  if (!availableHomePlayers || !Array.isArray(availableHomePlayers) || availableHomePlayers.length === 0) {
    debugLog('Errors', 'No available home players in findOptimalBlindPlayer');
    return null;
  }
  
  if (!availableAwayPlayers || !Array.isArray(availableAwayPlayers) || availableAwayPlayers.length === 0) {
    debugLog('Errors', 'No available away players in findOptimalBlindPlayer');
    return null;
  }
  
  if (!teamStats || !allMatches) {
    debugLog('Errors', 'Missing teamStats or allMatches in findOptimalBlindPlayer');
    return null;
  }
  
  // If only one player left, return them
  if (availableHomePlayers.length === 1) {
    debugLog('Calculations', 'Only one home player available, returning them', {
      player: availableHomePlayers[0]?.name
    });
    return availableHomePlayers[0];
  }
  
  // If no opponents left, return any player (shouldn't happen)
  if (availableAwayPlayers.length === 0) {
    debugLog('Errors', 'No available away players, returning first home player');
    return availableHomePlayers[0];
  }
  
  // Use Hungarian algorithm for the main optimization
  
  // Create cost matrix for all remaining player combinations
  debugLog('Calculations', 'Creating cost matrix for blind player optimization');
  
  const costMatrix = [];
  const homePlayerNameMap = {}; // Maps row indices to home player objects
  
  for (let i = 0; i < availableHomePlayers.length; i++) {
    const homePlayer = availableHomePlayers[i];
    homePlayerNameMap[i] = homePlayer;
    
    const row = [];
    
    for (const awayPlayer of availableAwayPlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        state.filteredMatches
      );
      
      debugLog('Calculations', `Blind cost matrix: ${homePlayer.name} vs ${awayPlayer.name}`, {
        winProbability: winProb,
        cost: 1 - winProb
      });
      
      row.push(1 - winProb); // Convert to cost
    }
    
    costMatrix.push(row);
  }
  
  // Add dummy rows if needed to make the matrix square
  const requiredRows = availableAwayPlayers.length;
  
  if (costMatrix.length < requiredRows) {
    debugLog('Calculations', `Adding ${requiredRows - costMatrix.length} dummy rows to blind cost matrix`);
    
    while (costMatrix.length < requiredRows) {
      const dummyRow = Array(requiredRows).fill(1); // High cost for dummy assignments
      costMatrix.push(dummyRow);
    }
  }
  
  // Log the cost matrix
  debugLog('Calculations', 'Final blind cost matrix for Hungarian algorithm', {
    rows: costMatrix.length,
    columns: costMatrix[0]?.length,
    matrix: costMatrix
  });
  
  // Run Hungarian algorithm
  debugLog('Calculations', 'Running Hungarian algorithm for blind selection');
  const assignments = hungarianOptimalAssignment(costMatrix);
  
  debugLog('Calculations', 'Hungarian algorithm assignments for blind selection', {
    assignmentsCount: assignments.length,
    assignments
  });
  
  // Since this is a blind selection, we need a different approach to interpret the results
  // Calculate average win probability for each player against all opponents
  debugLog('Calculations', 'Calculating average win probabilities for blind selection');
  
  const playerScores = {};
  
  for (const homePlayer of availableHomePlayers) {
    const winProbabilities = [];
    
    for (const awayPlayer of availableAwayPlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        state.filteredMatches
      );
      
      winProbabilities.push(winProb);
      
      debugLog('Calculations', `Blind win prob: ${homePlayer.name} vs ${awayPlayer.name}`, {
        winProbability: winProb
      });
    }
    
    // Calculate average win probability
    const avgWinProb = winProbabilities.reduce((sum, prob) => sum + prob, 0) / 
      Math.max(1, winProbabilities.length);
    
    playerScores[homePlayer.name] = {
      player: homePlayer,
      score: avgWinProb,
      winProbabilities
    };
    
    debugLog('Calculations', `Blind average win probability for ${homePlayer.name}`, {
      averageWinProbability: avgWinProb,
      individualProbabilities: winProbabilities
    });
  }
  
  // Find the player with the highest average win probability
  let bestPlayer = null;
  let bestScore = -1;
  
  for (const [playerName, data] of Object.entries(playerScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestPlayer = data.player;
      
      debugLog('Calculations', `New best blind player: ${playerName}`, {
        score: data.score
      });
    }
  }
  
  debugLog('Calculations', `Optimal blind player found: ${bestPlayer?.name}`, {
    score: bestScore
  });
  
  return bestPlayer;
}

// ==============================================
// CORE APP COMPONENT
// ==============================================

function App() {
  debugLog('Rendering', 'Rendering App component');
  
  // State management with useReducer
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Create a ref to prevent multiple async operations
  const processingRef = useRef(null);
  
  // Extract commonly used state values for readability
  const {
    loading, loadingError, isCalculating, 
    showInfoPopup, showDebugPanel,
    currentStep, previousStep, wonCoinFlip,
    allMatches, teamStats, teams,
    selectedHomeTeam, selectedAwayTeam, 
    homeTeamPlayers, awayTeamPlayers,
    availableHomePlayers, availableAwayPlayers,
    optimalPlayer, calculatedBestPlayer, lastAutoSelectedPlayer,
    selectedPlayers, isProcessingSelection, processingGame
  } = state;
  
  // ==============================================
  // DATA LOADING
  // ==============================================
  
  // Load data on component mount
  useEffect(() => {
    debugLog('StateChanges', 'App mounted, loading data');
    loadData();
  }, []);
  
  // Function to load data from JSON files
  const loadData = async () => {
    try {
      debugLog('StateChanges', 'Starting data loading');
      dispatch({ type: ACTION_TYPES.LOAD_DATA_START });
      
      // Get base path for data files
      const basePath = import.meta.env.BASE_URL || '';
      debugLog('StateChanges', `Using base path: ${basePath}`);
      
      // Load matches data
      debugLog('StateChanges', 'Fetching matches data');
      const matchesResponse = await fetch(`${basePath}data/all_matches.json`);
      
      if (!matchesResponse.ok) {
        throw new Error(`Failed to fetch matches: ${matchesResponse.status} ${matchesResponse.statusText}`);
      }
      
      // Load team stats data
      debugLog('StateChanges', 'Fetching team stats data');
      const statsResponse = await fetch(`${basePath}data/team_stats.json`);
      
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.status} ${statsResponse.statusText}`);
      }
      
      // Parse the JSON responses
      debugLog('StateChanges', 'Parsing JSON responses');
      const matchesData = await matchesResponse.json();
      const statsData = await statsResponse.json();
      
      debugLog('StateChanges', 'Data loaded successfully', {
        matchesCount: matchesData.length,
        statsCount: statsData.length
      });
      
      // Filter out forfeit matches
      const validMatches = matchesData.filter(match => !match.forfeit);
      
      debugLog('StateChanges', `Filtered ${matchesData.length - validMatches.length} forfeit matches`);
      
      // Transform stats to add displayName
      const transformedStats = statsData.map(player => ({
        ...player,
        displayName: formatName(player.name)
      }));
      
      // Extract unique team names
      const uniqueTeams = [...new Set(statsData.map(player => player.team))].sort();
      
      debugLog('StateChanges', `Found ${uniqueTeams.length} unique teams`);
      
      // Update state with all loaded data
      dispatch({
        type: ACTION_TYPES.LOAD_DATA_SUCCESS,
        payload: {
          allMatches: validMatches,
          teamStats: transformedStats,
          teams: uniqueTeams
        }
      });
      
      // Create an initial state snapshot after loading
      dispatch({
        type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
        payload: { label: 'Initial Data Loaded' }
      });
      
    } catch (error) {
      debugLog('Errors', 'Error loading data', { error });
      
      dispatch({
        type: ACTION_TYPES.LOAD_DATA_ERROR,
        payload: error.message || 'Failed to load data'
      });
    }
  };
  
  // ==============================================
  // UI EVENT HANDLERS
  // ==============================================
  
  // Toggle info popup
  const handleToggleInfoPopup = (value) => {
    debugLog('StateChanges', `Toggling info popup to ${value !== undefined ? value : !showInfoPopup}`);
    
    dispatch({
      type: ACTION_TYPES.TOGGLE_INFO_POPUP,
      payload: value
    });
  };
  
  // Toggle debug panel
  const handleToggleDebugPanel = (value) => {
    debugLog('StateChanges', `Toggling debug panel to ${value !== undefined ? value : !showDebugPanel}`);
    
    dispatch({
      type: ACTION_TYPES.TOGGLE_DEBUG_PANEL,
      payload: value
    });
  };
  
  // ==============================================
  // GAME FLOW LOGIC
  // ==============================================
  
  // Calculate optimal player for blind selection
  useEffect(() => {
    if (
      currentStep.startsWith("game-") && 
      !currentStep.includes("opponent") && 
      !currentStep.includes("best-player") && 
      !currentStep.includes("manual-selection") &&
      !isCalculating && 
      availableHomePlayers.length > 0 && 
      availableAwayPlayers.length > 0
    ) {
      debugLog('StateChanges', 'Auto-calculating optimal player for current step', {
        currentStep,
        homePlayersCount: availableHomePlayers.length,
        awayPlayersCount: availableAwayPlayers.length
      });
      
      calculateOptimalPlayer();
    }
  }, [currentStep, availableHomePlayers, availableAwayPlayers, isCalculating]);

  // Calculate the optimal player for blind selection
  const calculateOptimalPlayer = () => {
    debugLog('Calculations', 'Starting optimal player calculation');
    
    dispatch({ type: ACTION_TYPES.SET_CALCULATING, payload: true });
    
    // Use Promise to better control the asynchronous flow
    const calculateAsync = async () => {
      try {
        // Slight delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        debugLog('Calculations', 'Finding optimal blind player');
        const optimalPlayer = findOptimalBlindPlayer(
          availableHomePlayers,
          availableAwayPlayers,
          teamStats,
          state.filteredMatches
        );
        
        debugLog('Calculations', 'Optimal player calculation complete', {
          playerFound: Boolean(optimalPlayer),
          playerName: optimalPlayer?.name
        });
        
        dispatch({ 
          type: ACTION_TYPES.SET_OPTIMAL_PLAYER, 
          payload: optimalPlayer 
        });
      } catch (error) {
        debugLog('Errors', 'Error calculating optimal player', { error });
        dispatch({ type: ACTION_TYPES.SET_CALCULATING, payload: false });
      }
    };
    
    calculateAsync();
  };

  // Function to handle team selection
  const handleTeamSelection = () => {
  debugLog('StateChanges', 'Handling team selection', {
    selectedHomeTeam,
    selectedAwayTeam,
    homeTeamPlayersCount: homeTeamPlayers.length,
    awayTeamPlayersCount: awayTeamPlayers.length,
    filteredMatchesCount: state.filteredMatches.length  // Log filtered matches count
  });
    
    if (!selectedHomeTeam || !selectedAwayTeam) {
      debugLog('Errors', 'Cannot proceed with team selection - teams not selected');
      alert("Please select both teams first.");
      return;
    }

    // Save a state snapshot before proceeding
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: 'Teams Selected' }
    });

    // Initialize available players from selected teams
    dispatch({
      type: ACTION_TYPES.SET_AVAILABLE_PLAYERS,
      payload: {
        home: [...homeTeamPlayers],
        away: [...awayTeamPlayers]
      }
    });

    // Navigate to coin flip step
    dispatch({ type: ACTION_TYPES.SET_CURRENT_STEP, payload: "coin-flip" });
  };

  // Function to handle coin flip result
  const handleCoinFlipResult = (won) => {
    debugLog('StateChanges', `Handling coin flip result: ${won ? 'Won' : 'Lost'}`);
    
    dispatch({ type: ACTION_TYPES.SET_COIN_FLIP, payload: won });
    
    // Save a state snapshot
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: `Coin Flip: ${won ? 'Won' : 'Lost'}` }
    });
    
    // Navigate to first game
    dispatch({ type: ACTION_TYPES.SET_CURRENT_STEP, payload: "game-1" });
  };
  
  // Helper to safely navigate to the next step
  const navigateToStep = (step) => {
    debugLog('StateChanges', `Navigating from ${currentStep} to ${step}`);
    
    dispatch({ type: ACTION_TYPES.SET_CURRENT_STEP, payload: step });
  };
  
  // Helper to get the game number from the current step
  const getCurrentGameNumber = () => {
    if (!currentStep || !currentStep.startsWith('game-')) {
      return null;
    }
    
    const match = currentStep.match(/^game-(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    return null;
  };

  // ==============================================
  // PLAYER SELECTION FUNCTIONS
  // ==============================================
  
  // Function to select player for a game
  const selectPlayerForGame = (game, team, player) => {
    // Skip if already processing or invalid inputs
    if (processingRef.current) {
      debugLog('StateChanges', `Already processing a selection (${processingRef.current}), skipping new selection`, {
        game,
        team,
        playerName: player?.name
      });
      return;
    }
    
    if (!game || !team || !player || !player.name) {
      debugLog('Errors', 'Invalid parameters in selectPlayerForGame', {
        game,
        team,
        player
      });
      return;
    }
    
    // Set processing flag
    processingRef.current = game;
    debugLog('StateChanges', `Selecting ${team} player for ${game}: ${player.name}`, {
      processingFlag: processingRef.current
    });
    
    // Create a snapshot before making changes
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: `Before Player Selection: ${game} ${team}` }
    });
    
    // Dispatch the player selection action
    dispatch({ 
      type: ACTION_TYPES.SELECT_PLAYER, 
      payload: { game, team, player } 
    });
    
    // Determine next step based on game flow
    const processSelection = async () => {
      try {
        // Small delay to allow the state update to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const gameNumber = parseInt(game.replace("game", ""), 10);
        debugLog('StateChanges', `Determining next step after selecting ${team} player for game ${gameNumber}`, {
          wonCoinFlip,
          team
        });
        
        // Check if we need to go to opponent selection next
        const shouldGoToOpponentSelection = 
          (team === "home") && 
          shouldHomePlayerSelectBlind(game, wonCoinFlip);
        
        if (shouldGoToOpponentSelection) {
          debugLog('StateChanges', `Going to opponent selection for game ${gameNumber}`);
          navigateToStep(`game-${gameNumber}-opponent`);
        } else {
          // Move to next game or summary
          const nextStep = gameNumber < 4 ? `game-${gameNumber + 1}` : "summary";
          debugLog('StateChanges', `Moving to next step: ${nextStep}`);
          navigateToStep(nextStep);
        }
      } catch (error) {
        debugLog('Errors', 'Error in processSelection', { error });
      } finally {
        // Always clear the processing flag
        processingRef.current = null;
      }
    };
    
    // Start the async process
    processSelection();
  };
  
  // Function to handle opponent selection and find best response
  const handleOpponentSelection = (gameNum, player) => {
    // Skip if already processing or invalid inputs
    if (processingRef.current) {
      debugLog('StateChanges', `Already processing an opponent selection (${processingRef.current}), skipping`, {
        gameNum,
        playerName: player?.name
      });
      return;
    }
    
    if (!player || !player.name) {
      debugLog('Errors', 'Invalid opponent player in handleOpponentSelection', {
        gameNum,
        player
      });
      return;
    }
    
    const game = `game${gameNum}`;
    
    // Set processing flag
    processingRef.current = game;
    debugLog('StateChanges', `Handling opponent selection for Game ${gameNum}: ${player.name}`, {
      processingFlag: processingRef.current
    });
    
    // Start calculating
    dispatch({ type: ACTION_TYPES.SET_CALCULATING, payload: true });
    
    // Create a snapshot before making changes
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: `Before Opponent Selection: Game ${gameNum}` }
    });
    
    // Select opponent player
    dispatch({ 
      type: ACTION_TYPES.SELECT_PLAYER, 
      payload: { game, team: "away", player } 
    });
    
    // Process opponent selection asynchronously
    const processOpponentSelection = async () => {
      try {
        // Small delay to allow the state update to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        debugLog('Calculations', `Finding best response player for game ${gameNum} against ${player.name}`);
        
        // Get fresh state values to ensure we're using the latest
        const latestState = appReducer(state, { type: ACTION_TYPES.LOG_STATE });
        
        const bestPlayer = findBestResponsePlayer(
          gameNum,
          player,
          latestState.availableHomePlayers,
          latestState.availableAwayPlayers,
          latestState.selectedPlayers,
          latestState.teamStats,
          latestState.filteredMatches
        );
        
        if (!bestPlayer) {
          debugLog('Errors', 'No best player found in handleOpponentSelection');
          alert("Could not find optimal player. Please try again.");
          dispatch({ type: ACTION_TYPES.SET_CALCULATING, payload: false });
          processingRef.current = null;
          return;
        }
        
        debugLog('Calculations', `Found best player: ${bestPlayer.name} for game ${gameNum}`);
        
        // Calculate win probability for logging
        const winProbability = calculateWinProbability(
          bestPlayer.name,
          player.name,
          latestState.teamStats,
          latestState.filteredMatches
        );
        
        // Should we confirm with the user before selecting?
        const shouldConfirmWithUser = 
          (wonCoinFlip && (gameNum === 1 || gameNum === 3)) || 
          (!wonCoinFlip && (gameNum === 2 || gameNum === 4));
        
        if (shouldConfirmWithUser) {
          debugLog('StateChanges', `Requesting confirmation for player ${bestPlayer.name} in game ${gameNum}`);
          
          // Ask user to confirm the calculated best player
          dispatch({ 
            type: ACTION_TYPES.SET_BEST_PLAYER, 
            payload: bestPlayer 
          });
          
          // Navigate to confirmation screen
          navigateToStep(`game-${gameNum}-best-player`);
        } else {
          // Auto-select the best player
          debugLog('StateChanges', `Auto-selecting best player ${bestPlayer.name} for game ${gameNum}`);
          
          // Store this auto-selection for reference
          dispatch({
            type: ACTION_TYPES.SET_AUTO_SELECTED_PLAYER,
            payload: {
              player: bestPlayer,
              opponent: player,
              gameNumber: gameNum,
              winProbability
            }
          });
          
          // Select the player
          dispatch({ 
            type: ACTION_TYPES.SELECT_PLAYER, 
            payload: { game, team: "home", player: bestPlayer } 
          });
          
          // Move to next game or summary
          await new Promise(resolve => setTimeout(resolve, 50));
          const nextStep = gameNum < 4 ? `game-${gameNum + 1}` : "summary";
          
          debugLog('StateChanges', `Moving to next step after auto-selection: ${nextStep}`);
          navigateToStep(nextStep);
        }
      } catch (error) {
        debugLog('Errors', 'Error in handleOpponentSelection', { error });
        alert("An error occurred while finding the optimal player.");
      } finally {
        dispatch({ type: ACTION_TYPES.SET_CALCULATING, payload: false });
        processingRef.current = null;
      }
    };
    
    // Start the asynchronous process
    processOpponentSelection();
  };
  
  // Function to confirm a calculated best player
  const confirmBestPlayer = (gameNum) => {
    // Skip if already processing or no best player calculated
    if (processingRef.current) {
      debugLog('StateChanges', `Already processing (${processingRef.current}), skipping confirmBestPlayer`, {
        gameNum
      });
      return;
    }
    
    if (!calculatedBestPlayer) {
      debugLog('Errors', 'No calculatedBestPlayer in confirmBestPlayer', {
        gameNum
      });
      alert("No player selected. Please try again.");
      return;
    }
    
    debugLog('StateChanges', `Confirming best player: ${calculatedBestPlayer.name} for game ${gameNum}`);
    
    // Lock processing
    processingRef.current = `confirm-game-${gameNum}`;
    
    // Create a snapshot before confirming
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: `Before Confirming Best Player: Game ${gameNum}` }
    });
    
    // Use the main select player function
    const game = `game${gameNum}`;
    selectPlayerForGame(game, "home", calculatedBestPlayer);
    
    // Reset calculated best player
    dispatch({ type: ACTION_TYPES.SET_BEST_PLAYER, payload: null });
    
    // Clear processing lock
    processingRef.current = null;
  };
  
  // Function to choose a different player instead of the calculated best
  const chooseDifferentPlayer = (gameNum) => {
    debugLog('StateChanges', `Choosing to select different player for game ${gameNum}`);
    
    // Reset calculated best player
    dispatch({ type: ACTION_TYPES.SET_BEST_PLAYER, payload: null });
    
    // Navigate to manual selection
    navigateToStep(`game-${gameNum}-manual-selection`);
  };
  
  // Function to reset everything and start over
  const handleReset = () => {
    debugLog('StateChanges', 'Resetting app state');
    
    // Create a final snapshot before reset
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: 'Before Reset' }
    });
    
    // Reset the app state
    dispatch({ type: ACTION_TYPES.RESET_APP });
  };
  
  // ==============================================
  // DEBUG UTILITIES
  // ==============================================
  
  // Function to log the current state
  const logState = () => {
    dispatch({ type: ACTION_TYPES.LOG_STATE });
  };
  
  // Toggle debug panel visibility
  const toggleDebugPanel = () => {
    dispatch({ 
      type: ACTION_TYPES.TOGGLE_DEBUG_PANEL,
      payload: !showDebugPanel
    });
  };
  
  // Create a state snapshot
  const createStateSnapshot = (label) => {
    dispatch({
      type: ACTION_TYPES.CREATE_STATE_SNAPSHOT,
      payload: { label: label || `Manual Snapshot at ${new Date().toISOString()}` }
    });
  };
  
  // Revert to a state snapshot
  const revertToSnapshot = (indexOrLabel) => {
    dispatch({
      type: ACTION_TYPES.REVERT_TO_SNAPSHOT,
      payload: typeof indexOrLabel === 'number' 
        ? { index: indexOrLabel }
        : { label: indexOrLabel }
    });
  };

  // ==============================================
  // RENDER FUNCTIONS FOR GAME SCREENS
  // ==============================================
  
  // Render function for best player confirmation stage
  const renderBestPlayerConfirmation = (gameNum) => {
    debugLog('Rendering', `Rendering best player confirmation screen for game ${gameNum}`);
    
    const game = `game${gameNum}`;
    const opponent = selectedPlayers[game]?.away;
    
    // Validate data
    if (!calculatedBestPlayer || !opponent) {
      debugLog('Errors', 'Missing data for best player confirmation screen', {
        calculatedBestPlayer: Boolean(calculatedBestPlayer),
        opponent: Boolean(opponent)
      });
      
      return (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>
          <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
            <h2 className="text-xl font-semibold mb-4">Data Loading Error</h2>
            <p className="mb-4">
              Could not load player data for confirmation. Some required information is missing.
            </p>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
                onClick={() => navigateToStep(`game-${gameNum}`)}
              >
                Go Back
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                onClick={handleReset}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Calculate win probability
    const winProb = calculateWinProbability(
      calculatedBestPlayer.name,
      opponent.name,
      teamStats,
      state.filteredMatches
    );
    
    debugLog('Rendering', 'Win probability for confirmation screen', {
      player: calculatedBestPlayer.name,
      opponent: opponent.name,
      probability: winProb
    });
    
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
        <InfoPopup 
          isOpen={showInfoPopup} 
          onClose={() => handleToggleInfoPopup(false)} 
        />
        
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Optimal Player for Game {gameNum}</h2>
          <p className="mb-4">
            Based on the Hungarian algorithm, your optimal player to match against {opponent.displayName} is:
          </p>
          
          <div className="p-4 border rounded-lg bg-green-50 border-green-500 mb-6">
            <div className="font-medium text-lg">{calculatedBestPlayer.displayName}</div>
            <div className="text-sm text-gray-600">
              HCP: {calculatedBestPlayer.handicap}
            </div>
            <div className="mt-2">
              <div className="text-sm">Win probability against {opponent.displayName}:</div>
              <div className="flex items-center mt-1">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${winProb * 100}%` }}
                  ></div>
                </div>
                <span className="font-medium">
                  {Math.round(winProb * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => confirmBestPlayer(gameNum)}
            >
              Confirm This Player
            </button>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => chooseDifferentPlayer(gameNum)}
            >
              Choose Different Player
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={handleReset}
          >
            Start Over
          </button>
        </div>
        
        {/* Debug button (only visible when debug is enabled) */}
        {DEBUG.enabled && (
          <div className="fixed bottom-4 left-4">
            <button
              className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
              onClick={toggleDebugPanel}
            >
              {showDebugPanel ? 'Hide' : 'Show'} Debug
            </button>
          </div>
        )}
        
        {/* Debug panel */}
        <DebugPanel state={state} visible={showDebugPanel} />
      </div>
    );
  };

  // Render function for manual player selection screen
  const renderManualPlayerSelection = (gameNum) => {
    debugLog('Rendering', `Rendering manual player selection screen for game ${gameNum}`);
    
    const game = `game${gameNum}`;
    const opponent = selectedPlayers[game]?.away;
    
    // Validate data
    if (!opponent) {
      debugLog('Errors', 'Missing opponent data for manual selection screen', {
        opponent: Boolean(opponent)
      });
      
      return (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>
          <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
            <h2 className="text-xl font-semibold mb-4">Missing Opponent Data</h2>
            <p className="mb-4">
              Cannot find opponent information for this game.
            </p>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={handleReset}
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
        <InfoPopup 
          isOpen={showInfoPopup} 
          onClose={() => handleToggleInfoPopup(false)} 
        />
        
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Player for Game {gameNum}</h2>
          <p className="mb-4">
            Choose which player you want to match against {opponent.displayName}:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableHomePlayers.map((player) => {
              const winProb = calculateWinProbability(
                player.name,
                opponent.name,
                teamStats,
                state.filteredMatches
              );
              
              debugLog('Rendering', `Manual selection option: ${player.name} vs ${opponent.name}`, {
                probability: winProb
              });
              
              return (
                <div
                  key={`select-player-${player.name}`}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                  onClick={() => selectPlayerForGame(game, "home", player)}
                >
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-gray-600">
                    HCP: {player.handicap}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm">Win probability:</div>
                    <div className="flex items-center mt-1">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${winProb * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">
                        {Math.round(winProb * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={handleReset}
          >
            Start Over
          </button>
        </div>
        
        {/* Debug button (only visible when debug is enabled) */}
        {DEBUG.enabled && (
          <div className="fixed bottom-4 left-4">
            <button
              className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
              onClick={toggleDebugPanel}
            >
              {showDebugPanel ? 'Hide' : 'Show'} Debug
            </button>
          </div>
        )}
        
        {/* Debug panel */}
        <DebugPanel state={state} visible={showDebugPanel} />
      </div>
    );
  };

// Render function for game selection screens
  const renderGameSelection = (gameNum) => {
    debugLog('Rendering', `Rendering game selection screen for game ${gameNum}`);
    
    const game = `game${gameNum}`;
    const weSelectBlind = shouldHomePlayerSelectBlind(game, wonCoinFlip);
    
    // Show last auto-selected player notification if available
    const showLastSelection = lastAutoSelectedPlayer && 
                              lastAutoSelectedPlayer.gameNumber === gameNum - 1;
    
    debugLog('Rendering', `Game ${gameNum} selection info`, {
      weSelectBlind,
      wonCoinFlip,
      showLastSelection: Boolean(showLastSelection),
      lastAutoSelection: lastAutoSelectedPlayer?.player?.name
    });
    
    if (weSelectBlind) {
      // We put up blind
      return (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
          <InfoPopup 
            isOpen={showInfoPopup} 
            onClose={() => handleToggleInfoPopup(false)} 
          />
          
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          {showLastSelection && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
              <h3 className="font-medium text-green-800 mb-2">
                Auto-Selected Player for Previous Game
              </h3>
              <p>
                <span className="font-semibold">{lastAutoSelectedPlayer.player.displayName}</span> was 
                automatically chosen as the best match against {lastAutoSelectedPlayer.opponent.displayName} with 
                a {Math.round(lastAutoSelectedPlayer.winProbability * 100)}% win probability.
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game {gameNum} Selection</h2>
            <p className="mb-4">
              You need to put up a player blind for Game {gameNum}.
            </p>
            
            {isCalculating ? (
              <div className="text-center py-4">
                <p>Finding optimal player...</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Recommended player based on Hungarian algorithm analysis:{" "}
                  <span className="font-bold">
                    {optimalPlayer?.displayName || "Calculating..."}
                  </span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableHomePlayers.map((player) => {
                    // Calculate average win probability against all opponents
                    const avgWinProb = availableAwayPlayers.reduce((sum, opponent) => {
                      return sum + calculateWinProbability(
                        player.name,
                        opponent.name,
                        teamStats,
                        allMatches
                      );
                    }, 0) / Math.max(1, availableAwayPlayers.length);
                    
                    debugLog('Rendering', `Blind selection option: ${player.name}`, {
                      avgWinProbability: avgWinProb,
                      isOptimal: player.name === optimalPlayer?.name
                    });
                    
                    return (
                      <div
                        key={`select-player-${player.name}`}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                          player.name === optimalPlayer?.name
                            ? "bg-green-50 border-green-500"
                            : ""
                        }`}
                        onClick={() => selectPlayerForGame(game, "home", player)}
                      >
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          HCP: {player.handicap}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm">Average win probability:</div>
                          <div className="flex items-center mt-1">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${avgWinProb * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium">
                              {Math.round(avgWinProb * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={handleReset}
            >
              Start Over
            </button>
          </div>
          
          {/* Debug button (only visible when debug is enabled) */}
          {DEBUG.enabled && (
            <div className="fixed bottom-4 left-4">
              <button
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
                onClick={toggleDebugPanel}
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          )}
          
          {/* Debug panel */}
          <DebugPanel state={state} visible={showDebugPanel} />
        </div>
      );
    } else {
      // Opponent puts up blind, we respond
      return (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
          <InfoPopup 
            isOpen={showInfoPopup} 
            onClose={() => handleToggleInfoPopup(false)} 
          />
          
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          {showLastSelection && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
              <h3 className="font-medium text-green-800 mb-2">
                Auto-Selected Player for Previous Game
              </h3>
              <p>
                <span className="font-semibold">{lastAutoSelectedPlayer.player.displayName}</span> was 
                automatically chosen as the best match against {lastAutoSelectedPlayer.opponent.displayName} with 
                a {Math.round(lastAutoSelectedPlayer.winProbability * 100)}% win probability.
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game {gameNum} Selection</h2>
            <p className="mb-4">
              The opponent selects a player for Game {gameNum}. Which player did they choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => {
                debugLog('Rendering', `Opponent blind selection option: ${player.name}`, {
                  handicap: player.handicap,
                  wins: player.wins,
                  losses: player.losses,
                  winPercentage: player.winPercentage
                });
                
                return (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => handleOpponentSelection(gameNum, player)}
                  >
                    <div className="font-medium">{player.displayName}</div>
                    <div className="text-sm text-gray-600">
                      HCP: {player.handicap}
                    </div>
                    <div className="mt-2">
                      <div className="text-sm">Record:</div>
                      <div className="text-sm mt-1">
                        {player.wins}-{player.losses} ({player.winPercentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={handleReset}
            >
              Start Over
            </button>
          </div>
          
          {/* Debug button (only visible when debug is enabled) */}
          {DEBUG.enabled && (
            <div className="fixed bottom-4 left-4">
              <button
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
                onClick={toggleDebugPanel}
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          )}
          
          {/* Debug panel */}
          <DebugPanel state={state} visible={showDebugPanel} />
        </div>
      );
    }
  };
  
  // Render summary screen with detailed logging
  const renderSummary = () => {
    debugLog('Rendering', 'Rendering summary screen');
    
    // Calculate overall win probability
    const matchupsWithProbability = Object.entries(selectedPlayers)
      .filter(([_, matchup]) => matchup.home && matchup.away)
      .map(([gameKey, matchup]) => {
        const gameNum = parseInt(gameKey.replace('game', ''));
        const winProbability = calculateWinProbability(
          matchup.home.name,
          matchup.away.name,
          teamStats,
          allMatches
        );
        
        debugLog('Calculations', `Summary win probability for game ${gameNum}`, {
          homePlayer: matchup.home.name,
          awayPlayer: matchup.away.name,
          winProbability
        });
        
        return {
          gameNum,
          ...matchup,
          winProbability,
        };
      });

    // Sort by game number
    matchupsWithProbability.sort((a, b) => a.gameNum - b.gameNum);
    
    const overallWinPercentage =
      matchupsWithProbability.length > 0
        ? Math.round(
            (matchupsWithProbability.reduce(
              (sum, m) => sum + m.winProbability,
              0,
            ) /
              matchupsWithProbability.length) *
              100,
          )
        : 0;
    
    debugLog('Calculations', 'Overall win percentage calculated', { 
      overallWinPercentage,
      matchupsCount: matchupsWithProbability.length,
      individualProbabilities: matchupsWithProbability.map(m => ({
        game: m.gameNum,
        probability: m.winProbability
      }))
    });
        
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
        <InfoPopup 
          isOpen={showInfoPopup} 
          onClose={() => handleToggleInfoPopup(false)} 
        />
        
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Final Matchups</h2>
          <p className="mb-6">
            Here are the final player matchups based on the coin flip and
            selection process:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Game</th>
                  <th className="p-2 text-left">Our Player</th>
                  <th className="p-2 text-left">Opponent</th>
                  <th className="p-2 text-left">Win Probability</th>
                  <th className="p-2 text-left">Handicap</th>
                </tr>
              </thead>
              <tbody>
                {matchupsWithProbability.map((matchup) => (
                  <tr key={`summary-game-${matchup.gameNum}`} className="border-t">
                    <td className="p-2">Game {matchup.gameNum}</td>
                    <td className="p-2">{matchup.home.displayName}</td>
                    <td className="p-2">{matchup.away.displayName}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${matchup.winProbability * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(matchup.winProbability * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {matchup.home.handicap} vs {matchup.away.handicap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Overall Team Win Probability</h3>
            <div className="text-lg font-bold">{overallWinPercentage}%</div>
            <p className="text-sm mt-2">
              {overallWinPercentage > 50
                ? "Your team has a favorable advantage!"
                : "The matchup is challenging, but you still have a chance."}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleReset}
          >
            Start Over
          </button>
          {DEBUG.enabled && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={() => createStateSnapshot('Final Summary')}
            >
              Save State Snapshot
            </button>
          )}
        </div>
        
        {/* Debug button (only visible when debug is enabled) */}
        {DEBUG.enabled && (
          <div className="fixed bottom-4 left-4">
            <button
              className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
              onClick={toggleDebugPanel}
            >
              {showDebugPanel ? 'Hide' : 'Show'} Debug
            </button>
          </div>
        )}
        
        {/* Debug panel */}
        <DebugPanel state={state} visible={showDebugPanel} />
      </div>
    );
  };

  // Main component return with conditional rendering based on current step
  return (
    <ErrorBoundary>
      {loading && (
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>
          <div className="animate-pulse flex space-x-4 justify-center items-center">
            <div className="rounded-full bg-blue-200 h-3 w-3"></div>
            <div className="rounded-full bg-blue-300 h-3 w-3"></div>
            <div className="rounded-full bg-blue-400 h-3 w-3"></div>
            <span className="text-gray-600">Loading data...</span>
          </div>
        </div>
      )}
      
      {loadingError && (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>
          <div className="bg-red-50 p-6 rounded-lg mb-8 border border-red-300">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Error Loading Data</h2>
            <p className="mb-4 text-red-600">
              {loadingError}
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={loadData}
            >
              Retry
            </button>
          </div>
          
          {DEBUG.enabled && (
            <div className="mt-8 p-4 border border-gray-300 rounded text-left max-w-3xl mx-auto">
              <h3 className="font-medium mb-2">Debug Information</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify({ error: loadingError }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {!loading && !loadingError && currentStep === "team-selection" && (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
          <InfoPopup 
            isOpen={showInfoPopup} 
            onClose={() => handleToggleInfoPopup(false)} 
          />
          
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>
          <div className="text-xs text-gray-500 mb-4">
            Found {teams.length} teams and {teamStats.length} players
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Our Team</h2>
              <div className="mb-4">
                <label className="block text-neutral-600 mb-1">
                  Select Your Team
                </label>
                <SearchableDropdown
                  id="home-team-dropdown"
                  options={teams}
                  value={selectedHomeTeam}
                  onChange={(team) => {
                    debugLog('StateChanges', 'Home team selected', { team });
                    dispatch({
                      type: ACTION_TYPES.SET_SELECTED_TEAMS,
                      payload: { homeTeam: team, awayTeam: selectedAwayTeam }
                    });
                  }}
                  placeholder="Type to search teams..."
                />
              </div>

              {homeTeamPlayers.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">
                    Available Players: {homeTeamPlayers.length}
                  </h3>
                  <div className="border rounded p-2 mb-4 max-h-64 overflow-y-auto">
                    {homeTeamPlayers.map((player) => (
                      <div
                        key={`home-player-${player.name}`}
                        className="p-3 mb-2 rounded-lg border hover:bg-blue-50 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{player.displayName}</span>
                          <span className="text-sm py-1 px-2 pr-3 rounded-full text-primary-dark">
                            HCP: {player.handicap}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <span className="mr-1">Record:</span>
                          <span className="font-medium">
                            {player.wins}-{player.losses}
                          </span>
                          <span className="mx-1">•</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-1">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${parseInt(player.winPercentage)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              ({player.winPercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Opponent Team</h2>
              <div className="mb-4">
                <label className="block text-neutral-600 mb-1">
                  Select Opponent Team
                </label>
                <SearchableDropdown
                  id="away-team-dropdown"
                  options={teams}
                  value={selectedAwayTeam}
                  onChange={(team) => {
                    debugLog('StateChanges', 'Away team selected', { team });
                    dispatch({
                      type: ACTION_TYPES.SET_SELECTED_TEAMS,
                      payload: { homeTeam: selectedHomeTeam, awayTeam: team }
                    });
                  }}
                  placeholder="Type to search opponent teams..."
                />
              </div>

              {awayTeamPlayers.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">
                    Available Players: {awayTeamPlayers.length}
                  </h3>
                  <div className="border rounded p-2 mb-4 max-h-64 overflow-y-auto">
                    {awayTeamPlayers.map((player) => (
                      <div
                        key={`away-player-${player.name}`}
                        className="p-3 mb-2 rounded-lg border hover:bg-blue-50 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{player.displayName}</span>
                          <span className="text-sm py-1 px-2 pr-3 rounded-full text-primary-dark">
                            HCP: {player.handicap}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <span className="mr-1">Record:</span>
                          <span className="font-medium">
                            {player.wins}-{player.losses}
                          </span>
                          <span className="mx-1">•</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-1">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${parseInt(player.winPercentage)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              ({player.winPercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
              disabled={!selectedHomeTeam || !selectedAwayTeam}
              onClick={handleTeamSelection}
            >
              Continue to Coin Flip
            </button>
          </div>
          
          {/* Debug button (only visible when debug is enabled) */}
          {DEBUG.enabled && (
            <div className="fixed bottom-4 left-4">
              <button
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
                onClick={toggleDebugPanel}
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          )}
          
          {/* Debug panel */}
          <DebugPanel state={state} visible={showDebugPanel} />
        </div>
      )}
      
      {!loading && !loadingError && currentStep === "coin-flip" && (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => handleToggleInfoPopup(true)} />
          <InfoPopup 
            isOpen={showInfoPopup} 
            onClose={() => handleToggleInfoPopup(false)} 
          />
          
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Coin Flip Result</h2>
            <p className="mb-4">
              The coin flip determines who selects first and the order of player
              selection. Who won the coin flip?
            </p>

            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => handleCoinFlipResult(true)}
              >
                We Won
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => handleCoinFlipResult(false)}
              >
                Opponent Won
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={handleReset}
            >
              Start Over
            </button>
          </div>
          
          {/* Debug button (only visible when debug is enabled) */}
          {DEBUG.enabled && (
            <div className="fixed bottom-4 left-4">
              <button
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-60 hover:opacity-100"
                onClick={toggleDebugPanel}
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          )}
          
          {/* Debug panel */}
          <DebugPanel state={state} visible={showDebugPanel} />
        </div>
      )}
      
      {!loading && !loadingError && currentStep.match(/^game-\d-best-player$/) && (
        renderBestPlayerConfirmation(parseInt(currentStep.split('-')[1]))
      )}
      
      {!loading && !loadingError && currentStep.match(/^game-\d-manual-selection$/) && (
        renderManualPlayerSelection(parseInt(currentStep.split('-')[1]))
      )}
      
      {!loading && !loadingError && currentStep.match(/^game-\d-opponent$/) && (
        renderOpponentSelectionScreen(parseInt(currentStep.split('-')[1]))
      )}
      
      {!loading && !loadingError && currentStep.match(/^game-\d$/) && !currentStep.includes('-') && (
        renderGameSelection(parseInt(currentStep.split('-')[1]))
      )}
      
      {!loading && !loadingError && currentStep === "summary" && (
        renderSummary()
      )}
      
      {!loading && !loadingError && 
       !["team-selection", "coin-flip", "summary"].includes(currentStep) && 
       !currentStep.match(/^game-\d(-opponent|-best-player|-manual-selection)?$/) && (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Pool Team Stats Analyzer</h1>
          <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
            <h2 className="text-xl font-semibold mb-4">Unknown Application State</h2>
            <p className="mb-4">
              The application is in an unknown state: <code className="bg-gray-100 px-2 py-1 rounded">{currentStep}</code>
            </p>
            <p className="mb-4 text-sm">
              This may indicate a bug in the state transition logic.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
              onClick={handleReset}
            >
              Reset Application
            </button>
          </div>
          
          {DEBUG.enabled && (
            <div className="mt-8 p-4 border border-gray-300 rounded text-left max-w-3xl mx-auto">
              <h3 className="font-medium mb-2">Debug Information</h3>
              <div className="mb-3">
                <button 
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded mr-2"
                  onClick={logState}
                >
                  Log Current State
                </button>
                <button 
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded"
                  onClick={() => createStateSnapshot('Error State')}
                >
                  Create Error Snapshot
                </button>
              </div>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify({ 
                  currentStep, 
                  previousStep,
                  availableSteps: [
                    "team-selection", 
                    "coin-flip", 
                    `game-${getCurrentGameNumber()}`,
                    `game-${getCurrentGameNumber()}-opponent`,
                    `game-${getCurrentGameNumber()}-best-player`,
                    `game-${getCurrentGameNumber()}-manual-selection`
                  ]
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </ErrorBoundary>
  );
}
export default App;
