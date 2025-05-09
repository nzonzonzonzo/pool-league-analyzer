import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";
import ThemeToggle from './ThemeToggle'; 

// Name formatting utility - more economical implementation
const formatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  const parts = fullName.split(' ');
  return parts.length <= 1 ? fullName : 
    `${parts.slice(0, parts.length - 1).join(' ')} ${parts[parts.length - 1][0]}.`;
};

// Theme state
const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme ? savedTheme === 'dark' : true; // Default to dark mode
});

// Apply theme to document
useEffect(() => {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
}, [darkMode]);

// Toggle theme function
const toggleDarkMode = () => {
  setDarkMode(prev => !prev);
};

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
const FloatingInfoButton = ({ onClick }) => (
  <button 
    className="fixed top-4 right-4 z-40 p-0 bg-transparent hover:opacity-80 transition-opacity duration-200"
    onClick={onClick}
    aria-label="Show Information"
  >
    <LightbulbIcon />
  </button>
);

const InfoPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-white">How Win Probabilities and Optimal Matchups Are Calculated</h2>
          <button className="bg-transparent hover:opacity-80 transition-opacity duration-200" onClick={onClose}>
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

// Enhanced SearchableDropdown with minimum character requirement and fixed toLowerCase
function SearchableDropdown({ options, value, onChange, placeholder, minChars = 2 }) {
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


// Helper function to make a matrix copy
function makeMatrixCopy(matrix) {
  return matrix.map(row => [...row]);
}

// Hungarian algorithm implementation
function hungarianOptimalAssignment(matrix) {
  if (!matrix || matrix.length === 0) return [];
  
  try {
    // Make a deep copy of the cost matrix
    const cost = makeMatrixCopy(matrix);
    const m = cost.length;
    const n = cost[0].length;
    
    // Step 1: Subtract row minima
    for (let i = 0; i < m; i++) {
      // Find minimum value in row
      let minVal = Infinity;
      for (let j = 0; j < n; j++) {
        if (typeof cost[i][j] !== "number" || isNaN(cost[i][j])) {
          cost[i][j] = 0.5; // Default to 0.5 if invalid
        }

        if (cost[i][j] < minVal) {
          minVal = cost[i][j];
        }
      }

      // Subtract minimum from each element in the row
      if (minVal !== Infinity) {
        for (let j = 0; j < n; j++) {
          cost[i][j] -= minVal;
        }
      }
    }

// Step 2: Subtract column minima
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
        for (let i = 0; i < m; i++) {
          cost[i][j] -= minVal;
        }
      }
    }

    // Initialize key data structures for the Hungarian algorithm
    const rowCovered = Array(m).fill(false);
    const colCovered = Array(n).fill(false);
    const starMatrix = Array(m)
      .fill()
      .map(() => Array(n).fill(false));
    const primeMatrix = Array(m)
      .fill()
      .map(() => Array(n).fill(false));

    // Find all zeros and star them if possible
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (Math.abs(cost[i][j]) < 0.0001 && !rowCovered[i] && !colCovered[j]) {
          starMatrix[i][j] = true;
          rowCovered[i] = true;
          colCovered[j] = true;
        }
      }
    }

    // Reset row and column covered arrays
    rowCovered.fill(false);
    colCovered.fill(false);

    // Cover all columns containing starred zeros
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (starMatrix[i][j]) {
          colCovered[j] = true;
        }
      }
    }

    // Main algorithm loop
    while (colCovered.some((col) => !col)) {
      // Find an uncovered zero
      let row = -1,
        col = -1;
      for (let i = 0; i < m; i++) {
        if (rowCovered[i]) continue;

        for (let j = 0; j < n; j++) {
          if (colCovered[j]) continue;

          if (Math.abs(cost[i][j]) < 0.0001) {
            row = i;
            col = j;
            break;
          }
        }

        if (row !== -1) break;
      }

      // If no uncovered zero found, create new zeros by adjusting the matrix
      if (row === -1) {
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
        // Construct the augmenting path
        const path = [[row, col]];

        while (true) {
          // Find a starred zero in the column
          let starRow = -1;
          for (let i = 0; i < m; i++) {
            if (starMatrix[i][path[path.length - 1][1]]) {
              starRow = i;
              break;
            }
          }

          if (starRow === -1) break; // No starred zero found, path is complete

          // Add the starred zero to the path
          path.push([starRow, path[path.length - 1][1]]);

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
        }

        // Augment the path - convert starred to non-starred and vice versa
        for (let i = 0; i < path.length; i++) {
          const [pathRow, pathCol] = path[i];

          if (starMatrix[pathRow][pathCol]) {
            starMatrix[pathRow][pathCol] = false;
          } else {
            starMatrix[pathRow][pathCol] = true;
          }
        }

        // Reset primeMatrix and coverings
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
      } else {
        // There is a starred zero in the row
        // Cover the row and uncover the column with the starred zero
        rowCovered[row] = true;
        colCovered[starCol] = false;
      }
    }

    // Extract the assignments from the starred zeros
    const hungarianAssignments = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (starMatrix[i][j]) {
          hungarianAssignments.push([i, j]);
        }
      }
    }

    return hungarianAssignments;
  } catch (error) {
    console.error("Error in Hungarian algorithm:", error);
    return [];
  }
}

// Efficient function to create a shallow copy of an object
function cloneSelections(selections) {
  const clone = {};
  for (const gameKey in selections) {
    clone[gameKey] = { 
      home: selections[gameKey].home, 
      away: selections[gameKey].away 
    };
  }
  return clone;
}

function isHomeSelectingBlind(gameNum, wonCoinFlip) {
  // For WON coin flip: Home blind for Games 2, 3; Away blind for Games 1, 4
  // For LOST coin flip: Home blind for Games 1, 4; Away blind for Games 2, 3
  return (wonCoinFlip && (gameNum === 2 || gameNum === 3)) || 
         (!wonCoinFlip && (gameNum === 1 || gameNum === 4));
}

// Helper function to determine if home player selects blind based on game number and coin flip
function shouldHomePlayerSelectBlind(game, wonCoinFlip) {
  const gameNumber = parseInt(game.replace("game", ""));
  return wonCoinFlip ? 
    (gameNumber === 2 || gameNumber === 4) : 
    (gameNumber === 1 || gameNumber === 3);
}

// Calculate win rates by handicap level
function calculateWinRatesByHandicap(playerName, allMatches) {
  // Normalize names for case-insensitive comparison
  const normalizePlayerName = (name) => name?.toLowerCase().trim() || "";
  const playerNameNorm = normalizePlayerName(playerName);

  const playerMatches = allMatches.filter(
    (match) =>
      (normalizePlayerName(match.homePlayer) === playerNameNorm ||
        normalizePlayerName(match.awayPlayer) === playerNameNorm) &&
      !match.forfeit,
  );

  const results = {
    lower: { wins: 0, total: 0 },
    equal: { wins: 0, total: 0 },
    higher: { wins: 0, total: 0 },
  };

  playerMatches.forEach((match) => {
    let playerHCP, opponentHCP, isWinner;

    if (normalizePlayerName(match.homePlayer) === playerNameNorm) {
      playerHCP = match.homeHCP;
      opponentHCP = match.awayHCP;
      isWinner = normalizePlayerName(match.winner) === playerNameNorm;
    } else {
      playerHCP = match.awayHCP;
      opponentHCP = match.homeHCP;
      isWinner = normalizePlayerName(match.winner) === playerNameNorm;
    }

    let category;
    if (playerHCP < opponentHCP) {
      category = "lower";
    } else if (playerHCP === opponentHCP) {
      category = "equal";
    } else {
      category = "higher";
    }

    results[category].total++;
    if (isWinner) {
      results[category].wins++;
    }
  });

  // Calculate win rates
  const winRates = {};
  for (const [category, data] of Object.entries(results)) {
    winRates[category] = data.total > 0 ? data.wins / data.total : 0;
  }

  return winRates;
}

// Get head-to-head record between two players
function getHeadToHeadRecord(player1, player2, allMatches) {
  // Normalize names for case-insensitive comparison
  const normalizePlayerName = (name) => name?.toLowerCase().trim() || "";
  const player1Norm = normalizePlayerName(player1);
  const player2Norm = normalizePlayerName(player2);

  const directMatches = allMatches.filter((match) => {
    const homePlayerNorm = normalizePlayerName(match.homePlayer);
    const awayPlayerNorm = normalizePlayerName(match.awayPlayer);

    return (
      ((homePlayerNorm === player1Norm && awayPlayerNorm === player2Norm) ||
        (homePlayerNorm === player2Norm && awayPlayerNorm === player1Norm)) &&
      !match.forfeit
    );
  });

  const record = {
    player1Wins: 0,
    player2Wins: 0,
    totalMatches: directMatches.length,
  };

  directMatches.forEach((match) => {
    const winnerNorm = normalizePlayerName(match.winner);
    if (winnerNorm === player1Norm) {
      record.player1Wins++;
    } else if (winnerNorm === player2Norm) {
      record.player2Wins++;
    }
  });

  return record;
}

// Function to calculate win probability between two players
function calculateWinProbability(player1, player2, teamStats, allMatches) {
  // Find player stats
  const player1Stats = teamStats.find((p) => p.name === player1);
  const player2Stats = teamStats.find((p) => p.name === player2);

  if (!player1Stats || !player2Stats) return 0.5;

  // Base probability from raw win percentages
  let p1WinPercentage = 0.5;
  let p2WinPercentage = 0.5;

  try {
    p1WinPercentage = parseFloat(player1Stats.winPercentage) / 100;
    p2WinPercentage = parseFloat(player2Stats.winPercentage) / 100;
  } catch (e) {
    console.error("Error parsing win percentages:", e);
  }

  // Adjust for historical head-to-head performance
  const h2h = getHeadToHeadRecord(player1, player2, allMatches);
  let h2hAdjustment = 0;

  if (h2h.totalMatches > 0) {
    const h2hWinRate = h2h.player1Wins / h2h.totalMatches;
    // Weight the head-to-head results (more weight if more matches played)
    const h2hWeight = Math.min(h2h.totalMatches / 5, 0.5); // Cap at 50% influence
    h2hAdjustment = (h2hWinRate - 0.5) * h2hWeight;
  }

  // Calculate performance against similar handicap levels
  const p1VsHandicap = calculateWinRatesByHandicap(player1, allMatches);
  const p2VsHandicap = calculateWinRatesByHandicap(player2, allMatches);

  // Get the handicap difference, but only use it to select the appropriate category
  const handicapDiff = player1Stats.handicap - player2Stats.handicap;
  
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

  // Combine all factors and ensure probability is between 0.05 and 0.95
  return Math.max(0.05, Math.min(0.95, 0.5 +
    (p1WinPercentage - p2WinPercentage) * 0.3 +
    h2hAdjustment +
    handicapCategoryAdjustment));
}

// Find the optimal player selection for responding to an opponent's choice
function findBestResponsePlayer(gameNumber, opponentPlayer, availableHomePlayers, availableAwayPlayers, selectedPlayers, teamStats, allMatches) {
  // If only one player left, return them
  if (availableHomePlayers.length === 1) {
    return availableHomePlayers[0];
  }
  
  // Get remaining away players (excluding the selected opponent)
  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== opponentPlayer.name);
  
  // If this is the last game (no remaining opponents), simply find best matchup
  if (remainingAwayPlayers.length === 0) {
    let bestPlayer = null;
    let highestWinProb = -1;
    
    for (const homePlayer of availableHomePlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        opponentPlayer.name,
        teamStats,
        allMatches
      );
      
      if (winProb > highestWinProb) {
        highestWinProb = winProb;
        bestPlayer = homePlayer;
      }
    }
    
    return bestPlayer;
  }
  
  // Create cost matrix for Hungarian algorithm
  const costMatrix = [];
  
  for (const homePlayer of availableHomePlayers) {
    const row = [];
    
    // First column is for the current opponent player
    const winProb = calculateWinProbability(
      homePlayer.name,
      opponentPlayer.name,
      teamStats,
      allMatches
    );
    row.push(1 - winProb); // Convert to cost
    
    // Add columns for remaining opponent players
    for (const awayPlayer of remainingAwayPlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        allMatches
      );
      row.push(1 - winProb);
    }
    
    costMatrix.push(row);
  }
  
  // Add dummy rows if needed to make the matrix square
  while (costMatrix.length < 1 + remainingAwayPlayers.length) {
    const dummyRow = Array(1 + remainingAwayPlayers.length).fill(1); // High cost for dummy assignments
    costMatrix.push(dummyRow);
  }
  
  // Run Hungarian algorithm
  const assignments = hungarianOptimalAssignment(costMatrix);
  
  // Find which home player is assigned to the current opponent (column 0)
  let selectedHomePlayerIndex = -1;
  for (const [rowIdx, colIdx] of assignments) {
    if (colIdx === 0 && rowIdx < availableHomePlayers.length) {
      selectedHomePlayerIndex = rowIdx;
      break;
    }
  }
  
  // Fallback to best direct matchup if no assignment found
  if (selectedHomePlayerIndex === -1) {
    let bestPlayer = null;
    let highestWinProb = -1;
    
    for (const homePlayer of availableHomePlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        opponentPlayer.name,
        teamStats,
        allMatches
      );
      
      if (winProb > highestWinProb) {
        highestWinProb = winProb;
        bestPlayer = homePlayer;
      }
    }
    
    return bestPlayer;
  }
  
  return availableHomePlayers[selectedHomePlayerIndex];
}

// Find optimal blind selection player
function findOptimalBlindPlayer(availableHomePlayers, availableAwayPlayers, teamStats, allMatches) {
  // If only one player left, return them
  if (availableHomePlayers.length === 1) {
    return availableHomePlayers[0];
  }
  
  // If no opponents left (shouldn't happen), return any player
  if (availableAwayPlayers.length === 0) {
    return availableHomePlayers[0];
  }
  
  // Create cost matrix for all remaining player combinations
  const costMatrix = [];
  
  for (const homePlayer of availableHomePlayers) {
    const row = [];
    
    for (const awayPlayer of availableAwayPlayers) {
      const winProb = calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        allMatches
      );
      row.push(1 - winProb); // Convert to cost
    }
    
    costMatrix.push(row);
  }
  
  // Add dummy rows if needed to make the matrix square
  while (costMatrix.length < availableAwayPlayers.length) {
    const dummyRow = Array(availableAwayPlayers.length).fill(1); // High cost for dummy assignments
    costMatrix.push(dummyRow);
  }
  
  // Run Hungarian algorithm
  const assignments = hungarianOptimalAssignment(costMatrix);
  
  // Calculate expected value for each player
  const playerScores = {};
  
  // Initialize with average win probability
  for (const homePlayer of availableHomePlayers) {
    const avgWinProb = availableAwayPlayers.reduce((sum, awayPlayer) => {
      return sum + calculateWinProbability(
        homePlayer.name,
        awayPlayer.name,
        teamStats,
        allMatches
      );
    }, 0) / availableAwayPlayers.length;
    
    playerScores[homePlayer.name] = {
      player: homePlayer,
      score: avgWinProb
    };
  }
  
  // Find the optimal player (one with highest average win probability)
  let bestPlayer = null;
  let bestScore = -1;
  
  for (const [playerName, data] of Object.entries(playerScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestPlayer = data.player;
    }
  }
  
  return bestPlayer;
}

function App() {
  // UI state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add this with your other state declarations
  const processingSelectionRef = useRef(null);
  
  // Data states
  const [allMatches, setAllMatches] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [optimalPlayer, setOptimalPlayer] = useState(null);
  
  // NEW STATE: To track calculated best player for confirmation stage
  const [calculatedBestPlayer, setCalculatedBestPlayer] = useState(null);
  
  // Team selection states
  const [selectedHomeTeam, setSelectedHomeTeam] = useState("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);

  // Game selection process states
  const [currentStep, setCurrentStep] = useState("team-selection");
  const [wonCoinFlip, setWonCoinFlip] = useState(null);
  const [availableHomePlayers, setAvailableHomePlayers] = useState([]);
  const [availableAwayPlayers, setAvailableAwayPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({
    game1: { home: null, away: null },
    game2: { home: null, away: null },
    game3: { home: null, away: null },
    game4: { home: null, away: null },
  });

   // Define DebugPanel component within App
  const DebugPanel = () => {
    if (process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="fixed bottom-0 right-0 p-2 bg-black text-white text-xs opacity-70 hover:opacity-100 z-50 w-64 h-64 overflow-auto">
        <div><strong>Current Step:</strong> {currentStep}</div>
        <div><strong>Won Coin Flip:</strong> {wonCoinFlip ? "Yes" : "No"}</div>
        <div><strong>Last Auto Selected:</strong> {lastAutoSelectedPlayer ? 
          `Game ${lastAutoSelectedPlayer.gameNumber}: ${lastAutoSelectedPlayer.player?.displayName} vs ${lastAutoSelectedPlayer.opponent?.displayName}` : 
          "None"}</div>
        <div>
          <strong>Selected Players:</strong>
          <div className="pl-2">
            {Object.entries(selectedPlayers || {}).map(([game, matchup]) => (
              <div key={game}>
                {game}: {matchup?.home?.displayName || "None"} vs {matchup?.away?.displayName || "None"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add this with your other state declarations
const [lastAutoSelectedPlayer, setLastAutoSelectedPlayer] = useState(null);

useEffect(() => {
  console.log(`[App] currentStep changed to: ${currentStep}`);
}, [currentStep]);

 // Custom hook to perform multiple state updates before navigation
  const useMultiStateUpdate = () => {
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
    
    return { addUpdate, isUpdating };
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load JSON files
        const basePath = import.meta.env.BASE_URL;
        const matchesResponse = await fetch(`${basePath}data/all_matches.json`);
        const statsResponse = await fetch(`${basePath}data/team_stats.json`);

        if (!matchesResponse.ok || !statsResponse.ok) {
          throw new Error("Failed to fetch data files");
        }

        const matchesData = await matchesResponse.json();
        const statsData = await statsResponse.json();

        // Filter out forfeit matches
        const validMatches = matchesData.filter(match => !match.forfeit);
        setAllMatches(validMatches);
        
        // Transform stats to add displayName
        const transformedStats = statsData.map(player => ({
          ...player,
          displayName: formatName(player.name)
        }));
        setTeamStats(transformedStats);

        // Extract unique team names
        const uniqueTeams = [...new Set(statsData.map(player => player.team))].sort();
        setTeams(uniqueTeams);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data: " + err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update team players when selection changes
  useEffect(() => {
    if (selectedHomeTeam) {
      const players = teamStats.filter(player => player.team === selectedHomeTeam);
      setHomeTeamPlayers(players);
    } else {
      setHomeTeamPlayers([]);
    }
  }, [selectedHomeTeam, teamStats]);

  useEffect(() => {
    if (selectedAwayTeam) {
      const players = teamStats.filter(player => player.team === selectedAwayTeam);
      setAwayTeamPlayers(players);
    } else {
      setAwayTeamPlayers([]);
    }
  }, [selectedAwayTeam, teamStats]);

  // Calculate optimal player for blind selection
  useEffect(() => {
    if (
      currentStep.startsWith("game-") && 
      !currentStep.includes("opponent") && 
      !currentStep.includes("best-player") && // NEW: Skip this calculation for best-player screen
      !isCalculating && 
      availableHomePlayers.length > 0 && 
      availableAwayPlayers.length > 0
    ) {
      calculateOptimalPlayer();
    }
  }, [currentStep, availableHomePlayers, availableAwayPlayers]);

  // Calculate the optimal player for blind selection
  const calculateOptimalPlayer = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const optimalPlayer = findOptimalBlindPlayer(
        availableHomePlayers,
        availableAwayPlayers,
        teamStats,
        allMatches
      );
      setOptimalPlayer(optimalPlayer);
      setIsCalculating(false);
    }, 0);
  };

  // Helper to get current game number from step
  const getCurrentGameNumber = () => {
    if (currentStep.startsWith("game-")) {
      const parts = currentStep.split("-");
      if (parts.length >= 2 && !isNaN(parseInt(parts[1]))) {
        return parseInt(parts[1]);
      }
    }
    return 1; // Default
  };

 // Function to choose player for a game
const selectPlayerForGame = (game, team, player) => {
  console.log(`[selectPlayerForGame] Game: ${game}, Team: ${team}, Player: ${player?.name}`);
  
  // Validate inputs
  if (!player || !player.name || !game || !team) {
    console.error("Invalid parameters in selectPlayerForGame");
    return;
  }
  
  // Check if we're already processing a selection for this game
  if (processingSelectionRef.current === game) {
    console.log(`Already processing a selection for ${game}, skipping`);
    return;
  }
  
  // Set the processing flag
  processingSelectionRef.current = game;
  
  console.log(`Selecting ${team} player for ${game}:`, player.name);
  
  // Store local copies
  const selectedPlayer = JSON.parse(JSON.stringify(player));
  const gameStr = String(game);
  const teamStr = String(team);
  const gameNumber = parseInt(gameStr.replace("game", ""), 10);
  
  // Update player lists based on team
  if (teamStr === "home") {
    setAvailableHomePlayers(prev => 
      prev.filter(p => p.name !== selectedPlayer.name)
    );
  } else {
    setAvailableAwayPlayers(prev => 
      prev.filter(p => p.name !== selectedPlayer.name)
    );
  }

  
  // Update selected players state
  setSelectedPlayers(prev => {
    const updated = {...prev};
    if (!updated[gameStr]) {
      updated[gameStr] = {};
    }
    updated[gameStr] = {
      ...updated[gameStr],
      [teamStr]: selectedPlayer
    };
    return updated;
  });
  
// Navigate after state updates
setTimeout(() => {
  let nextStep;
  
  // Always go to opponent selection after we select a home player
  if (teamStr === "home") {
    // Use createOpponentStep for consistency
    nextStep = `game-${gameNumber}-opponent`;
  } 
  // Almost never happens but if we select an away player, go to next game or summary
  else {
    if (gameNumber === 4) {
      nextStep = "summary";
    } else {
      const nextGameNum = gameNumber + 1;
      
      // Determine if next game should be home or away selection
      const isNextGameHomeSelection = isHomeSelectingBlind(nextGameNum, wonCoinFlip);
      
      if (isNextGameHomeSelection) {
        // If home selects blind for next game, go to home selection
        nextStep = `game-${nextGameNum}`;
      } else {
        // If away selects blind for next game, go to away selection
        nextStep = `game-${nextGameNum}-opponent`;
      }
    }
  }
  
  console.log(`[selectPlayerForGame] Navigating to: ${nextStep}`);
  setCurrentStep(nextStep);
  
  // Clear the processing flag
  setTimeout(() => {
    if (processingSelectionRef.current === gameStr) {
      processingSelectionRef.current = null;
    }
  }, 500);
}, 300);
};


// Step 1: Team selection
const handleTeamSelection = () => {
  if (!selectedHomeTeam || !selectedAwayTeam) {
    alert("Please select both teams first.");
    return;
  }

  // Initialize available players
  setAvailableHomePlayers([...homeTeamPlayers]);
  setAvailableAwayPlayers([...awayTeamPlayers]);

  // Move to coin flip step
  setCurrentStep("coin-flip");
};

// Step 2: Coin flip result
const handleCoinFlipResult = (won) => {
  setWonCoinFlip(won);
  setCurrentStep("game-1");
};

// NEW: Function to confirm the calculated best player
const confirmBestPlayer = (gameNum) => {
  const game = `game${gameNum}`;
  
  console.log(`Confirming best player for game ${gameNum}:`, calculatedBestPlayer?.name);
  
  // Check if calculatedBestPlayer exists before using it
  if (!calculatedBestPlayer) {
    console.error("Cannot confirm player: calculatedBestPlayer is null");
    alert("Error confirming player. Please try again.");
    return; // Exit if no player is selected
  }
  
  // Create a local copy to work with
  const playerToConfirm = JSON.parse(JSON.stringify(calculatedBestPlayer));
  
  // First update available players list
  setAvailableHomePlayers(prevPlayers => 
    prevPlayers.filter(p => p.name !== playerToConfirm.name)
  );
  
  // Then update selected players state with the confirmed player
  setSelectedPlayers(prevState => {
    const newState = JSON.parse(JSON.stringify(prevState));
    if (!newState[game]) newState[game] = {};
    newState[game].home = playerToConfirm;
    return newState;
  });
  
  // First navigate to next screen
  let nextStep;
  if (gameNum === 4) {
    nextStep = "summary";
  } else {
    const nextGameNum = gameNum + 1;
    
    // Determine if next game is home or away selection based on coin flip
    const isNextGameHomeSelection = isHomeSelectingBlind(nextGameNum, wonCoinFlip);
    
    if (isNextGameHomeSelection) {
      nextStep = `game-${nextGameNum}`;
    } else {
      nextStep = `game-${nextGameNum}-opponent`;
    }
  }
  
  // THEN reset the calculated best player after a short delay
  setTimeout(() => {
    setCalculatedBestPlayer(null);
  }, 100);
};

// FIXED: Function to choose a different player instead
const chooseDifferentPlayer = (gameNum) => {
  console.log(`Choosing different player for game ${gameNum}`);
  
  // Reset calculated best player first
  setCalculatedBestPlayer(null);
  
  // Then navigate to manual selection with delay
  setTimeout(() => {
    // Navigate to manual selection for the CURRENT game, not the next game
    const nextStep = `game-${gameNum}-manual-selection`;
    console.log(`Navigating to manual selection: ${nextStep}`);
    setCurrentStep(nextStep);
  }, 300);
};

// FIXED: Handle opponent selection and find best response
// Complete handleOpponentSelection function with timeout structure preserved
const handleOpponentSelection = (gameNum, player) => {
  console.log(`[handleOpponentSelection] Game ${gameNum} - Player: ${player?.name}`);
  console.log(`[handleOpponentSelection] Game ${gameNum} - Coin flip:`, wonCoinFlip ? "WON" : "LOST");
  
  if (!player || !player.name) {
    console.error("Invalid player object in handleOpponentSelection");
    return;
  }
  
  const game = `game${gameNum}`;
  
  // Check if we're already processing a selection for this game
  if (processingSelectionRef.current === game) {
    console.log(`Already processing a selection for game ${gameNum}, skipping`);
    return;
  }
  
  // Set the processing flag
  processingSelectionRef.current = game;
  
  console.log(`Handling opponent selection for Game ${gameNum}: ${player.name}`);
  setIsCalculating(true);
  
  // Make a deep copy of the opponent
  const opponentCopy = JSON.parse(JSON.stringify(player));
  
  // Update opponent in state and remove from available players
  setSelectedPlayers(prev => {
    const result = {...prev};
    if (!result[game]) result[game] = {};
    result[game].away = opponentCopy;
    return result;
  });
  
  setAvailableAwayPlayers(prev => 
    prev.filter(p => p.name !== opponentCopy.name)
  );
  
  // FIXED: Determine if we should auto-select a home player for this game
  // For WON coin flip: Auto-select in Games 1 and 4 (Away blind)
  // For LOST coin flip: Auto-select in Games 2 and 3 (Away blind)
  const shouldAutoSelect = 
    (wonCoinFlip && (gameNum === 1 || gameNum === 4)) || 
    (!wonCoinFlip && (gameNum === 2 || gameNum === 3));

  console.log(`[handleOpponentSelection] Game ${gameNum} - Should auto-select:`, shouldAutoSelect);
  
  // Use a longer timeout to ensure state updates complete
  setTimeout(async () => {
    try {
      if (shouldAutoSelect) {
        // For games where we auto-select
        console.log(`Auto-selecting home player for Game ${gameNum}`);
        
        // Use fresh state
        const currentHomePlayers = [...availableHomePlayers];
        const remainingAwayPlayers = [...availableAwayPlayers];
        const currentPlayerSelections = {...selectedPlayers};
        
        console.log("Finding best response player");
        console.log("Available home players:", currentHomePlayers.map(p => p.name));
        
        const bestPlayer = findBestResponsePlayer(
          gameNum,
          opponentCopy,
          currentHomePlayers,
          remainingAwayPlayers,
          currentPlayerSelections,
          teamStats,
          allMatches
        );
        
        if (!bestPlayer) {
          console.error("No best player found");
          alert("Could not find optimal player. Please try again.");
          setIsCalculating(false);
          processingSelectionRef.current = null;
          return;
        }
        
        console.log(`Found best player: ${bestPlayer.name}`);
        const bestPlayerCopy = JSON.parse(JSON.stringify(bestPlayer));
        
        // Set lastAutoSelectedPlayer
        setLastAutoSelectedPlayer({
          gameNumber: gameNum,
          player: bestPlayerCopy,
          opponent: opponentCopy,
          winProbability: calculateWinProbability(
            bestPlayerCopy.name,
            opponentCopy.name,
            teamStats,
            allMatches
          )
        });
        
        console.log(`Set lastAutoSelectedPlayer for Game ${gameNum}:`, {
          gameNumber: gameNum,
          player: bestPlayerCopy.displayName,
          opponent: opponentCopy.displayName
        });
        
        // Update home player selection
        setAvailableHomePlayers(prev => 
          prev.filter(p => p.name !== bestPlayerCopy.name)
        );
        
        setSelectedPlayers(prev => {
          const result = {...prev};
          if (!result[game]) result[game] = { away: opponentCopy };
          result[game].home = bestPlayerCopy;
          return result;
        });
      } else {
        console.log(`NOT auto-selecting for Game ${gameNum}`);
      }
      
      // Wait to ensure state updates complete
      setTimeout(() => {
        // FIXED: Navigate to next step based on won/lost coin flip
        let nextStep;
        
        if (gameNum === 4) {
          // After game 4 opponent selection, always move to summary
          console.log("Game 4 completed, moving to summary");
          nextStep = "summary";
        } else {
          // Determine next step based on coin flip and current game
          if (wonCoinFlip) {
            // WON COIN FLIP FLOW
            if (gameNum === 1) {
              // After G1 opponent, go to G2 home selection
              nextStep = "game-2";
            } else if (gameNum === 2) {
              // After G2 opponent, go to G3 home selection
              nextStep = "game-3";
            } else if (gameNum === 3) {
              // After G3 opponent, go to G4 opponent selection
              nextStep = "game-4-opponent";
            }
          } else {
            // LOST COIN FLIP FLOW
            if (gameNum === 1) {
              // After G1 opponent, go to G2 opponent selection
              nextStep = "game-2-opponent";
            } else if (gameNum === 2) {
              // After G2 opponent, go to G3 opponent selection
              nextStep = "game-3-opponent";
            } else if (gameNum === 3) {
              // After G3 opponent, go to G4 home selection
              nextStep = "game-4";
            }
          }
        }
        
        console.log(`[handleOpponentSelection] Navigating to: ${nextStep}`);
        setCurrentStep(nextStep);
        setIsCalculating(false);
      }, 500);
      
    } catch (error) {
      console.error("Error in handleOpponentSelection:", error);
      alert("An error occurred while finding the optimal player.");
      setIsCalculating(false);
    }
    
    setTimeout(() => {
      if (processingSelectionRef.current === game) {
        processingSelectionRef.current = null;
      }
    }, 1000); // Clear after 1 second to ensure processing is complete
  }, 500);
};

// Reset everything and start over
const handleReset = () => {
  setSelectedHomeTeam("");
  setSelectedAwayTeam("");
  setHomeTeamPlayers([]);
  setAwayTeamPlayers([]);
  setCurrentStep("team-selection");
  setWonCoinFlip(null);
  setAvailableHomePlayers([]);
  setAvailableAwayPlayers([]);
  setSelectedPlayers({
    game1: { home: null, away: null },
    game2: { home: null, away: null },
    game3: { home: null, away: null },
    game4: { home: null, away: null },
  });
  setOptimalPlayer(null);
  setCalculatedBestPlayer(null); // NEW: Reset calculated best player
  setIsCalculating(false);
};

// NEW: Render function for best player confirmation stage
const renderBestPlayerConfirmation = (gameNum) => {
  const game = `game${gameNum}`;
  const opponent = selectedPlayers[game]?.away;
  
  console.log(`Rendering confirmation screen for game ${gameNum}`);
  console.log(`calculatedBestPlayer:`, calculatedBestPlayer);
  console.log(`opponent:`, opponent);
  
  // Add defensive checks to prevent null reference errors
  if (!calculatedBestPlayer || !opponent) {
    console.error("Missing data for confirmation screen");
    
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
          <h2 className="text-xl font-semibold mb-4">Data Loading Error</h2>
          <p className="mb-4">
            There was a problem loading the player data for confirmation.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
              onClick={() => {
                // Try to go back to previous screen
                setCurrentStep(`game-${gameNum}`);
              }}
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
  
  // Calculate win probability safely
  let winProb = 0.5; // Default value
  try {
    winProb = calculateWinProbability(
      calculatedBestPlayer.name,
      opponent.name,
      teamStats,
      allMatches
    );
  } catch (error) {
    console.error("Error calculating win probability:", error);
  }
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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
    </div>
  );
};

  // NEW: Render function for manual player selection screen
  const renderManualPlayerSelection = (gameNum) => {
    const game = `game${gameNum}`;
    const opponent = selectedPlayers[game].away;
    
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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
                allMatches
              );
              
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
      </div>
    );
  };

  // Helper function to render the opponent selection screen
const renderOpponentSelectionScreen = (gameNumber) => {
  const game = `game${gameNumber}`;
  
  // Add this to determine if we should show auto-selection notification
  const showLastAutoSelection = lastAutoSelectedPlayer && 
                             lastAutoSelectedPlayer.gameNumber === gameNumber - 1;
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>
      
      {/* Add auto-selection notification here */}
      {showLastAutoSelection && (
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
          <h3 className="font-medium text-green-800 mb-2">
            Auto-Selected Player for Game {lastAutoSelectedPlayer.gameNumber}
          </h3>
          <p>
            <span className="font-semibold">{lastAutoSelectedPlayer.player.displayName}</span> was 
            automatically chosen for Game {lastAutoSelectedPlayer.gameNumber} as the best match against {lastAutoSelectedPlayer.opponent.displayName} with 
            a {Math.round(lastAutoSelectedPlayer.winProbability * 100)}% win probability.
          </p>
        </div>
      )}
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Game {gameNumber} Opponent Selection</h2>
        {/* Updated text that checks if we have a home player */}
        <p className="mb-4">
          {selectedPlayers[game]?.home ? 
            `You've selected ${selectedPlayers[game].home.displayName} for Game ${gameNumber}. Which player did the opponent choose?` :
            `The opponent selects a player for Game ${gameNumber}. Which player did they choose?`
          }
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableAwayPlayers.map((player) => {
            // Calculate win probability against our player
            const winProb = calculateWinProbability(
              selectedPlayers[game].home?.name,
              player.name,
              teamStats,
              allMatches
            );
            
            return (
              <div
                key={`opponent-player-${player.name}`}
                className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => handleOpponentSelection(gameNumber, player)}
              >
                <div className="font-medium">{player.displayName}</div>
                <div className="text-sm text-gray-600">
                  HCP: {player.handicap}
                </div>
                <div className="mt-2">
                  <div className="text-sm">Win probability against them:</div>
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
    </div>
  );
};

  // Render Game 2, 3, 4 selection with similar pattern
const renderGameSelection = useCallback((gameNum) => {
  console.log(`[renderGameSelection] Game ${gameNum}`);
  
  // Check if this is actually supposed to be an opponent selection screen
  if (currentStep === `game-${gameNum}-opponent`) {
    console.log(`[renderGameSelection] Redirecting to renderOpponentSelectionScreen for Game ${gameNum}`);
    return renderOpponentSelectionScreen(gameNum);
  }
  
  const game = `game${gameNum}`;
  
  // FIXED LOGIC: Determine who selects blind based on coin flip and game number
  // For WON coin flip: Home blind for Games 2, 3; Away blind for Games 1, 4
  // For LOST coin flip: Home blind for Games 1, 4; Away blind for Games 2, 3
  const homeSelectsBlind = isHomeSelectingBlind(gameNum, wonCoinFlip);
  const awaySelectsBlind = !homeSelectsBlind;
  
  // Check for auto-selection notification
  const showAutoSelected = lastAutoSelectedPlayer && 
                        lastAutoSelectedPlayer.gameNumber === gameNum - 1 &&
                        // Only show auto-selection message if it actually happened
                        ((wonCoinFlip && (lastAutoSelectedPlayer.gameNumber === 1 || lastAutoSelectedPlayer.gameNumber === 4)) ||
                         (!wonCoinFlip && (lastAutoSelectedPlayer.gameNumber === 2 || lastAutoSelectedPlayer.gameNumber === 3)));
  
  // Debug logs
  console.log(`[renderGameSelection] Game ${gameNum} - Coin flip:`, wonCoinFlip ? "WON" : "LOST");
  console.log(`[renderGameSelection] Game ${gameNum} - Home selects blind:`, homeSelectsBlind);
  console.log(`[renderGameSelection] Game ${gameNum} - Away selects blind:`, awaySelectsBlind);
  console.log(`[renderGameSelection] Game ${gameNum} - lastAutoSelectedPlayer:`, 
              lastAutoSelectedPlayer ? {
                gameNumber: lastAutoSelectedPlayer.gameNumber,
                player: lastAutoSelectedPlayer.player?.displayName,
                opponent: lastAutoSelectedPlayer.opponent?.displayName
              } : null);
  console.log(`[renderGameSelection] Game ${gameNum} - showAutoSelected:`, showAutoSelected);

  if (homeSelectsBlind) {
    // HOME SELECTS BLIND - we need to show home player selection UI
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        
        {/* Show auto-selected player notification if available */}
        {showAutoSelected && (
          <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
            <h3 className="font-medium text-green-800 mb-2">
              Auto-Selected Player for Game {lastAutoSelectedPlayer.gameNumber}
            </h3>
            <p>
              <span className="font-semibold">{lastAutoSelectedPlayer.player.displayName}</span> was 
              automatically chosen for Game {lastAutoSelectedPlayer.gameNumber} as the best match against {lastAutoSelectedPlayer.opponent.displayName} with 
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
      </div>
    );
  } else {
    // AWAY SELECTS BLIND - we need to show away player selection UI
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>

        {/* Show auto-selected player notification if available */}
        {showAutoSelected && (
          <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-300">
            <h3 className="font-medium text-green-800 mb-2">
              Auto-Selected Player for Game {lastAutoSelectedPlayer.gameNumber}
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
            {availableAwayPlayers.map((player) => (
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
            ))}
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
      </div>
    );
  }
}, [wonCoinFlip, lastAutoSelectedPlayer, availableHomePlayers, availableAwayPlayers, 
    teamStats, allMatches, optimalPlayer, isCalculating, showInfoPopup, handleReset]);

  const renderContent = useMemo(() => {
    // Render loading state
    if (loading) {
      return <div className="text-center p-8">Loading data...</div>;
    }

    // Render error state
    if (error) {
      return <div className="text-center p-8 text-red-600">{error}</div>;
    }

    // NEW: Add cases for the new step types in the main render logic
    if (currentStep.match(/^game-\d-best-player$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return renderBestPlayerConfirmation(gameNumber);
    }
    
    if (currentStep.match(/^game-\d-manual-selection$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return renderManualPlayerSelection(gameNumber);
    }

  // Render team selection step
    if (currentStep === "team-selection") {
      return (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
          <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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
                  options={teams}
                  value={selectedHomeTeam}
                  onChange={setSelectedHomeTeam}
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
                  options={teams}
                  value={selectedAwayTeam}
                  onChange={setSelectedAwayTeam}
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
        </div>
      );
    }

    // Render coin flip step
    if (currentStep === "coin-flip") {
      return (
        <div className="container mx-auto p-4">
          <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
          <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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
        </div>
      );
    }

    if (currentStep.match(/^game-\d-opponent$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return renderOpponentSelectionScreen(gameNumber);
    }

  // Render Game 1 selection
    if (currentStep === "game-1") {
      // Loser of coin flip puts up blind for game 1
      if (wonCoinFlip) {
        // We won the coin flip, opponent puts up blind for game 1
        return (
          <div className="container mx-auto p-4">
            <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
            <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
            <h1 className="text-3xl font-bold mb-6 text-center">
              Pool Team Stats Analyzer
            </h1>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Game 1 Selection</h2>
              <p className="mb-4">
                You won the coin flip! The opponent puts up a player blind for
                Game 1. Which player did they choose?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAwayPlayers.map((player) => (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => handleOpponentSelection(1, player)}
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
                ))}
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
          </div>
        );
      } else {
        // We lost the coin flip, so we put up blind
        return (
          <div className="container mx-auto p-4">
            <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
            <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
            <h1 className="text-3xl font-bold mb-6 text-center">
              Pool Team Stats Analyzer
            </h1>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Game 1 Selection</h2>
              <p className="mb-4">
                You lost the coin flip! You need to put up a player blind for Game 1.
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
                      
                      return (
                        <div
                          key={`select-player-${player.name}`}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                            player.name === optimalPlayer?.name
                              ? "bg-green-50 border-green-500"
                              : ""
                          }`}
                          onClick={() => selectPlayerForGame("game1", "home", player)}
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
          </div>
        );
      }
    }

// Fixed Summary rendering section
if (currentStep === "summary") {
  console.log("Rendering summary page");
  console.log("Selected players:", selectedPlayers);
  
  // Defensive check - if selectedPlayers is empty or undefined, handle it
  if (!selectedPlayers || Object.keys(selectedPlayers).length === 0) {
    console.error("No selected players found for summary");
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
          <h2 className="text-xl font-semibold mb-4">No Match Data Found</h2>
          <p className="mb-4">
            There was a problem loading the match data for the summary.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleReset}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate overall win probability
  const matchupsWithProbability = Object.values(selectedPlayers)
    .filter((matchup) => matchup && matchup.home && matchup.away)
    .map((matchup) => ({
      ...matchup,
      winProbability: calculateWinProbability(
        matchup.home.name,
        matchup.away.name,
        teamStats,
        allMatches
      ),
    }));
  
  console.log("Matchups with probability:", matchupsWithProbability);

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

  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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
              {[1, 2, 3, 4].map((gameNum) => {
                const game = `game${gameNum}`;
                const matchup = selectedPlayers[game];

                // Add defensive check for matchup
                if (!matchup || !matchup.home || !matchup.away) {
                  console.log(`Missing data for game ${gameNum}:`, matchup);
                  return null;
                }

                // Fixed to ensure teamStats and allMatches are passed
                const winProb = calculateWinProbability(
                  matchup.home.name,
                  matchup.away.name,
                  teamStats,  // Make sure to pass this parameter
                  allMatches  // Make sure to pass this parameter
                );

                return (
                  <tr key={`summary-${game}`} className="border-t">
                    <td className="p-2">Game {gameNum}</td>
                    <td className="p-2">{matchup.home.displayName}</td>
                    <td className="p-2">{matchup.away.displayName}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${winProb * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(winProb * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {matchup.home.handicap} vs {matchup.away.handicap}
                    </td>
                  </tr>
                );
              })}
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

      <div className="flex justify-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleReset}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
    console.log(`Current step: ${currentStep}`);
  if (currentStep.match(/^game-\d$/)) {
    const gameNumber = parseInt(currentStep.split('-')[1], 10);
    if (gameNumber >= 1 && gameNumber <= 4) {
      console.log(`Rendering game ${gameNumber} via fallback`);
      return renderGameSelection(gameNumber);
    }
  }

  // Final fallback
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Pool Team Stats Analyzer</h1>
      <p>Unrecognized state: {currentStep}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
        onClick={handleReset}
      >
        Start Over
      </button>
    </div>
  );
  }, [currentStep, loading, error, selectedPlayers, availableHomePlayers, 
      availableAwayPlayers, renderGameSelection, renderBestPlayerConfirmation, 
      renderManualPlayerSelection]);

  return (
    <>
      {renderContent}
      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <DebugPanel />
    </>
  );
}

export default App;