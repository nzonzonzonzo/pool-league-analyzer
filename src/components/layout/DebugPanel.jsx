import React from 'react';
import { useGame } from '../../context/GameContext';

const DebugPanel = () => {
  const { state } = useGame();
  
  // Only show in development mode - moved AFTER the hook call
  if (process.env.NODE_ENV === 'production') return null;
  
  const {
    currentStep,
    wonCoinFlip,
    lastAutoSelectedPlayer,
    selectedPlayers
  } = state;
  
  return (
    <div className="fixed bottom-0 right-0 p-2 bg-black text-white text-xs opacity-70 hover:opacity-100 z-50 w-64 h-64 overflow-auto">
      <div><strong>Current Step:</strong> {currentStep}</div>
      <div><strong>Won Coin Flip:</strong> {wonCoinFlip ? "Yes" : wonCoinFlip === false ? "No" : "Not Set"}</div>
      <div><strong>Last Auto Selected:</strong> {lastAutoSelectedPlayer ? 
        `Game ${lastAutoSelectedPlayer.gameNumber}: ${lastAutoSelectedPlayer.player?.displayName} vs ${lastAutoSelectedPlayer.opponent?.displayName}` : 
        "None"}</div>
      <div>
        <strong>Selected Players:</strong>
        <div className="pl-2">
          {Object.entries(selectedPlayers || {}).map(([game, matchup]) => (
            <div key={game}>
              {game}: {matchup?.home?.displayName || "None"} vs {matchup?.away?.displayName || "None"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;