import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import { calculateWinProbability } from '../../utils/probability';

const Summary = ({ showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const { selectedPlayers, teamStats, allMatches } = state;
  
  // Defensive check - if selectedPlayers is empty or undefined, handle it
  if (!selectedPlayers || Object.keys(selectedPlayers).length === 0) {
    console.error("No selected players found for summary");
    return (
      <div className="container mx-auto p-4">
        <h1 className="app-title text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-300">
          <h2 className="text-xl font-semibold mb-4">No Match Data Found</h2>
          <p className="mb-4">
            There was a problem loading the match data for the summary.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={actions.handleReset}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate overall win probability
  const matchupsWithProbability = Object.values(selectedPlayers)
    .filter((matchup) => matchup && matchup.home && matchup.away)
    .map((matchup) => ({
      ...matchup,
      winProbability: calculateWinProbability(
        matchup.home.name,
        matchup.away.name,
        teamStats,
        allMatches
      ),
    }));
  
  const overallWinPercentage =
    matchupsWithProbability.length > 0
      ? Math.round(
          (matchupsWithProbability.reduce(
            (sum, m) => sum + m.winProbability,
            0,
          ) /
            matchupsWithProbability.length) *
            100,
        )
      : 0;

  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Final Matchups</h2>
        <p className="mb-6">
          Here are the final player matchups based on the coin flip and
          selection process:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Game</th>
                <th className="p-2 text-left">Our Player</th>
                <th className="p-2 text-left">Opponent</th>
                <th className="p-2 text-left">Win Probability</th>
                <th className="p-2 text-left">Handicap</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((gameNum) => {
                const game = `game${gameNum}`;
                const matchup = selectedPlayers[game];

                // Add defensive check for matchup
                if (!matchup || !matchup.home || !matchup.away) {
                  console.log(`Missing data for game ${gameNum}:`, matchup);
                  return null;
                }

                // Calculate win probability
                const winProb = calculateWinProbability(
                  matchup.home.name,
                  matchup.away.name,
                  teamStats,
                  allMatches
                );

                return (
                  <tr key={`summary-${game}`} className="border-t">
                    <td className="p-2">Game {gameNum}</td>
                    <td className="p-2">{matchup.home.displayName}</td>
                    <td className="p-2">{matchup.away.displayName}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${winProb * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(winProb * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {matchup.home.handicap} vs {matchup.away.handicap}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Overall Team Win Probability</h3>
          <div className="text-lg font-bold">{overallWinPercentage}%</div>
          <p className="text-sm mt-2">
            {overallWinPercentage > 50
              ? "Your team has a favorable advantage!"
              : "The matchup is challenging, but you still have a chance."}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={actions.handleReset}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default Summary;