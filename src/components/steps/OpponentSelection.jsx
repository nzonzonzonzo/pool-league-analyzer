import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import { calculateWinProbability } from '../../utils/probability';

const OpponentSelection = ({ gameNumber, showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const {
    availableAwayPlayers,
    selectedPlayers,
    lastAutoSelectedPlayer,
    teamStats,
    allMatches
  } = state;
  
  const game = `game${gameNumber}`;
  
  // Add this to determine if we should show auto-selection notification
  const showLastAutoSelection = lastAutoSelectedPlayer && 
                             lastAutoSelectedPlayer.gameNumber === gameNumber - 1;
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>
      
      {/* Show auto-selected player notification if available */}
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
              selectedPlayers[game]?.home?.name || '',
              player.name,
              teamStats,
              allMatches
            );
            
            return (
              <div
                key={`opponent-player-${player.name}`}
                className="p-4 border rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => actions.handleOpponentSelection(gameNumber, player)}
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
          onClick={actions.handleReset}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default OpponentSelection;