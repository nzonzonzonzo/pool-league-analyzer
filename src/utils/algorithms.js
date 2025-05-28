/*Helper function to make a matrix copy*/
export function makeMatrixCopy(matrix) {
  return matrix.map(row => [...row]);
}

/**
 * Helper function to determine if home player selects blind based on game number and coin flip
 * @param {number} gameNum - The game number (1-4)
 * @param {boolean} wonCoinFlip - Whether the home team won the coin flip
 * @returns {boolean} - True if home team selects blind, false otherwise
 */
export function isHomeSelectingBlind(gameNum, wonCoinFlip) {
  // For WON coin flip: Home blind for Games 2, 3; Away blind for Games 1, 4
  // For LOST coin flip: Home blind for Games 1, 4; Away blind for Games 2, 3
  return (wonCoinFlip && (gameNum === 2 || gameNum === 3)) || 
         (!wonCoinFlip && (gameNum === 1 || gameNum === 4));
}

/**
 * Implementation of the Hungarian algorithm for optimal assignment problems
 * @param {Array<Array<number>>} matrix - Cost matrix where each cell represents the cost of assigning a player to an opponent
 * @returns {Array<Array<number>>} - Optimal assignments as [row, column] pairs
 */
export function hungarianOptimalAssignment(matrix) {
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

/**
 * Find the optimal player to select blind based on overall win probabilities
 * @param {Array} availableHomePlayers - List of available home players
 * @param {Array} availableAwayPlayers - List of available away players
 * @param {Array} teamStats - All team statistics
 * @param {Array} allMatches - All match history data
 * @returns {Object|null} - The optimal player to select
 */
export function findOptimalBlindPlayer(availableHomePlayers, availableAwayPlayers, teamStats, allMatches, calculateWinProbability) {
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

/**
 * Find the best player to respond to an opponent's choice
 * @param {number} gameNumber - Current game number
 * @param {Object} opponentPlayer - The opponent player
 * @param {Array} availableHomePlayers - List of available home players
 * @param {Array} availableAwayPlayers - List of available away players
 * @param {Object} selectedPlayers - Currently selected players for all games
 * @param {Array} teamStats - All team statistics
 * @param {Array} allMatches - All match history data
 * @returns {Object|null} - The best player to select
 */
export function findBestResponsePlayer(
  gameNumber, 
  opponentPlayer, 
  availableHomePlayers, 
  availableAwayPlayers, 
  selectedPlayers, 
  teamStats, 
  allMatches,
  calculateWinProbability
) {
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

