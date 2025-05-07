import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const USE_HUNGARIAN_ALGORITHM = true; // Set to true when you want to test the new algorithm

// Add the name formatting utility at the top of the file
const formatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  const nameParts = fullName.split(' ');
  if (nameParts.length <= 1) return fullName;
  
  const firstName = nameParts.slice(0, nameParts.length - 1).join(' ');
  const lastNameInitial = nameParts[nameParts.length - 1][0];
  
  return `${firstName} ${lastNameInitial}.`;
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

// Floating info button that always stays in the top-right corner
const FloatingInfoButton = ({ onClick }) => (
  <button 
    className="fixed top-4 right-4 z-40 p-0 bg-transparent hover:opacity-80 transition-opacity duration-200"
    onClick={onClick}
    aria-label="Show Information"
  >
    <LightbulbIcon />
  </button>
);

// Info Popup Component
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

// Enhanced SearchableDropdown with minimum character requirement
function SearchableDropdown({ options, value, onChange, placeholder, minChars = 2 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const optionsRef = useRef([]);

  // Reset refs when options change
  optionsRef.current = [];

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Show if there's a selected value (even with no search term)
    if (isOpen && value && !searchTerm) return true;

    // Show if search term meets minimum length
    return isOpen && searchTerm.length >= minChars;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center border rounded p-2 cursor-pointer bg-neutral-50 hover:bg-neutral-100"
        onClick={() => {
          // Only open dropdown if minimum chars are typed or we have a value
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

            // Auto-open dropdown when minimum chars are typed
            if (newValue.length >= minChars) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Only open dropdown if minimum chars are typed or we have a value
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

// Hungarian algorithm implementation

// Add this improved Hungarian algorithm implementation as a new function
function hungarianOptimalAssignment(matrix) {
  console.log("Hungarian algorithm called with matrix:", matrix);

  try {
    // Check for valid input
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      console.log("Invalid matrix input");
      return [];
    }

    if (!Array.isArray(matrix[0])) {
      console.log("Matrix does not contain valid rows");
      return [];
    }

    // Make a deep copy of the cost matrix
    const cost = matrix.map((row) => (Array.isArray(row) ? [...row] : []));
    const m = cost.length;
    const n = cost[0].length;

    console.log(`Processing ${m}x${n} matrix`);

    // Step 1: Subtract row minima
    for (let i = 0; i < m; i++) {
      // Find minimum value in row
      let minVal = Infinity;
      for (let j = 0; j < n; j++) {
        if (typeof cost[i][j] !== "number" || isNaN(cost[i][j])) {
          console.log(`Invalid value at [${i}][${j}]:`, cost[i][j]);
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

    console.log(
      "Hungarian algorithm completed with assignments:",
      hungarianAssignments,
    );
    return hungarianAssignments;
  } catch (error) {
    console.error("Error in Hungarian algorithm:", error);
    return [];
  }
}

function findOptimalAssignment(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const cost = makeMatrixCopy(matrix);
  const m = cost.length;
  const n = cost[0].length;

  // Step 1: Subtract the smallest element from each row
  for (let i = 0; i < m; i++) {
    const minVal = Math.min(...cost[i]);
    for (let j = 0; j < n; j++) {
      cost[i][j] -= minVal;
    }
  }

  // Step 2: Subtract the smallest element from each column
  for (let j = 0; j < n; j++) {
    const column = cost.map((row) => row[j]);
    const minVal = Math.min(...column);
    for (let i = 0; i < m; i++) {
      cost[i][j] -= minVal;
    }
  }

  // For this simplified version, we'll just use a greedy approach
  const assignment = [];
  const usedCols = new Set();

  for (let i = 0; i < m; i++) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let j = 0; j < n; j++) {
      if (!usedCols.has(j) && cost[i][j] < minVal) {
        minVal = cost[i][j];
        minIdx = j;
      }
    }

    if (minIdx !== -1) {
      assignment.push([i, minIdx]);
      usedCols.add(minIdx);
    }
  }

  return assignment;
}

function App() {
  // info pop up
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Data states
  const [allMatches, setAllMatches] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Team selection states
  const [selectedHomeTeam, setSelectedHomeTeam] = useState("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState("");
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);

  // Optimal matchups state
  const [optimalMatchups, setOptimalMatchups] = useState([]);

  // Game selection process states
  const [currentStep, setCurrentStep] = useState("team-selection"); // Possible values: 'team-selection', 'coin-flip', 'game-1', 'game-2', 'game-3', 'game-4', 'summary'
  const [wonCoinFlip, setWonCoinFlip] = useState(null);
  const [availableHomePlayers, setAvailableHomePlayers] = useState([]);
  const [availableAwayPlayers, setAvailableAwayPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({
    game1: { home: null, away: null },
    game2: { home: null, away: null },
    game3: { home: null, away: null },
    game4: { home: null, away: null },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load JSON files
        const basePath = import.meta.env.BASE_URL; // This gets the base path from Vite config
        const matchesResponse = await fetch(`${basePath}data/all_matches.json`);
        const statsResponse = await fetch(`${basePath}data/team_stats.json`);

        if (!matchesResponse.ok || !statsResponse.ok) {
          throw new Error("Failed to fetch data files");
        }

        const matchesData = await matchesResponse.json();
        const statsData = await statsResponse.json();

        // Filter out forfeit matches
        const validMatches = matchesData.filter((match) => !match.forfeit);

        setAllMatches(validMatches);
        
        // Transform the statsData to add displayName field
        const transformedStatsData = statsData.map(player => ({
          ...player,
          displayName: formatName(player.name)
        }));
        
        setTeamStats(transformedStatsData);

        // Extract unique team names from the team stats data
        const uniqueTeams = [
          ...new Set(statsData.map((player) => player.team)),
        ].sort();

        console.log("Teams extracted from team stats:", uniqueTeams);
        console.log("Total teams found:", uniqueTeams.length);

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

  useEffect(() => {
    if (selectedHomeTeam) {
      // Filter for exact team name match
      const players = teamStats.filter(
        (player) => player.team === selectedHomeTeam,
      );
      console.log(`Players for home team "${selectedHomeTeam}":`, players);
      setHomeTeamPlayers(players);
    } else {
      setHomeTeamPlayers([]);
    }
  }, [selectedHomeTeam, teamStats]);

  useEffect(() => {
    if (selectedAwayTeam) {
      // Filter for exact team name match
      const players = teamStats.filter(
        (player) => player.team === selectedAwayTeam,
      );
      console.log(`Players for away team "${selectedAwayTeam}":`, players);
      setAwayTeamPlayers(players);
    } else {
      setAwayTeamPlayers([]);
    }
  }, [selectedAwayTeam, teamStats]);

  // Calculate win rates by handicap level
  const calculateWinRatesByHandicap = (playerName) => {
    // Normalize names for case-insensitive comparison
    const normalizePlayerName = (name) => name.toLowerCase().trim();
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
  };

  // Get head-to-head record between two players
  const getHeadToHeadRecord = (player1, player2) => {
    // Normalize names for case-insensitive comparison
    const normalizePlayerName = (name) => name.toLowerCase().trim();
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
  };

  // Calculate win probability
const calculateWinProbability = (player1, player2) => {
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
  const h2h = getHeadToHeadRecord(player1, player2);
  let h2hAdjustment = 0;

  if (h2h.totalMatches > 0) {
    const h2hWinRate = h2h.player1Wins / h2h.totalMatches;
    // Weight the head-to-head results (more weight if more matches played)
    const h2hWeight = Math.min(h2h.totalMatches / 5, 0.5); // Cap at 50% influence
    h2hAdjustment = (h2hWinRate - 0.5) * h2hWeight;
  }

  // Calculate performance against similar handicap levels
  const p1VsHandicap = calculateWinRatesByHandicap(player1);
  const p2VsHandicap = calculateWinRatesByHandicap(player2);

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

  // Combine all factors
  // Start with 50% and add all adjustments
  let finalProbability =
    0.5 +
    (p1WinPercentage - p2WinPercentage) * 0.3 + // Increase win percentage weight to 30%
    h2hAdjustment +
    handicapCategoryAdjustment;

  // Ensure probability is between 0 and 1
  finalProbability = Math.max(0.05, Math.min(0.95, finalProbability));

  return finalProbability;
};

  // Fix for the "Cannot read properties of undefined (reading 'map')" error
  // Add these safety checks to your generateOptimalMatchups function

  const generateOptimalMatchups = () => {
    console.log("generateOptimalMatchups called");

    // Safety check for players arrays
    if (
      !homeTeamPlayers ||
      !Array.isArray(homeTeamPlayers) ||
      homeTeamPlayers.length === 0 ||
      !awayTeamPlayers ||
      !Array.isArray(awayTeamPlayers) ||
      awayTeamPlayers.length === 0
    ) {
      console.log("No valid players available:", {
        homeTeamPlayers: homeTeamPlayers ? homeTeamPlayers.length : "undefined",
        awayTeamPlayers: awayTeamPlayers ? awayTeamPlayers.length : "undefined",
      });
      return [];
    }

    // Make safe copies of the arrays to prevent issues
    const safeHomePlayers = [...homeTeamPlayers];
    const safeAwayPlayers = [...awayTeamPlayers];

    console.log(
      "Player counts:",
      safeHomePlayers.length,
      safeAwayPlayers.length,
    );

    // Sort players by handicap (higher is better)
    try {
      const sortedHomePlayers = safeHomePlayers.sort(
        (a, b) => b.handicap - a.handicap,
      );
      const sortedAwayPlayers = safeAwayPlayers.sort(
        (a, b) => b.handicap - a.handicap,
      );

      console.log(
        "Sorted players:",
        sortedHomePlayers.length,
        sortedAwayPlayers.length,
      );

      // Take the top 4 players from each team, or fewer if not available
      const topHomePlayers = sortedHomePlayers.slice(
        0,
        Math.min(4, sortedHomePlayers.length),
      );
      const topAwayPlayers = sortedAwayPlayers.slice(
        0,
        Math.min(4, sortedAwayPlayers.length),
      );

      if (!topHomePlayers.length || !topAwayPlayers.length) {
        console.log(
          "Not enough players after slicing:",
          topHomePlayers.length,
          topAwayPlayers.length,
        );
        return [];
      }

      console.log("Top players:", topHomePlayers.length, topAwayPlayers.length);

      // Create cost matrix with safety checks
      const costMatrix = [];
      for (let i = 0; i < topHomePlayers.length; i++) {
        const homePlayer = topHomePlayers[i];
        if (!homePlayer) {
          console.log("Invalid home player at index", i);
          continue;
        }

        const row = [];
        for (let j = 0; j < topAwayPlayers.length; j++) {
          const awayPlayer = topAwayPlayers[j];
          if (!awayPlayer) {
            console.log("Invalid away player at index", j);
            continue;
          }

          try {
            const winProb = calculateWinProbability(
              homePlayer.name,
              awayPlayer.name,
            );
            row.push(1 - winProb); // Convert to cost
          } catch (error) {
            console.error("Error calculating win probability:", error);
            row.push(0.5); // Default to 50% if calculation fails
          }
        }

        costMatrix.push(row);
      }

      if (!costMatrix.length || !costMatrix[0]?.length) {
        console.log("Empty cost matrix");
        return [];
      }

      console.log(
        "Cost matrix created:",
        costMatrix.length,
        "x",
        costMatrix[0].length,
      );
      console.log("Cost matrix:", costMatrix);

      // Find assignments - toggle between original and improved algorithm

      // Always use the original algorithm for now
      const assignments = USE_HUNGARIAN_ALGORITHM
        ? hungarianOptimalAssignment(costMatrix)
        : findOptimalAssignment(costMatrix);

      if (!assignments || !Array.isArray(assignments)) {
        console.log("No valid assignments found");
        return [];
      }

      console.log("Assignments found:", assignments);

      // Format results with safety checks
      const results = [];
      for (let i = 0; i < assignments.length; i++) {
        const [homeIdx, awayIdx] = assignments[i];

        if (
          homeIdx === undefined ||
          awayIdx === undefined ||
          homeIdx < 0 ||
          homeIdx >= topHomePlayers.length ||
          awayIdx < 0 ||
          awayIdx >= topAwayPlayers.length
        ) {
          console.log("Invalid assignment indices:", homeIdx, awayIdx);
          continue;
        }

        const homePlayer = topHomePlayers[homeIdx];
        const awayPlayer = topAwayPlayers[awayIdx];

        if (!homePlayer || !awayPlayer) {
          console.log("Missing player for assignment:", homeIdx, awayIdx);
          continue;
        }

        try {
          const winProb = calculateWinProbability(
            homePlayer.name,
            awayPlayer.name,
          );
          const h2h = getHeadToHeadRecord(homePlayer.name, awayPlayer.name);

          results.push({
            homePlayer,
            awayPlayer,
            winProbability: winProb,
            h2h,
          });
        } catch (error) {
          console.error("Error creating matchup result:", error);
        }
      }

      console.log("Final matchups:", results.length);
      return results;
    } catch (error) {
      console.error("Error in generateOptimalMatchups:", error);
      return [];
    }
  };



  // Function to get best player for blind selection
  const getBestBlindPlayer = (availablePlayers, opponentTeamPlayers) => {
    if (availablePlayers.length === 0) return null;

    // Calculate average win probability against all possible opponents
    const playerScores = availablePlayers.map((player) => {
      const avgWinProb =
        opponentTeamPlayers.reduce((sum, opponent) => {
          return sum + calculateWinProbability(player.name, opponent.name);
        }, 0) / opponentTeamPlayers.length;

      return {
        player,
        avgWinProb,
      };
    });

    // Sort by average win probability (highest first)
    playerScores.sort((a, b) => b.avgWinProb - a.avgWinProb);

    return playerScores[0].player;
  };

  // Function to get best player against a specific opponent
  const getBestPlayerAgainst = (availablePlayers, opponent) => {
    if (availablePlayers.length === 0) return null;

    // Calculate win probability for each player against this opponent
    const playerScores = availablePlayers.map((player) => {
      const winProb = calculateWinProbability(player.name, opponent.name);

      return {
        player,
        winProb,
      };
    });

    // Sort by win probability (highest first)
    playerScores.sort((a, b) => b.winProb - a.winProb);

    return playerScores[0];
  };

  // Step 1: Team selection and initial lineup
  const handleTeamSelection = () => {
    if (!selectedHomeTeam || !selectedAwayTeam) {
      alert("Please select both teams first.");
      return;
    }

    // Generate optimal matchups
    const matchups = generateOptimalMatchups();
    setOptimalMatchups(matchups);

    // Initialize available players
    setAvailableHomePlayers([...homeTeamPlayers]);
    setAvailableAwayPlayers([...awayTeamPlayers]);

    // Move to coin flip step
    setCurrentStep("coin-flip");
  };

  // Step 2: Coin flip result
  const handleCoinFlipResult = (won) => {
    setWonCoinFlip(won);

    // Move to game 1 selection
    setCurrentStep("game-1");
  };

  // Function to choose player for a game
const selectPlayerForGame = (game, team, player) => {
  console.log(`Selecting ${team} player for ${game}:`, player.name);

  // Update selected players
  setSelectedPlayers((prev) => {
    const updated = {
      ...prev,
      [game]: {
        ...prev[game],
        [team]: player,
      },
    };

    console.log(`Updated players for ${game}:`, updated[game]);
    return updated;
  });

  // Remove player from available list
  if (team === "home") {
    setAvailableHomePlayers((prev) =>
      prev.filter((p) => p.name !== player.name),
    );
    
    // Special cases for blind selections - redirect to opponent selection screens
    // Game 1 when lost coin flip
    if (!wonCoinFlip && game === "game1") {
      console.log("Moving to game-1-opponent");
      setCurrentStep("game-1-opponent");
      return;
    }
    // Game 3 when lost coin flip
    if (!wonCoinFlip && game === "game3") {
      console.log("Moving to game-3-opponent");
      setCurrentStep("game-3-opponent");
      return;
    }
    // Game 2 when won coin flip
    if (wonCoinFlip && game === "game2") {
      console.log("Moving to game-2-opponent");
      setCurrentStep("game-2-opponent");
      return;
    }
    // Game 4 when won coin flip
    if (wonCoinFlip && game === "game4") {
      console.log("Moving to game-4-opponent");
      setCurrentStep("game-4-opponent");
      return;
    }
  } else {
    setAvailableAwayPlayers((prev) =>
      prev.filter((p) => p.name !== player.name),
    );
  }

  // Move to next step for all other cases
  const gameNumber = parseInt(game.replace("game", ""));
  if (gameNumber < 4) {
    console.log(`Moving to game-${gameNumber + 1}`);
    setCurrentStep(`game-${gameNumber + 1}`);
  } else {
    console.log("Moving to summary");
    setCurrentStep("summary");
  }
};

  // Handle opponent selection
  const handleOpponentSelection = (game, player) => {
    console.log(`Selecting opponent for ${game}:`, player.name);

    // Update selected players
    setSelectedPlayers((prev) => {
      const updated = {
        ...prev,
        [game]: {
          ...prev[game],
          away: player,
        },
      };

      console.log(`Updated opponent for ${game}:`, updated[game]);
      return updated;
    });

    // Remove player from available list
    setAvailableAwayPlayers((prev) =>
      prev.filter((p) => p.name !== player.name),
    );
  };

  // Reset everything and start over
  const handleReset = () => {
    setSelectedHomeTeam("");
    setSelectedAwayTeam("");
    setHomeTeamPlayers([]);
    setAwayTeamPlayers([]);
    setOptimalMatchups([]);
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
  };
  // Render loading state
  if (loading) {
    return <div className="text-center p-8">Loading data...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
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
                            ({player.winPercentage})
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
                            ({player.winPercentage})
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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ideal Matchups</h2>
          <p className="mb-4">
            Based on the available players, here are the optimal matchups:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Our Player</th>
                  <th className="p-2 text-left">Opponent</th>
                  <th className="p-2 text-left">Win Probability</th>
                  <th className="p-2 text-left">Handicap</th>
                </tr>
              </thead>
              <tbody>
                {optimalMatchups.map((matchup, index) => (
                  <tr key={`matchup-${index}`} className="border-t">
                    <td className="p-2">{matchup.homePlayer.displayName}</td>
                    <td className="p-2">{matchup.awayPlayer.displayName}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${matchup.winProbability * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span>{Math.round(matchup.winProbability * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {matchup.homePlayer.handicap} vs{" "}
                      {matchup.awayPlayer.handicap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded mb-8">
            <h3 className="font-medium mb-2">Team Win Probability</h3>
            <div className="text-lg">
              {optimalMatchups.length > 0
                ? Math.round(
                    (optimalMatchups.reduce(
                      (sum, m) => sum + m.winProbability,
                      0,
                    ) /
                      optimalMatchups.length) *
                      100,
                  ) + "%"
                : "N/A"}
            </div>
          </div>
        </div>

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
                  onClick={() => {
                    // First record the opponent's player selection
                    handleOpponentSelection("game1", player);

                    // Then get the best player for us to play against them
                    const bestMatchupResult = getBestPlayerAgainst(
                      availableHomePlayers,
                      player,
                    );
                    if (bestMatchupResult) {
                      const bestPlayer = bestMatchupResult.player;
                      const winProb = bestMatchupResult.winProb;

                      // Always select the best player automatically instead of showing a confirmation
                      console.log(
                        `Auto-selecting our player for game1:`,
                        bestPlayer.name,
                      );
                      selectPlayerForGame("game1", "home", bestPlayer);
                    }
                  }}
                >
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-gray-600">
                    HCP: {player.handicap}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      Our best player against them:
                    </div>
                    {availableHomePlayers.length > 0 && (
                      <div className="text-sm mt-1">
                        {getBestPlayerAgainst(availableHomePlayers, player)
                          ?.player.displayName || "N/A"}
                        (
                        {Math.round(
                          (getBestPlayerAgainst(availableHomePlayers, player)
                            ?.winProb || 0) * 100,
                        )}
                        % win probability)
                      </div>
                    )}
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
      // Recommend the best blind player for us
      const bestBlindPlayer = getBestBlindPlayer(
        availableHomePlayers,
        availableAwayPlayers,
      );

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 1 Selection</h2>
            <p className="mb-4">
              You lost the coin flip! You need to put up a player blind for Game
              1.
            </p>
            <p className="mb-4">
              Recommended player:{" "}
              <span className="font-bold">
                {bestBlindPlayer?.displayName || "N/A"}
              </span>
            </p>
            <p className="text-sm mb-6">
              This recommendation is based on overall win probability against
              all potential opponents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableHomePlayers.map((player) => {
                // Calculate average win probability against all opponents
                const avgWinProb =
                  availableAwayPlayers.reduce((sum, opponent) => {
                    return (
                      sum + calculateWinProbability(player.name, opponent.name)
                    );
                  }, 0) / availableAwayPlayers.length;

                return (
                  <div
                    key={`select-player-${player.name}`}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                      player.name === bestBlindPlayer?.name
                        ? "bg-green-50 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      selectPlayerForGame("game1", "home", player);
                    }}
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

  // Helper function to render the opponent selection screen for any game
  const renderOpponentSelectionScreen = (gameNumber) => {
    const game = `game${gameNumber}`;
    
    return (
      <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Game {gameNumber} Opponent Selection</h2>
          <p className="mb-4">
            You've selected {selectedPlayers[game].home?.displayName} for Game {gameNumber}. 
            Which player did the opponent choose?
          </p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableAwayPlayers.map((player) => {
            // Calculate win probability against our player
            const winProb = calculateWinProbability(
              selectedPlayers[game].home?.name,
              player.name
            );
            
            return (
              <div
                key={`opponent-player-${player.name}`}
                className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  // Select this player as the opponent
                  handleOpponentSelection(game, player);
                  
                  // Move to next game or summary for Game 4
                  if (gameNumber === 4) {
                    console.log("Moving to summary after Game 4 opponent selection");
                    setCurrentStep("summary");
                  } else {
                    const nextGameNumber = gameNumber + 1;
                    console.log(`Moving to game-${nextGameNumber}`);
                    setCurrentStep(`game-${nextGameNumber}`);
                  }
                }}
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

        <div className="flex justify-center">
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
  };

  // Render Game 2 selection
  if (currentStep === "game-2") {
    if (wonCoinFlip) {
      // We won the coin flip, we choose player for game 1 and put up blind for game 2
      // Get best blind player for game 2
      const bestBlindPlayer = getBestBlindPlayer(
        availableHomePlayers,
        availableAwayPlayers,
      );

    return (
      <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 2 Selection</h2>
            <p className="mb-4">
              You need to put up a player blind for Game 2.
            </p>
            <p className="mb-4">
              Recommended player:{" "}
              <span className="font-bold">
                {bestBlindPlayer?.displayName || "N/A"}
              </span>
            </p>
            <p className="text-sm mb-6">
              This recommendation is based on overall win probability against
              all potential opponents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableHomePlayers.map((player) => {
                // Calculate average win probability against all opponents
                const avgWinProb =
                  availableAwayPlayers.reduce((sum, opponent) => {
                    return (
                      sum + calculateWinProbability(player.name, opponent.name)
                    );
                  }, 0) / availableAwayPlayers.length;

                return (
                  <div
                    key={`select-player-${player.name}`}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                      player.name === bestBlindPlayer?.name
                        ? "bg-green-50 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      // First select our player
                      selectPlayerForGame("game2", "home", player);

                      // Then auto-select the best opponent
                      if (availableAwayPlayers.length > 0) {
                        // Find best opponent against our player (for opponent, higher win probability is better)
                        const bestOpponent = availableAwayPlayers.reduce(
                          (best, current) => {
                            const currentProb =
                              1 -
                              calculateWinProbability(
                                player.name,
                                current.name,
                              );
                            const bestProb = best
                              ? 1 -
                                calculateWinProbability(player.name, best.name)
                              : 0;

                            return currentProb > bestProb ? current : best;
                          },
                          null,
                        );

                        if (bestOpponent) {
                          console.log(
                            `Auto-selecting opponent for game2:`,
                            bestOpponent.name,
                          );
                          handleOpponentSelection("game2", bestOpponent);
                        }
                      }
                    }}
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
      // We lost the coin flip, opponent chooses player for game 2
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 2 Selection</h2>
            <p className="mb-4">
              The opponent selects a player for Game 2. Which player did they
              choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => (
                <div
                  key={`select-opponent-${player.name}`}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    handleOpponentSelection("game2", player);

                    // Get best home player against this opponent
                    const bestMatchupResult = getBestPlayerAgainst(
                      availableHomePlayers,
                      player,
                    );
                    if (bestMatchupResult) {
                      const homePlayer = bestMatchupResult.player;
                      selectPlayerForGame("game2", "home", homePlayer);
                    }
                  }}
                >
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-gray-600">
                    HCP: {player.handicap}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      Our best player against them:
                    </div>
                    {availableHomePlayers.length > 0 && (
                      <div className="text-sm mt-1">
                        {getBestPlayerAgainst(availableHomePlayers, player)
                          ?.player.displayName || "N/A"}
                        (
                        {Math.round(
                          (getBestPlayerAgainst(availableHomePlayers, player)
                            ?.winProb || 0) * 100,
                        )}
                        % win probability)
                      </div>
                    )}
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
  }

  // Render Game 3 selection
  if (currentStep === "game-3") {
    if (wonCoinFlip) {
      // We won the coin flip, opponent puts up blind for game 3
      return (
        <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
       <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 3 Selection</h2>
            <p className="mb-4">
              The opponent puts up a player blind for Game 3. Which player did
              they choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => (
                <div
                  key={`select-opponent-${player.name}`}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    // First record the opponent's player selection
                    handleOpponentSelection("game3", player);

                    // Then get the best player for us to play against them
                    const bestMatchupResult = getBestPlayerAgainst(
                      availableHomePlayers,
                      player,
                    );
                    if (bestMatchupResult) {
                      const bestPlayer = bestMatchupResult.player;
                      const winProb = bestMatchupResult.winProb;

                      // Always select the best player automatically instead of showing a confirmation
                      console.log(
                        `Auto-selecting our player for game3:`,
                        bestPlayer.name,
                      );
                      selectPlayerForGame("game3", "home", bestPlayer);
                    }
                  }}
                >
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-gray-600">
                    HCP: {player.handicap}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      Our best player against them:
                    </div>
                    {availableHomePlayers.length > 0 && (
                      <div className="text-sm mt-1">
                        {getBestPlayerAgainst(availableHomePlayers, player)
                          ?.player.displayName || "N/A"}
                        (
                        {Math.round(
                          (getBestPlayerAgainst(availableHomePlayers, player)
                            ?.winProb || 0) * 100,
                        )}
                        % win probability)
                      </div>
                    )}
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
      // We lost the coin flip, so we put up blind for game 3
      const bestBlindPlayer = getBestBlindPlayer(
        availableHomePlayers,
        availableAwayPlayers,
      );

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 3 Selection</h2>
            <p className="mb-4">
              You need to put up a player blind for Game 3.
            </p>
            <p className="mb-4">
              Recommended player:{" "}
              <span className="font-bold">
                {bestBlindPlayer?.displayName || "N/A"}
              </span>
            </p>
            <p className="text-sm mb-6">
              This recommendation is based on overall win probability against
              all potential opponents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableHomePlayers.map((player) => {
                // Calculate average win probability against all opponents
                const avgWinProb =
                  availableAwayPlayers.reduce((sum, opponent) => {
                    return (
                      sum + calculateWinProbability(player.name, opponent.name)
                    );
                  }, 0) / availableAwayPlayers.length;

                return (
                  <div
                    key={`select-player-${player.name}`}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                      player.name === bestBlindPlayer?.name
                        ? "bg-green-50 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      selectPlayerForGame("game3", "home", player);
                    }}
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
  // Render Game 4 selection
  if (currentStep === "game-4") {
    if (wonCoinFlip) {
      // We won the coin flip, we choose player for game 3 and put up blind for game 4
      const bestBlindPlayer = getBestBlindPlayer(
        availableHomePlayers,
        availableAwayPlayers,
      );

      return (
        <div className="container mx-auto p-4">
        <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
        <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 4 Selection</h2>
            <p className="mb-4">
              You need to put up a player blind for Game 4.
            </p>
            <p className="mb-4">
              Recommended player:{" "}
              <span className="font-bold">
                {bestBlindPlayer?.displayName || "N/A"}
              </span>
            </p>
            <p className="text-sm mb-6">This is your last player selection.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableHomePlayers.map((player) => {
                // Calculate average win probability against all opponents
                const avgWinProb =
                  availableAwayPlayers.reduce((sum, opponent) => {
                    return (
                      sum + calculateWinProbability(player.name, opponent.name)
                    );
                  }, 0) / availableAwayPlayers.length;

                return (
                  <div
                    key={`select-player-${player.name}`}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                      player.name === bestBlindPlayer?.name
                        ? "bg-green-50 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      // First select our player
                      selectPlayerForGame("game4", "home", player);

                      // Then auto-select the best opponent
                      if (availableAwayPlayers.length > 0) {
                        // Find best opponent against our player (for opponent, higher win probability is better)
                        const bestOpponent = availableAwayPlayers.reduce(
                          (best, current) => {
                            const currentProb =
                              1 -
                              calculateWinProbability(
                                player.name,
                                current.name,
                              );
                            const bestProb = best
                              ? 1 -
                                calculateWinProbability(player.name, best.name)
                              : 0;

                            return currentProb > bestProb ? current : best;
                          },
                          null,
                        );

                        if (bestOpponent) {
                          console.log(
                            `Auto-selecting opponent for game4:`,
                            bestOpponent.name,
                          );
                          handleOpponentSelection("game4", bestOpponent);
                        }
                      }
                    }}
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
      // We lost the coin flip, opponent chooses player for game 4
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Pool Team Stats Analyzer
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Game 4 Selection</h2>
            <p className="mb-4">
              The opponent selects a player for Game 4. Which player did they
              choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => (
                <div
                  key={`select-opponent-${player.name}`}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    handleOpponentSelection("game4", player);

                    // Get best home player against this opponent
                    const bestMatchupResult = getBestPlayerAgainst(
                      availableHomePlayers,
                      player,
                    );
                    if (bestMatchupResult) {
                      const homePlayer = bestMatchupResult.player;
                      selectPlayerForGame("game4", "home", homePlayer);
                    }
                  }}
                >
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-gray-600">
                    HCP: {player.handicap}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      Our best player against them:
                    </div>
                    {availableHomePlayers.length > 0 && (
                      <div className="text-sm mt-1">
                        {getBestPlayerAgainst(availableHomePlayers, player)
                          ?.player.displayName || "N/A"}
                        (
                        {Math.round(
                          (getBestPlayerAgainst(availableHomePlayers, player)
                            ?.winProb || 0) * 100,
                        )}
                        % win probability)
                      </div>
                    )}
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
  }
  // Render Game 1 opponent selection
if (currentStep === "game-1-opponent") {
  return renderOpponentSelectionScreen(1);
}

// Render Game 2 opponent selection
if (currentStep === "game-2-opponent") {
  return renderOpponentSelectionScreen(2);
}

// Render Game 3 opponent selection
if (currentStep === "game-3-opponent") {
  return renderOpponentSelectionScreen(3);
}

// Render Game 4 opponent selection
if (currentStep === "game-4-opponent") {
  return renderOpponentSelectionScreen(4);
}

  // Render summary
  if (currentStep === "summary") {
    // Calculate overall win probability
    const matchupsWithProbability = Object.values(selectedPlayers)
      .filter((matchup) => matchup.home && matchup.away)
      .map((matchup) => ({
        ...matchup,
        winProbability: calculateWinProbability(
          matchup.home.name,
          matchup.away.name,
        ),
      }));

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

                  // Debug: Log the matchup data to see what's missing
                  console.log(`Game ${gameNum} matchup:`, matchup);

                  // Skip rows where either player is missing
                  if (!matchup.home || !matchup.away) {
                    console.log(
                      `Game ${gameNum} missing player data:`,
                      !matchup.home
                        ? "home player missing"
                        : "away player missing",
                    );
                    return null;
                  }

                  const winProb = calculateWinProbability(
                    matchup.home.name,
                    matchup.away.name,
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

  // Default fallback
  return (
    <div className="text-center p-8">
      <p>Unknown step: {currentStep}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
        onClick={handleReset}
      >
        Start Over
      </button>
    </div>
  );
}

export default App;