import React from 'react';

const PlayerCard = ({ 
  player, 
  onClick, 
  winProbability, 
  isOptimal = false, 
  showWinProbability = true,
  probabilityLabel = "Win probability:",
  className = "" 
}) => {
  const cardClasses = `
    p-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition-all
    ${isOptimal ? "bg-green-50 border-green-500" : ""}
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
    >
      <div className="font-medium">{player.displayName}</div>
      <div className="text-sm text-gray-600">
        HCP: {player.handicap}
      </div>
      
      {showWinProbability && winProbability !== undefined && (
        <div className="mt-2">
          <div className="text-sm">{probabilityLabel}</div>
          <div className="flex items-center mt-1">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
              <div
                className="h-full bg-green-500"
                style={{ width: `${winProbability * 100}%` }}
              ></div>
            </div>
            <span className="font-medium">
              {Math.round(winProbability * 100)}%
            </span>
          </div>
        </div>
      )}
      
      {!showWinProbability && (
        <div className="mt-2">
          <div className="text-sm">Record:</div>
          <div className="text-sm mt-1">
            {player.wins}-{player.losses} ({player.winPercentage}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;