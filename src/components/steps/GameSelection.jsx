import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import { isHomeSelectingBlind, findOptimalBlindPlayer } from '../../utils/algorithms';
import { calculateWinProbability } from '../../utils/probability';

const GameSelection = ({ gameNumber, showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const { 
    wonCoinFlip, 
    availableHomePlayers, 
    availableAwayPlayers,
    teamStats,
    allMatches,
    lastAutoSelectedPlayer
  } = state;
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimalPlayer, setOptimalPlayer] = useState(null);
  
  const game = `game${gameNumber}`;
  
  // Calculate optimal player locally
  useEffect(() => {
    if (availableHomePlayers.length > 0 && availableAwayPlayers.length > 0) {
      console.log("Starting local optimal player calculation");
      setIsCalculating(true);
      
      setTimeout(() => {
        try {
          const calculated = findOptimalBlindPlayer(
            availableHomePlayers,
            availableAwayPlayers,
            teamStats,
            allMatches,
            calculateWinProbability
          );
          
          console.log("Calculated optimal player locally:", calculated?.name);
          setOptimalPlayer(calculated);
          setIsCalculating(false);
        } catch (error) {
          console.error("Error in local calculation:", error);
          setIsCalculating(false);
        }
      }, 100);
    }
  }, [availableHomePlayers.length, availableAwayPlayers.length]);
  
  
  // Check for auto-selection notification
  const showAutoSelected = lastAutoSelectedPlayer && 
                       lastAutoSelectedPlayer.gameNumber === gameNumber - 1 &&
                       // Only show auto-selection message if it actually happened
                       ((wonCoinFlip && (lastAutoSelectedPlayer.gameNumber === 1 || lastAutoSelectedPlayer.gameNumber === 4)) ||
                        (!wonCoinFlip && (lastAutoSelectedPlayer.gameNumber === 2 || lastAutoSelectedPlayer.gameNumber === 3)));
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
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
        <h2 className="text-xl font-semibold mb-4">Game {gameNumber} Selection</h2>
        <p className="mb-4">
          You need to put up a player blind for Game {gameNumber}.
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
                // Calculate average win probability against all opponents using enhanced calculation
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
                    onClick={() => actions.selectPlayerForGame(game, "home", player)}
                  >
                    <div className="font-medium">{player.displayName}</div>
                    <div className="text-sm text-gray-600">
                      HCP: {player.handicap}
                      {/* Show trend indicators if available */}
                      {player.handicapTrend !== 'stable' && (
                        <span className={`ml-2 text-xs ${
                          player.handicapTrend === 'improving' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ({player.handicapTrend})
                        </span>
                      )}
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
          onClick={actions.handleReset}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default GameSelection;