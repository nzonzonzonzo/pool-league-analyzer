/**
 * Enhanced win probability calculation with handicap performance analysis
 * @param {string} playerName - Player's name
 * @param {string} handicapRelation - 'lower', 'higher', or 'equal'
 * @param {Array} allMatches - All match history data
 * @returns {Object} - Performance data for this handicap relationship
 */
function getHandicapPerformance(playerName, handicapRelation, allMatches) {
  const playerMatches = allMatches.filter(match => 
    match.homePlayer === playerName || match.awayPlayer === playerName
  );
  
  if (playerMatches.length === 0) return { winRate: 0.5, matchCount: 0 };
  
  const relevantMatches = playerMatches.filter(match => {
    let playerHCP, opponentHCP;
    
    if (match.homePlayer === playerName) {
      playerHCP = match.homeHCP;
      opponentHCP = match.awayHCP;
    } else {
      playerHCP = match.awayHCP;
      opponentHCP = match.homeHCP;
    }
    
    if (handicapRelation === "lower") return playerHCP < opponentHCP;
    if (handicapRelation === "higher") return playerHCP > opponentHCP;
    return playerHCP === opponentHCP;
  });
  
  if (relevantMatches.length === 0) return { winRate: 0.5, matchCount: 0 };
  
  const wins = relevantMatches.filter(match => {
    if (match.homePlayer === playerName) return match.winner === playerName;
    else return match.winner === playerName;
  }).length;
  
  return {
    winRate: wins / relevantMatches.length,
    matchCount: relevantMatches.length
  };
}

/**
 * Calculate win rates by handicap level (simplified version for fallback)
 * @param {string} playerName - Player's name
 * @param {Array} allMatches - All match history data
 * @returns {Object} - Win rates against different handicap levels
 */
export function calculateWinRatesByHandicap(playerName, allMatches) {
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

/**
 * Get head-to-head record between two players
 * @param {string} player1 - First player's name
 * @param {string} player2 - Second player's name
 * @param {Array} allMatches - All match history data
 * @returns {Object} - Head-to-head record
 */
export function getHeadToHeadRecord(player1, player2, allMatches) {
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

/**
 * Enhanced win probability calculation with advanced factors
 * @param {string} homePlayerName - Home player's name
 * @param {string} awayPlayerName - Away player's name
 * @param {Array} teamStats - All team statistics
 * @param {Array} allMatches - All match history data
 * @returns {number} - Win probability (0-1)
 */
export function calculateWinProbability(homePlayerName, awayPlayerName, teamStats, allMatches) {
  // Find players in team stats
  const homePlayer = teamStats.find(p => p.name === homePlayerName);
  const awayPlayer = teamStats.find(p => p.name === awayPlayerName);
  
  if (!homePlayer || !awayPlayer) {
    return 0.5; // Default to 50% if either player isn't found
  }
  
  // Get handicap relationship
  const homeHCP = homePlayer.handicap;
  const awayHCP = awayPlayer.handicap;
  const handicapRelationship = homeHCP < awayHCP ? "lower" : (homeHCP > awayHCP ? "higher" : "equal");
  
  // Calculate how home player performs against players with this handicap relationship
  const homeVsRelationPerformance = getHandicapPerformance(homePlayerName, handicapRelationship, allMatches);
  
  // Calculate how away player performs as this handicap relationship
  // Need inverse relationship - if home is playing against higher, then away is playing as higher
  const awayAsRelationPerformance = getHandicapPerformance(
    awayPlayerName, 
    handicapRelationship === "higher" ? "lower" : 
    (handicapRelationship === "lower" ? "higher" : "equal"),
    allMatches
  );
  
  // Calculate base probability using each player's performance against this handicap scenario
  let baseProbability = 0.5; // Start with 50/50
  
  // Adjust based on home player's performance against this handicap relationship
  if (homeVsRelationPerformance.matchCount > 0) {
    // Weight increases with sample size (max weight of 0.3 with 10+ matches)
    const homeWeight = Math.min(0.3, homeVsRelationPerformance.matchCount / 10 * 0.3);
    baseProbability = (baseProbability * (1 - homeWeight)) + (homeVsRelationPerformance.winRate * homeWeight);
  }
  
  // Adjust based on away player's performance as this handicap relationship
  if (awayAsRelationPerformance.matchCount > 0) {
    // Weight increases with sample size (max weight of 0.3 with 10+ matches)
    const awayWeight = Math.min(0.3, awayAsRelationPerformance.matchCount / 10 * 0.3);
    // Use 1 - winRate because we're calculating probability for home player
    baseProbability = (baseProbability * (1 - awayWeight)) + ((1 - awayAsRelationPerformance.winRate) * awayWeight);
  }
  
  // Apply small default adjustment based on handicap difference (small effect, 1-2%)
  const handicapDiff = homeHCP - awayHCP;
  baseProbability += handicapDiff * 0.01; // Just 1% advantage per handicap point as a minor factor
  
  // Adjust for recent handicap changes
  if (homePlayer.handicapChangedRecently) {
    // If handicap went up recently, player might perform slightly worse than their new handicap suggests
    if (homePlayer.handicapTrend === 'increasing') {
      baseProbability -= 0.03; // Slight disadvantage for recently increased handicap
    } else if (homePlayer.handicapTrend === 'decreasing') {
      baseProbability += 0.02; // Slight advantage for recently decreased handicap
    }
  }
  
  if (awayPlayer.handicapChangedRecently) {
    // Same adjustment for away player
    if (awayPlayer.handicapTrend === 'increasing') {
      baseProbability += 0.03; // Advantage when playing against someone with recently increased handicap
    } else if (awayPlayer.handicapTrend === 'decreasing') {
      baseProbability -= 0.02; // Disadvantage when playing against someone with recently decreased handicap
    }
  }
  
  // Adjust for experience (seasons played)
  const homePlayerExperience = homePlayer.seasonsPlayed || 1;
  const awayPlayerExperience = awayPlayer.seasonsPlayed || 1;
  
  // Small advantage for more experienced players (diminishing returns)
  const experienceFactor = 0.02 * Math.log(homePlayerExperience / awayPlayerExperience + 1);
  baseProbability += experienceFactor;
  
  // Adjust for recent performance trends (using ELO rating trend)
  if (homePlayer.ratingTrend === 'improving') {
    baseProbability += 0.03;
  } else if (homePlayer.ratingTrend === 'declining') {
    baseProbability -= 0.03;
  }
  
  if (awayPlayer.ratingTrend === 'improving') {
    baseProbability -= 0.03;
  } else if (awayPlayer.ratingTrend === 'declining') {
    baseProbability += 0.03;
  }
  
  // Check head-to-head match history with 30% weight
  const headToHeadMatches = allMatches.filter(match => 
    (match.homePlayer === homePlayerName && match.awayPlayer === awayPlayerName) ||
    (match.homePlayer === awayPlayerName && match.awayPlayer === homePlayerName)
  );
  
  if (headToHeadMatches.length > 0) {
    const homeWins = headToHeadMatches.filter(match => 
      (match.homePlayer === homePlayerName && match.winner === homePlayerName) ||
      (match.awayPlayer === homePlayerName && match.winner === homePlayerName)
    ).length;
    
    const headToHeadWinRate = homeWins / headToHeadMatches.length;
    // Blend head-to-head history with overall probability (30% weight to head-to-head)
    baseProbability = (baseProbability * 0.7) + (headToHeadWinRate * 0.3);
  }
  
  // Ensure probability is between 0.1 and 0.9 (never completely certain)
  return Math.max(0.1, Math.min(0.9, baseProbability));
}