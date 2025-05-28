import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import { calculateWinProbability } from '../../utils/probability';

const BestPlayerConfirmation = ({ gameNumber, showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const { calculatedBestPlayer, selectedPlayers, teamStats, allMatches } = state;
  
  const game = `game${gameNumber}`;
  const opponent = selectedPlayers[game]?.away;
  
  // Add defensive checks to prevent null reference errors
  if (!calculatedBestPlayer || !opponent) {
    console.error("Missing data for confirmation screen");
    
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="app-title text-3xl font-bold mb-6 text-center">
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
                actions.goToStep(`game-${gameNumber}`);
              }}
            >
              Go Back
            </button>
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
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Optimal Player for Game {gameNumber}</h2>
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
            onClick={() => actions.confirmBestPlayer(gameNumber)}
          >
            Confirm This Player
          </button>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => actions.chooseDifferentPlayer(gameNumber)}
          >
            Choose Different Player
          </button>
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

export default BestPlayerConfirmation;