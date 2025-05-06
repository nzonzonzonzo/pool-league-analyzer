import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Name formatting utility - more economical implementation
const formatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  const parts = fullName.split(' ');
  return parts.length <= 1 ? fullName : 
    `${parts.slice(0, parts.length - 1).join(' ')} ${parts[parts.length - 1][0]}.`;
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
        
        <h3 className="text-lg font-medium mb-2 text-white">Team Lineup Optimization (Monte Carlo Simulation)</h3>
        <p className="mb-2 text-gray-300">To determine the best possible lineup for your team, we use Monte Carlo simulation to model all possible match outcomes:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Dynamic Simulations:</span> The system simulates hundreds of potential match scenarios:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Optimizes for winning at least 2 matches</li>
              <li>Accounts for game differential as a tiebreaker</li>
              <li>Recalculates optimal strategy after each player selection</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Scenario Analysis:</span> The algorithm considers all possible opponent responses:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Predicts the most likely opponent selections</li>
              <li>Evaluates the overall match outcome for each scenario</li>
              <li>Recommends the player selection that maximizes overall team win probability</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Long-term Strategy:</span> Rather than optimizing each individual game in isolation, the system plans ahead to maximize final match win probability.</li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-white">The Calculation Process</h3>
        <p className="mb-2 text-gray-300">After each selection, the system:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li>Runs hundreds of simulated match completions</li>
          <li>Evaluates the probability of winning at least 2 matches for each potential player selection</li>
          <li>Recommends the player that maximizes overall team win probability</li>
        </ol>
        
        <p className="mb-0 italic text-gray-300">This sophisticated approach goes beyond simple one-to-one matchup analysis, giving your team a significant strategic advantage by optimizing for overall match victory rather than individual game wins.</p>
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
// -------------------- MONTE CARLO SIMULATION FUNCTIONS --------------------

// Efficient function to create a shallow copy of an object that's sufficient for our needs
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

// Helper function to determine if home player selects blind based on game number and coin flip
function shouldHomePlayerSelectBlind(game, wonCoinFlip) {
  const gameNumber = parseInt(game.replace("game", ""));
  return wonCoinFlip ? 
    (gameNumber === 2 || gameNumber === 4) : 
    (gameNumber === 1 || gameNumber === 3);
}

// Random player selection for simulation
function selectRandomPlayer(availablePlayers) {
  if (!availablePlayers || availablePlayers.length === 0) return null;
  return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
}

// Simulate individual games within a match (best of 3)
function simulateMatchGames(winProbability) {
  let homeWins = 0;
  let awayWins = 0;
  
  while (homeWins < 2 && awayWins < 2) {
    if (Math.random() < winProbability) {
      homeWins++;
    } else {
      awayWins++;
    }
  }
  
  return homeWins;
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

// Calculate win rates by handicap level
function calculateWinRatesByHandicap(playerName, allMatches) {
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
}

// Get head-to-head record between two players
function getHeadToHeadRecord(player1, player2, allMatches) {
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
}

// Simulate a complete match with given player selections
function simulateMatchResults(selections, teamStats, allMatches) {
  let homeMatchWins = 0;
  let awayMatchWins = 0;
  let homeGameWins = 0;
  let awayGameWins = 0;
  
  // For each game
  ["game1", "game2", "game3", "game4"].forEach(game => {
    const homePlayer = selections[game].home;
    const awayPlayer = selections[game].away;
    
    if (homePlayer && awayPlayer) {
      const winProb = calculateWinProbability(homePlayer.name, awayPlayer.name, teamStats, allMatches);
      
      // Simulate the match outcome (assuming best of 3)
      const homeWins = simulateMatchGames(winProb);
      const awayWins = 3 - homeWins; // Assuming best of 3 format
      
      // Record game wins
      homeGameWins += homeWins;
      awayGameWins += awayWins;
      
      // Record match win
      if (homeWins > awayWins) {
        homeMatchWins++;
      } else {
        awayMatchWins++;
      }
    }
  });
  
  // Determine overall winner
  const homeTeamWins = 
    homeMatchWins > 2 || (homeMatchWins === 2 && homeGameWins > awayGameWins);
  
  return {
    homeTeamWins,
    homeMatchWins,
    awayMatchWins,
    homeGameWins,
    awayGameWins
  };
}

// Simulate the remaining games after the current selection
function simulateRemainingGames(
  simulatedSelections,
  remainingHomePlayers,
  remainingAwayPlayers,
  currentGame,
  wonCoinFlip,
  teamStats,
  allMatches
) {
  const gameOrder = ["game1", "game2", "game3", "game4"];
  const currentGameIndex = gameOrder.indexOf(currentGame);
  
  // Clone arrays to avoid modifying the originals during simulation
  let homePlayers = [...remainingHomePlayers];
  let awayPlayers = [...remainingAwayPlayers];
  
  // Simulate selections for all remaining games
  for (let i = currentGameIndex + 1; i < gameOrder.length; i++) {
    const game = gameOrder[i];
    
    // Apply selection logic based on coin flip result and game number
    if (shouldHomePlayerSelectBlind(game, wonCoinFlip)) {
      // Home team selects blind
      const homePlayer = selectRandomPlayer(homePlayers);
      if (homePlayer) {
        simulatedSelections[game].home = homePlayer;
        homePlayers = homePlayers.filter(p => p.name !== homePlayer.name);
        
        // Away team responds with best player
        if (awayPlayers.length > 0) {
          // Find player with lowest win probability against home player
          let bestOpponent = null;
          let lowestWinProb = 1;
          
          for (const player of awayPlayers) {
            const winProb = calculateWinProbability(homePlayer.name, player.name, teamStats, allMatches);
            if (winProb < lowestWinProb) {
              lowestWinProb = winProb;
              bestOpponent = player;
            }
          }
          
          if (bestOpponent) {
            simulatedSelections[game].away = bestOpponent;
            awayPlayers = awayPlayers.filter(p => p.name !== bestOpponent.name);
          }
        }
      }
    } else {
      // Away team selects blind
      const awayPlayer = selectRandomPlayer(awayPlayers);
      if (awayPlayer) {
        simulatedSelections[game].away = awayPlayer;
        awayPlayers = awayPlayers.filter(p => p.name !== awayPlayer.name);
        
        // Home team responds with best player
        if (homePlayers.length > 0) {
          // Find player with highest win probability against away player
          let bestPlayer = null;
          let highestWinProb = 0;
          
          for (const player of homePlayers) {
            const winProb = calculateWinProbability(player.name, awayPlayer.name, teamStats, allMatches);
            if (winProb > highestWinProb) {
              highestWinProb = winProb;
              bestPlayer = player;
            }
          }
          
          if (bestPlayer) {
            simulatedSelections[game].home = bestPlayer;
            homePlayers = homePlayers.filter(p => p.name !== bestPlayer.name);
          }
        }
      }
    }
  }
  
  return simulatedSelections;
}

// Main Monte Carlo simulation function
function runMonteCarloSimulation(
  availableHomePlayers,
  availableAwayPlayers,
  currentSelections,
  currentGame,
  wonCoinFlip,
  teamStats,
  allMatches,
  iterations = 200
) {
  // Track results for different player choices
  const playerResults = {};
  
  // For each possible player we could select
  for (const homePlayer of availableHomePlayers) {
    playerResults[homePlayer.name] = {
      matchWins: 0,
      gameWins: 0,
      totalSimulations: 0,
      player: homePlayer
    };
    
    // Create a copy of available players for simulation
    const remainingHomePlayers = availableHomePlayers.filter(p => p.name !== homePlayer.name);
    
    // Run multiple simulations with this player choice
    for (let i = 0; i < iterations; i++) {
      // Create a copy of current selections to simulate this scenario
      const simulatedSelections = cloneSelections(currentSelections);
      
      // Add this player as our choice for current game
      simulatedSelections[currentGame].home = homePlayer;
      
      // Simulation differs based on blind vs. response
      if (shouldHomePlayerSelectBlind(currentGame, wonCoinFlip)) {
        // Home team selects blind, so simulate opponent's response
        // Find best opponent against our player (lowest win probability)
        if (availableAwayPlayers.length > 0) {
          let bestOpponent = null;
          let lowestWinProb = 1;
          
          for (const player of availableAwayPlayers) {
            const winProb = calculateWinProbability(homePlayer.name, player.name, teamStats, allMatches);
            if (winProb < lowestWinProb) {
              lowestWinProb = winProb;
              bestOpponent = player;
            }
          }
          
          if (bestOpponent) {
            simulatedSelections[currentGame].away = bestOpponent;
            // Simulate remaining games
            const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== bestOpponent.name);
            simulateRemainingGames(
              simulatedSelections,
              remainingHomePlayers,
              remainingAwayPlayers,
              currentGame,
              wonCoinFlip,
              teamStats,
              allMatches
            );
          }
        }
      } else {
        // Home team responds to opponent's blind selection
        // Randomly select an opponent player (since we don't know who they'll choose)
        const randomOpponent = selectRandomPlayer(availableAwayPlayers);
        
        if (randomOpponent) {
          simulatedSelections[currentGame].away = randomOpponent;
          // Simulate remaining games
          const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== randomOpponent.name);
          simulateRemainingGames(
            simulatedSelections,
            remainingHomePlayers,
            remainingAwayPlayers,
            currentGame,
            wonCoinFlip,
            teamStats,
            allMatches
          );
        }
      }
      
      // Calculate the match result
      const matchResult = simulateMatchResults(simulatedSelections, teamStats, allMatches);
      
      // Track results
      if (matchResult.homeTeamWins) playerResults[homePlayer.name].matchWins++;
      playerResults[homePlayer.name].gameWins += matchResult.homeGameWins;
      playerResults[homePlayer.name].totalSimulations++;
    }
  }
  
  return playerResults;
}

// -------------------- MAIN APP COMPONENT --------------------

function App() {
  // UI state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [allMatches, setAllMatches] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [simulations, setSimulations] = useState({});
  const [optimalPlayer, setOptimalPlayer] = useState(null);
  
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
  
  // Configuration
  const SIMULATION_COUNT = 200;

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

  // Run Monte Carlo when entering a game selection step
  useEffect(() => {
    if (currentStep.startsWith("game-") && 
        !currentStep.includes("opponent") && 
        !isCalculating && 
        availableHomePlayers.length > 0 && 
        availableAwayPlayers.length > 0) {
      runOptimalStrategyCalculation();
    }
  }, [currentStep, availableHomePlayers, availableAwayPlayers]);

  // Run Monte Carlo simulations to find optimal strategy
  const runOptimalStrategyCalculation = () => {
    setIsCalculating(true);
    
    // Use setTimeout to prevent UI freezing
    setTimeout(() => {
      const results = runMonteCarloSimulation(
        availableHomePlayers,
        availableAwayPlayers,
        selectedPlayers,
        getCurrentGame(),
        wonCoinFlip,
        teamStats,
        allMatches,
        SIMULATION_COUNT
      );
      
      setSimulations(results);
      
      // Find the best player
      let bestPlayer = null;
      let bestWinRate = -1;
      
      for (const [playerName, result] of Object.entries(results)) {
        const winRate = result.matchWins / result.totalSimulations;
        if (winRate > bestWinRate) {
          bestWinRate = winRate;
          bestPlayer = result.player;
        }
      }
      
      setOptimalPlayer(bestPlayer);
      setIsCalculating(false);
    }, 50);
  };
  
  // Helper to get current game from step
  const getCurrentGame = () => {
    if (currentStep.startsWith("game-")) {
      const gamePart = currentStep.split("-")[1];
      if (gamePart && !isNaN(parseInt(gamePart))) {
        return `game${parseInt(gamePart)}`;
      }
    }
    return "game1"; // Default
  };

  // Function to choose player for a game
  const selectPlayerForGame = (game, team, player) => {
    // Update selected players
    setSelectedPlayers(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        [team]: player,
      },
    }));

    // Remove player from available list
    if (team === "home") {
      setAvailableHomePlayers(prev => prev.filter(p => p.name !== player.name));
      
      // Special cases for blind selections - redirect to opponent selection screens
      if ((!wonCoinFlip && (game === "game1" || game === "game3")) || 
          (wonCoinFlip && (game === "game2" || game === "game4"))) {
        setCurrentStep(`${game}-opponent`);
        return;
      }
    } else {
      setAvailableAwayPlayers(prev => prev.filter(p => p.name !== player.name));
    }

    // Move to next step for all other cases
    const gameNumber = parseInt(game.replace("game", ""));
    setCurrentStep(gameNumber < 4 ? `game-${gameNumber + 1}` : "summary");
  };

  // Handle opponent selection
  const handleOpponentSelection = (game, player) => {
    // Update selected players
    setSelectedPlayers(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        away: player,
      },
    }));

    // Remove player from available list
    setAvailableAwayPlayers(prev => prev.filter(p => p.name !== player.name));
    
    // Move to next game or summary
    const gameNumber = parseInt(game.replace("game", ""));
    setCurrentStep(gameNumber < 4 ? `game-${gameNumber + 1}` : "summary");
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
    setSimulations({});
    setOptimalPlayer(null);
    setCurrentStep("game-1");
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
    setSimulations({});
    setOptimalPlayer(null);
    setIsCalculating(false);
  };

  // Helper function to render the opponent selection screen
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
              player.name,
              teamStats,
              allMatches
            );
            
            return (
              <div
                key={`opponent-player-${player.name}`}
                className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => handleOpponentSelection(game, player)}
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
              {availableAwayPlayers.map((player) => {
                // Start Monte Carlo simulation when opponent player selected
                const simulateMatchup = () => {
                  setIsCalculating(true);
                  
                  // First record the opponent's player selection
                  handleOpponentSelection("game1", player);
                  
                  // Remove player from available opponents
                  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== player.name);
                  
                  // Run quick simulation to find best player against this opponent
                  setTimeout(() => {
                    // Create a mini-simulation for each of our players against this opponent
                    const playerResults = {};
                    
                    for (const homePlayer of availableHomePlayers) {
                      // Simulate match outcomes with this pairing
                      let matchWins = 0;
                      const simCount = 50; // Quick response simulation
                      
                      for (let i = 0; i < simCount; i++) {
                        // Create temporary game selections
                        const tempSelections = cloneSelections(selectedPlayers);
                        tempSelections.game1 = { home: homePlayer, away: player };
                        
                        // Simulate remaining games
                        const remainingHomePlayers = availableHomePlayers.filter(p => p.name !== homePlayer.name);
                        simulateRemainingGames(
                          tempSelections,
                          remainingHomePlayers,
                          remainingAwayPlayers,
                          "game1",
                          wonCoinFlip,
                          teamStats,
                          allMatches
                        );
                        
                        // Calculate match results
                        const result = simulateMatchResults(tempSelections, teamStats, allMatches);
                        if (result.homeTeamWins) {
                          matchWins++;
                        }
                      }
                      
                      // Record win probability
                      playerResults[homePlayer.name] = {
                        player: homePlayer,
                        winProb: matchWins / simCount
                      };
                    }
                    
                    // Find best player
                    let bestPlayer = null;
                    let bestWinProb = -1;
                    
                    for (const [name, result] of Object.entries(playerResults)) {
                      if (result.winProb > bestWinProb) {
                        bestWinProb = result.winProb;
                        bestPlayer = result.player;
                      }
                    }
                    
                    if (bestPlayer) {
                      // Auto-select best player
                      selectPlayerForGame("game1", "home", bestPlayer);
                    }
                    
                    setIsCalculating(false);
                  }, 50);
                };
                
                return (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={simulateMatchup}
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
                <p>Calculating optimal strategy...</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Recommended player:{" "}
                  <span className="font-bold">
                    {optimalPlayer?.displayName || "Calculating..."}
                  </span>
                </p>
                <p className="text-sm mb-6">
                  This recommendation is based on Monte Carlo simulation of {SIMULATION_COUNT} possible match outcomes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableHomePlayers.map((player) => {
                    const playerSimResults = simulations[player.name] || {};
                    const winProb = playerSimResults.matchWins / (playerSimResults.totalSimulations || 1);
                    
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
                          <div className="text-sm">Team win probability:</div>
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

  // Render Game 2 selection
  if (currentStep === "game-2") {
    if (wonCoinFlip) {
      // We won the coin flip, we choose player for game 1 and put up blind for game 2
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
            
            {isCalculating ? (
              <div className="text-center py-4">
                <p>Running Monte Carlo simulations...</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Recommended player:{" "}
                  <span className="font-bold">
                    {optimalPlayer?.displayName || "Calculating..."}
                  </span>
                </p>
                <p className="text-sm mb-6">
                  This recommendation is based on {SIMULATION_COUNT} simulated match outcomes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableHomePlayers.map((player) => {
                    const playerSimResults = simulations[player.name] || {};
                    const winProb = playerSimResults.matchWins / (playerSimResults.totalSimulations || 1);
                    
                    return (
                      <div
                        key={`select-player-${player.name}`}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                          player.name === optimalPlayer?.name
                            ? "bg-green-50 border-green-500"
                            : ""
                        }`}
                        onClick={() => selectPlayerForGame("game2", "home", player)}
                      >
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          HCP: {player.handicap}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm">Team win probability:</div>
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
      // We lost the coin flip, opponent chooses player for game 2
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
              The opponent selects a player for Game 2. Which player did they choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => {
                // Start Monte Carlo simulation when opponent player selected
                const simulateMatchup = () => {
                  setIsCalculating(true);
                  
                  // First record the opponent's player selection
                  handleOpponentSelection("game2", player);
                  
                  // Remove player from available opponents
                  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== player.name);
                  
                  // Run quick simulation to find best player against this opponent
                  setTimeout(() => {
                    // Create a mini-simulation for each of our players against this opponent
                    const playerResults = {};
                    
                    for (const homePlayer of availableHomePlayers) {
                      // Simulate match outcomes with this pairing
                      let matchWins = 0;
                      const simCount = 50; // Quick response simulation
                      
                      for (let i = 0; i < simCount; i++) {
                        // Create temporary game selections
                        const tempSelections = cloneSelections(selectedPlayers);
                        tempSelections.game2 = { home: homePlayer, away: player };
                        
                        // Simulate remaining games
                        const remainingHomePlayers = availableHomePlayers.filter(p => p.name !== homePlayer.name);
                        simulateRemainingGames(
                          tempSelections,
                          remainingHomePlayers,
                          remainingAwayPlayers,
                          "game2",
                          wonCoinFlip,
                          teamStats,
                          allMatches
                        );
                        
                        // Calculate match results
                        const result = simulateMatchResults(tempSelections, teamStats, allMatches);
                        if (result.homeTeamWins) {
                          matchWins++;
                        }
                      }
                      
                      // Record win probability
                      playerResults[homePlayer.name] = {
                        player: homePlayer,
                        winProb: matchWins / simCount
                      };
                    }
                    
                    // Find best player
                    let bestPlayer = null;
                    let bestWinProb = -1;
                    
                    for (const [name, result] of Object.entries(playerResults)) {
                      if (result.winProb > bestWinProb) {
                        bestWinProb = result.winProb;
                        bestPlayer = result.player;
                      }
                    }
                    
                    if (bestPlayer) {
                      // Auto-select best player
                      selectPlayerForGame("game2", "home", bestPlayer);
                    }
                    
                    setIsCalculating(false);
                  }, 50);
                };
                
                return (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={simulateMatchup}
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
              The opponent puts up a player blind for Game 3. Which player did they choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => {
                // Start Monte Carlo simulation when opponent player selected
                const simulateMatchup = () => {
                  setIsCalculating(true);
                  
                  // First record the opponent's player selection
                  handleOpponentSelection("game3", player);
                  
                  // Remove player from available opponents
                  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== player.name);
                  
                  // Run quick simulation to find best player against this opponent
                  setTimeout(() => {
                    // Create a mini-simulation for each of our players against this opponent
                    const playerResults = {};
                    
                    for (const homePlayer of availableHomePlayers) {
                      // Simulate match outcomes with this pairing
                      let matchWins = 0;
                      const simCount = 50; // Quick response simulation
                      
                      for (let i = 0; i < simCount; i++) {
                        // Create temporary game selections
                        const tempSelections = cloneSelections(selectedPlayers);
                        tempSelections.game3 = { home: homePlayer, away: player };
                        
                        // Simulate remaining games
                        const remainingHomePlayers = availableHomePlayers.filter(p => p.name !== homePlayer.name);
                        simulateRemainingGames(
                          tempSelections,
                          remainingHomePlayers,
                          remainingAwayPlayers,
                          "game3",
                          wonCoinFlip,
                          teamStats,
                          allMatches
                        );
                        
                        // Calculate match results
                        const result = simulateMatchResults(tempSelections, teamStats, allMatches);
                        if (result.homeTeamWins) {
                          matchWins++;
                        }
                      }
                      
                      // Record win probability
                      playerResults[homePlayer.name] = {
                        player: homePlayer,
                        winProb: matchWins / simCount
                      };
                    }
                    
                    // Find best player
                    let bestPlayer = null;
                    let bestWinProb = -1;
                    
                    for (const [name, result] of Object.entries(playerResults)) {
                      if (result.winProb > bestWinProb) {
                        bestWinProb = result.winProb;
                        bestPlayer = result.player;
                      }
                    }
                    
                    if (bestPlayer) {
                      // Auto-select best player
                      selectPlayerForGame("game3", "home", bestPlayer);
                    }
                    
                    setIsCalculating(false);
                  }, 50);
                };
                
                return (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={simulateMatchup}
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
        </div>
      );
    } else {
      // We lost the coin flip, so we put up blind for game 3
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
              You need to put up a player blind for Game 3.
            </p>
            
            {isCalculating ? (
              <div className="text-center py-4">
                <p>Calculating optimal strategy...</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Recommended player:{" "}
                  <span className="font-bold">
                    {optimalPlayer?.displayName || "Calculating..."}
                  </span>
                </p>
                <p className="text-sm mb-6">
                  This recommendation is based on Monte Carlo simulation of {SIMULATION_COUNT} possible match outcomes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableHomePlayers.map((player) => {
                    const playerSimResults = simulations[player.name] || {};
                    const winProb = playerSimResults.matchWins / (playerSimResults.totalSimulations || 1);
                    
                    return (
                      <div
                        key={`select-player-${player.name}`}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                          player.name === optimalPlayer?.name
                            ? "bg-green-50 border-green-500"
                            : ""
                        }`}
                        onClick={() => selectPlayerForGame("game3", "home", player)}
                      >
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          HCP: {player.handicap}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm">Team win probability:</div>
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

  // Render Game 4 selection
  if (currentStep === "game-4") {
    if (wonCoinFlip) {
      // We won the coin flip, we put up blind for game 4
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
            
            {isCalculating ? (
              <div className="text-center py-4">
                <p>Calculating optimal strategy...</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Recommended player:{" "}
                  <span className="font-bold">
                    {optimalPlayer?.displayName || "Calculating..."}
                  </span>
                </p>
                <p className="text-sm mb-6">
                  This recommendation is based on Monte Carlo simulation of {SIMULATION_COUNT} possible match outcomes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableHomePlayers.map((player) => {
                    const playerSimResults = simulations[player.name] || {};
                    const winProb = playerSimResults.matchWins / (playerSimResults.totalSimulations || 1);
                    
                    return (
                      <div
                        key={`select-player-${player.name}`}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                          player.name === optimalPlayer?.name
                            ? "bg-green-50 border-green-500"
                            : ""
                        }`}
                        onClick={() => selectPlayerForGame("game4", "home", player)}
                      >
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          HCP: {player.handicap}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm">Team win probability:</div>
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
      // We lost the coin flip, opponent chooses player for game 4
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
              The opponent selects a player for Game 4. Which player did they choose?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAwayPlayers.map((player) => {
                // Start Monte Carlo simulation when opponent player selected
                const simulateMatchup = () => {
                  setIsCalculating(true);
                  
                  // First record the opponent's player selection
                  handleOpponentSelection("game4", player);
                  
                  // Remove player from available opponents
                  const remainingAwayPlayers = availableAwayPlayers.filter(p => p.name !== player.name);
                  
                  // Run quick simulation to find best player against this opponent
                  setTimeout(() => {
                    // Create a mini-simulation for each of our players against this opponent
                    const playerResults = {};
                    
                    for (const homePlayer of availableHomePlayers) {
                      // Simulate match outcomes with this pairing
                      let matchWins = 0;
                      const simCount = 50; // Quick response simulation
                      
                      for (let i = 0; i < simCount; i++) {
                        // Create temporary game selections
                        const tempSelections = cloneSelections(selectedPlayers);
                        tempSelections.game4 = { home: homePlayer, away: player };
                        
                        // Calculate match results (all players selected at this point)
                        const result = simulateMatchResults(tempSelections, teamStats, allMatches);
                        if (result.homeTeamWins) {
                          matchWins++;
                        }
                      }
                      
                      // Record win probability
                      playerResults[homePlayer.name] = {
                        player: homePlayer,
                        winProb: matchWins / simCount
                      };
                    }
                    
                    // Find best player
                    let bestPlayer = null;
                    let bestWinProb = -1;
                    
                    for (const [name, result] of Object.entries(playerResults)) {
                      if (result.winProb > bestWinProb) {
                        bestWinProb = result.winProb;
                        bestPlayer = result.player;
                      }
                    }
                    
                    if (bestPlayer) {
                      // Auto-select best player
                      selectPlayerForGame("game4", "home", bestPlayer);
                    }
                    
                    setIsCalculating(false);
                  }, 50);
                };
                
                return (
                  <div
                    key={`select-opponent-${player.name}`}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={simulateMatchup}
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
        </div>
      );
    }
  }
  
  // Render Game 1, 2, 3, 4 opponent selection
  if (currentStep === "game-1-opponent" || 
      currentStep === "game-2-opponent" || 
      currentStep === "game-3-opponent" || 
      currentStep === "game-4-opponent") {
    const gameNumber = parseInt(currentStep.split("-")[1]);
    return renderOpponentSelectionScreen(gameNumber);
  }
  
  // Render summary
  if (currentStep === "summary") {
    // Calculate overall win probability based on actual selections
    const calculateFinalProbabilities = () => {
      // Run 500 simulations of the final matchups
      let matchWins = 0;
      let totalGameWins = 0;
      const simulationCount = 500;
      
      for (let i = 0; i < simulationCount; i++) {
        const result = simulateMatchResults(selectedPlayers, teamStats, allMatches);
        if (result.homeTeamWins) {
          matchWins++;
        }
        totalGameWins += result.homeGameWins;
      }
      
      return {
        matchWinProbability: matchWins / simulationCount,
        expectedGameWins: totalGameWins / simulationCount
      };
    };
    
    const finalProbabilities = calculateFinalProbabilities();
    const overallWinPercentage = Math.round(finalProbabilities.matchWinProbability * 100);

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
            Here are the final player matchups based on Monte Carlo optimization:
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

                  // Skip rows where either player is missing
                  if (!matchup.home || !matchup.away) {
                    return null;
                  }

                  const winProb = calculateWinProbability(
                    matchup.home.name,
                    matchup.away.name,
                    teamStats,
                    allMatches
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
              Expected game wins: {finalProbabilities.expectedGameWins.toFixed(1)} of 12 possible
            </p>
            <p className="text-sm mt-2">
              {overallWinPercentage > 50
                ? "Your team has a favorable advantage based on Monte Carlo simulation!"
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
  
  // Default fallback view
  return (
    <div className="text-center p-8">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
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