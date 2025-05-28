import { formatName } from './formatters';

/**
 * Load all data files needed for the application
 * @returns {Promise<Object>} Object containing all loaded data
 */
export const loadAppData = async () => {
  try {
    const basePath = process.env.PUBLIC_URL || ''; // Fixed for Create React App
    
    // Load match data (current season)
    const matchesResponse = await fetch(`${basePath}/data/all_matches_latest.json`);
    
    // Load regular team stats
    const statsResponse = await fetch(`${basePath}/data/player_stats_latest.json`);
    
    // Load combined player history data (optional)
    const playerHistoryResponse = await fetch(`${basePath}/data/combined/player_summary.json`);
    
    if (!matchesResponse.ok || !statsResponse.ok) {
      throw new Error("Failed to fetch data files");
    }

    const matchesData = await matchesResponse.json();
    const statsData = await statsResponse.json();
    
    // Filter out forfeit matches
    const validMatches = matchesData.filter(match => !match.forfeit);
    
    // Load combined history if available, otherwise use empty object
    let playerHistory = {};
    if (playerHistoryResponse.ok) {
      playerHistory = await playerHistoryResponse.json();
    }
    
    // Transform stats to add displayName, availability, and enhanced data
    const transformedStats = statsData.map(player => {
      const playerHistoryData = playerHistory[player.name] || {};
      
      return {
        ...player,
        displayName: formatName(player.name),
        available: true, // Default all players to available
        // Enhanced data for sophisticated probability calculations
        handicapTrend: playerHistoryData.handicap_trend || 'stable',
        recentWinPercentage: playerHistoryData.recent_win_percentage || parseFloat(player.winPercentage),
        eloRating: playerHistoryData.elo_rating || 1500,
        ratingTrend: playerHistoryData.rating_trend || 'stable',
        handicapChangedRecently: playerHistoryData.handicap_changed_recently || false,
        seasonsPlayed: playerHistoryData.seasons_played || 1,
        teamHistory: playerHistoryData.team_history || [player.team]
      };
    });

    

    // Extract unique team names
    const uniqueTeams = [...new Set(statsData.map(player => player.team))].sort();
    
    return {
      allMatches: validMatches,
      teamStats: transformedStats,
      teams: uniqueTeams,
      playerHistory
    };
    
  } catch (err) {
    console.error("Error loading data:", err);
    throw new Error("Failed to load data: " + err.message);
  }
};