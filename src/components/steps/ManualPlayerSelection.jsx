import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import { calculateWinProbability } from '../../utils/probability';

const ManualPlayerSelection = ({ gameNumber, showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const { availableHomePlayers, selectedPlayers, teamStats, allMatches } = state;
  
  const game = `game${gameNumber}`;
  const opponent = selectedPlayers[game]?.away;
  
  // Defensive check to ensure we have an opponent
  if (!opponent) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="app-title text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
          <h2 className="text-xl font-semibold mb-4">Missing Opponent Data</h2>
          <p className="mb-4">
            Cannot find opponent data for Game {gameNumber}.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={actions.handleReset}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Player for Game {gameNumber}</h2>
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
                onClick={() => actions.selectPlayerForGame(game, "home", player)}
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
          onClick={actions.handleReset}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ManualPlayerSelection;