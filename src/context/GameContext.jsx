import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  findOptimalBlindPlayer, 
  findBestResponsePlayer,
  isHomeSelectingBlind 
} from '../utils/algorithms';
import { calculateWinProbability } from '../utils/probability';
import { formatName } from '../utils/formatters';

// Helper functions for game flow logic
function shouldAutoSelectForGame(gameNum, wonCoinFlip) {
  if (wonCoinFlip) {
    // Won coin flip: auto-select for games 1 and 4 (opponent blind)
    return gameNum === 1 || gameNum === 4;
  } else {
    // Lost coin flip: auto-select for games 2 and 3 (opponent blind)
    return gameNum === 2 || gameNum === 3;
  }
}

function getNextStepAfterGame(completedGameNum, wonCoinFlip) {
  const nextGameNum = completedGameNum + 1;
  
  if (nextGameNum > 4) {
    return "summary";
  }
  
  if (wonCoinFlip) {
    // Won coin flip flow:
    // G1: opponent blind → G2: we blind → G3: we blind → G4: opponent blind
    if (nextGameNum === 2 || nextGameNum === 3) {
      return `game-${nextGameNum}`; // We blind
    } else if (nextGameNum === 4) {
      return `game-${nextGameNum}-opponent`; // Opponent blind
    }
  } else {
    // Lost coin flip flow:
    // G1: we blind → G2: opponent blind → G3: opponent blind → G4: we blind
    if (nextGameNum === 2 || nextGameNum === 3) {
      return `game-${nextGameNum}-opponent`; // Opponent blind
    } else if (nextGameNum === 4) {
      return `game-${nextGameNum}`; // We blind
    }
  }
  
  return `game-${nextGameNum}`;
}

// Initial state
const initialState = {
  // Data states
  allMatches: [],
  teamStats: [],
  teams: [],
  
  // Team selection
  selectedHomeTeam: "",
  selectedAwayTeam: "",
  homeTeamPlayers: [],
  awayTeamPlayers: [],
  homeTeamAllPlayers: [],
  awayTeamAllPlayers: [],
  
  // Game flow
  currentStep: "team-selection",
  wonCoinFlip: null,
  availableHomePlayers: [],
  availableAwayPlayers: [],
  selectedPlayers: {
    game1: { home: null, away: null },
    game2: { home: null, away: null },
    game3: { home: null, away: null },
    game4: { home: null, away: null },
  },
  
  // Algorithm results
  optimalPlayer: null,
  calculatedBestPlayer: null,
  lastAutoSelectedPlayer: null,
  
  // UI states
  isCalculating: false,
  error: null,
  loading: true,
  
  // History data
  playerHistory: {},
};

// Action types
const actionTypes = {
  SET_DATA: 'SET_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_HOME_TEAM: 'SET_HOME_TEAM',
  SET_AWAY_TEAM: 'SET_AWAY_TEAM',
  UPDATE_TEAM_STATS: 'UPDATE_TEAM_STATS',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_COIN_FLIP_RESULT: 'SET_COIN_FLIP_RESULT',
  SET_AVAILABLE_PLAYERS: 'SET_AVAILABLE_PLAYERS',
  SELECT_PLAYER: 'SELECT_PLAYER',
  SET_OPTIMAL_PLAYER: 'SET_OPTIMAL_PLAYER',
  SET_CALCULATED_BEST_PLAYER: 'SET_CALCULATED_BEST_PLAYER',
  SET_LAST_AUTO_SELECTED: 'SET_LAST_AUTO_SELECTED',
  SET_CALCULATING: 'SET_CALCULATING',
  RESET_GAME: 'RESET_GAME',
  TOGGLE_PLAYER_AVAILABILITY: 'TOGGLE_PLAYER_AVAILABILITY',
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_DATA:
      return {
        ...state,
        allMatches: action.payload.allMatches,
        teamStats: action.payload.teamStats,
        teams: action.payload.teams,
        playerHistory: action.payload.playerHistory || {},
        loading: false,
      };
      
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case actionTypes.SET_HOME_TEAM:
      const homeTeamAllPlayers = state.teamStats.filter(player => player.team === action.payload);
      const homeTeamPlayers = homeTeamAllPlayers.filter(player => player.available !== false);
      return {
        ...state,
        selectedHomeTeam: action.payload,
        homeTeamAllPlayers,
        homeTeamPlayers,
      };
      
    case actionTypes.SET_AWAY_TEAM:
      const awayTeamAllPlayers = state.teamStats.filter(player => player.team === action.payload);
      const awayTeamPlayers = awayTeamAllPlayers.filter(player => player.available !== false);
      return {
        ...state,
        selectedAwayTeam: action.payload,
        awayTeamAllPlayers,
        awayTeamPlayers,
      };
      
    case actionTypes.UPDATE_TEAM_STATS:
      return { ...state, teamStats: action.payload };
      
    case actionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
      
    case actionTypes.SET_COIN_FLIP_RESULT:
      return { ...state, wonCoinFlip: action.payload };
      
    case actionTypes.SET_AVAILABLE_PLAYERS:
      return {
        ...state,
        availableHomePlayers: action.payload.home,
        availableAwayPlayers: action.payload.away,
      };
      
    case actionTypes.SELECT_PLAYER:
      const { game, team, player } = action.payload;
      return {
        ...state,
        selectedPlayers: {
          ...state.selectedPlayers,
          [game]: {
            ...state.selectedPlayers[game],
            [team]: player,
          },
        },
        availableHomePlayers: team === 'home' 
          ? state.availableHomePlayers.filter(p => p.name !== player.name)
          : state.availableHomePlayers,
        availableAwayPlayers: team === 'away'
          ? state.availableAwayPlayers.filter(p => p.name !== player.name)
          : state.availableAwayPlayers,
      };
      
    case actionTypes.SET_OPTIMAL_PLAYER:
      return { ...state, optimalPlayer: action.payload };
      
    case actionTypes.SET_CALCULATED_BEST_PLAYER:
      return { ...state, calculatedBestPlayer: action.payload };
      
    case actionTypes.SET_LAST_AUTO_SELECTED:
      return { ...state, lastAutoSelectedPlayer: action.payload };
      
    case actionTypes.SET_CALCULATING:
      return { ...state, isCalculating: action.payload };
      
    case actionTypes.TOGGLE_PLAYER_AVAILABILITY:
      const { playerName } = action.payload;
      console.log(`[Reducer] Received toggle for: ${playerName}`);
      console.log(`[Reducer] Current teamStats:`, state.teamStats.map(p => ({ name: p.name, available: p.available })));
      
      const updatedTeamStats = state.teamStats.map(player => {
        if (player.name === playerName) {
          const newAvailable = player.available === false ? true : false;
          console.log(`[Reducer] ${playerName}: ${player.available} -> ${newAvailable}`);
          return { ...player, available: newAvailable };
        }
        return player;
      });
      
      console.log(`[Reducer] Updated teamStats:`, updatedTeamStats.map(p => ({ name: p.name, available: p.available })));
      
      // Update ALL the player arrays
      const updatedHomeTeamAllPlayers = state.selectedHomeTeam 
        ? updatedTeamStats.filter(player => player.team === state.selectedHomeTeam)
        : state.homeTeamAllPlayers;
        
      const updatedAwayTeamAllPlayers = state.selectedAwayTeam
        ? updatedTeamStats.filter(player => player.team === state.selectedAwayTeam)
        : state.awayTeamAllPlayers;
      
      const updatedHomeTeamPlayers = updatedHomeTeamAllPlayers.filter(player => player.available !== false);
      const updatedAwayTeamPlayers = updatedAwayTeamAllPlayers.filter(player => player.available !== false);
      
      return {
        ...state,
        teamStats: updatedTeamStats,
        homeTeamAllPlayers: updatedHomeTeamAllPlayers,
        awayTeamAllPlayers: updatedAwayTeamAllPlayers,
        homeTeamPlayers: updatedHomeTeamPlayers,
        awayTeamPlayers: updatedAwayTeamPlayers,
      };
      
    case actionTypes.RESET_GAME:
      return {
        ...initialState,
        // Preserve loaded data
        allMatches: state.allMatches,
        teamStats: state.teamStats,
        teams: state.teams,
        playerHistory: state.playerHistory,
        loading: false,
      };
      
    default:
      return state;
  }
};

// Context
const GameContext = createContext();

// Provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Action creators
  const actions = {
    // Data loading
    setData: useCallback((data) => {
      dispatch({ type: actionTypes.SET_DATA, payload: data });
    }, []),
    
    setLoading: useCallback((loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    }, []),
    
    setError: useCallback((error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    }, []),
    
    // Team selection
    setHomeTeam: useCallback((team) => {
      dispatch({ type: actionTypes.SET_HOME_TEAM, payload: team });
    }, []),
    
    setAwayTeam: useCallback((team) => {
      dispatch({ type: actionTypes.SET_AWAY_TEAM, payload: team });
    }, []),
    
    togglePlayerAvailability: useCallback((playerName) => {
      console.log(`[Action] togglePlayerAvailability called for: ${playerName}`);
      dispatch({ type: actionTypes.TOGGLE_PLAYER_AVAILABILITY, payload: { playerName } });
      console.log(`[Action] Dispatch completed`);
    }, []),
    
    // Game flow
    goToStep: useCallback((step) => {
      dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: step });
    }, []),
    
    handleTeamSelection: useCallback(() => {
      if (!state.selectedHomeTeam || !state.selectedAwayTeam) {
        dispatch({ type: actionTypes.SET_ERROR, payload: "Please select both teams first." });
        return;
      }
      
      dispatch({ 
        type: actionTypes.SET_AVAILABLE_PLAYERS, 
        payload: { 
          home: [...state.homeTeamPlayers], 
          away: [...state.awayTeamPlayers] 
        } 
      });
      dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: "coin-flip" });
    }, [state.selectedHomeTeam, state.selectedAwayTeam, state.homeTeamPlayers, state.awayTeamPlayers]),
    
    // FIXED: Coin flip result handling
    handleCoinFlipResult: useCallback((won) => {
      dispatch({ type: actionTypes.SET_COIN_FLIP_RESULT, payload: won });
      
      // Determine first step based on coin flip
      if (won) {
        // We won: opponent puts up blind for game 1
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: "game-1-opponent" });
      } else {
        // We lost: we put up blind for game 1  
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: "game-1" });
      }
    }, []),
    
    // FIXED: Player selection
    selectPlayerForGame: useCallback((game, team, player) => {
      if (!player || !player.name || !game || !team) {
        console.error("Invalid parameters in selectPlayerForGame");
        return;
      }
      
      const selectedPlayer = JSON.parse(JSON.stringify(player));
      const gameStr = String(game);
      const teamStr = String(team);
      const gameNumber = parseInt(gameStr.replace("game", ""), 10);
      
      console.log(`[selectPlayerForGame] Game ${gameNumber}, Team: ${teamStr}, Player: ${selectedPlayer.name}`);
      
      dispatch({ 
        type: actionTypes.SELECT_PLAYER, 
        payload: { game: gameStr, team: teamStr, player: selectedPlayer } 
      });
      
      // Navigate after state updates
      setTimeout(() => {
        let nextStep;
        
        if (teamStr === "home") {
          // After selecting home player, go to opponent selection for this game
          nextStep = `game-${gameNumber}-opponent`;
        } else {
          // This shouldn't happen in normal flow, but handle it
          if (gameNumber === 4) {
            nextStep = "summary";
          } else {
            nextStep = getNextStepAfterGame(gameNumber, state.wonCoinFlip);
          }
        }
        
        console.log(`[selectPlayerForGame] Navigating to: ${nextStep}`);
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: nextStep });
      }, 300);
    }, [state.wonCoinFlip]),
    
    // FIXED: Opponent selection with correct auto-select logic
    handleOpponentSelection: useCallback((gameNum, player) => {
      console.log(`[handleOpponentSelection] Game ${gameNum} - Player: ${player?.name}`);
      console.log(`[handleOpponentSelection] Coin flip:`, state.wonCoinFlip ? "WON" : "LOST");
      
      if (!player || !player.name) {
        console.error("Invalid player object in handleOpponentSelection");
        return;
      }
      
      const game = `game${gameNum}`;
      const opponentCopy = JSON.parse(JSON.stringify(player));
      
      // Update opponent selection
      dispatch({ 
        type: actionTypes.SELECT_PLAYER, 
        payload: { game, team: 'away', player: opponentCopy } 
      });
      
      // Determine if we should auto-select based on game flow
      const shouldAutoSelect = shouldAutoSelectForGame(gameNum, state.wonCoinFlip);
      
      console.log(`[handleOpponentSelection] Game ${gameNum} - Should auto-select:`, shouldAutoSelect);
      
      dispatch({ type: actionTypes.SET_CALCULATING, payload: true });
      
      setTimeout(() => {
        try {
          if (shouldAutoSelect) {
            console.log(`Auto-selecting home player for Game ${gameNum}`);
            
            const bestPlayer = findBestResponsePlayer(
              gameNum,
              opponentCopy,
              state.availableHomePlayers,
              state.availableAwayPlayers.filter(p => p.name !== opponentCopy.name),
              state.selectedPlayers,
              state.teamStats,
              state.allMatches,
              calculateWinProbability
            );
            
            if (bestPlayer) {
              const bestPlayerCopy = JSON.parse(JSON.stringify(bestPlayer));
              
              // Set auto-selection notification
              dispatch({
                type: actionTypes.SET_LAST_AUTO_SELECTED,
                payload: {
                  gameNumber: gameNum,
                  player: bestPlayerCopy,
                  opponent: opponentCopy,
                  winProbability: calculateWinProbability(
                    bestPlayerCopy.name,
                    opponentCopy.name,
                    state.teamStats,
                    state.allMatches
                  )
                }
              });
              
              // Select the best player
              dispatch({ 
                type: actionTypes.SELECT_PLAYER, 
                payload: { game, team: 'home', player: bestPlayerCopy } 
              });
            }
          }
          
          // Determine next step
          setTimeout(() => {
            let nextStep;
            
            if (gameNum === 4) {
              nextStep = "summary";
            } else {
              nextStep = getNextStepAfterGame(gameNum, state.wonCoinFlip);
            }
            
            console.log(`[handleOpponentSelection] Navigating to: ${nextStep}`);
            dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: nextStep });
            dispatch({ type: actionTypes.SET_CALCULATING, payload: false });
          }, 500);
          
        } catch (error) {
          console.error("Error in handleOpponentSelection:", error);
          dispatch({ type: actionTypes.SET_CALCULATING, payload: false });
        }
      }, 500);
    }, [state.wonCoinFlip, state.availableHomePlayers, state.availableAwayPlayers, state.selectedPlayers, state.teamStats, state.allMatches]),
    
    // Best player confirmation
    confirmBestPlayer: useCallback((gameNum) => {
      const game = `game${gameNum}`;
      
      if (!state.calculatedBestPlayer) {
        console.error("Cannot confirm player: calculatedBestPlayer is null");
        return;
      }
      
      const playerToConfirm = JSON.parse(JSON.stringify(state.calculatedBestPlayer));
      
      dispatch({ 
        type: actionTypes.SELECT_PLAYER, 
        payload: { game, team: 'home', player: playerToConfirm } 
      });
      
      let nextStep;
      if (gameNum === 4) {
        nextStep = "summary";
      } else {
        nextStep = getNextStepAfterGame(gameNum, state.wonCoinFlip);
      }
      
      dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: nextStep });
      setTimeout(() => {
        dispatch({ type: actionTypes.SET_CALCULATED_BEST_PLAYER, payload: null });
      }, 100);
    }, [state.calculatedBestPlayer, state.wonCoinFlip]),
    
    chooseDifferentPlayer: useCallback((gameNum) => {
      dispatch({ type: actionTypes.SET_CALCULATED_BEST_PLAYER, payload: null });
      setTimeout(() => {
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: `game-${gameNum}-manual-selection` });
      }, 300);
    }, []),
    
    // Optimal player calculation
    calculateOptimalPlayer: useCallback(() => {
      // Check if we have the required data before proceeding
      if (state.availableHomePlayers.length === 0 || state.availableAwayPlayers.length === 0) {
        console.log("Cannot calculate optimal player: insufficient players");
        return;
      }

      console.log("Starting optimal player calculation");
      dispatch({ type: actionTypes.SET_CALCULATING, payload: true });
      
      // Use a small timeout to ensure state updates complete
      setTimeout(() => {
        try {
          console.log("Available home players:", state.availableHomePlayers.map(p => p.name));
          console.log("Available away players:", state.availableAwayPlayers.map(p => p.name));
          
          const optimalPlayer = findOptimalBlindPlayer(
            state.availableHomePlayers,
            state.availableAwayPlayers,
            state.teamStats,
            state.allMatches,
            calculateWinProbability
          );
          
          console.log("Calculated optimal player:", optimalPlayer?.name);
          
          dispatch({ type: actionTypes.SET_OPTIMAL_PLAYER, payload: optimalPlayer });
          dispatch({ type: actionTypes.SET_CALCULATING, payload: false });
        } catch (error) {
          console.error("Error calculating optimal player:", error);
          dispatch({ type: actionTypes.SET_CALCULATING, payload: false });
        }
      }, 100);
    }, [state.availableHomePlayers, state.availableAwayPlayers, state.teamStats, state.allMatches]),
    
    // Reset
    handleReset: useCallback(() => {
      dispatch({ type: actionTypes.RESET_GAME });
    }, []),
  };
  
  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use the context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};