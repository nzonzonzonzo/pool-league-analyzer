import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';
import SearchableDropdown from '../shared/SearchableDropdown';
import AvailabilityToggle from '../shared/AvailabilityToggle';

const TeamSelection = ({ showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  const {
    teams,
    teamStats,
    selectedHomeTeam,
    selectedAwayTeam,
    homeTeamAllPlayers,
    awayTeamAllPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
  } = state;

  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>
      <div className="text-xs text-gray-500 mb-4">
        Found {teams.length} teams and {teamStats.length} players
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Our Team</h2>
          <div className="mb-4">
            <label className="block text-neutral-600 mb-1">
              Select Your Team
            </label>
            <SearchableDropdown
              options={teams}
              value={selectedHomeTeam}
              onChange={actions.setHomeTeam}
              placeholder="Type to search teams..."
            />
          </div>

          {homeTeamAllPlayers.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">
                Available Players: {homeTeamPlayers.length}/{homeTeamAllPlayers.length}
              </h3>
              <div className="border rounded p-2 mb-4 max-h-64 overflow-y-auto">
                {homeTeamAllPlayers.map((player) => (
                  <div
                    key={`home-player-${player.name}`}
                    className={`p-3 px-4 mb-2 rounded-lg border hover:bg-blue-50 transition-all ${player.available === false ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium px-2">{player.displayName}</span>
                      <span className="text-sm py-1 px-2 rounded-full text-primary-dark">
                        HCP: {player.handicap}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="mr-1 px-2">Record:</span>
                        <span className="font-medium">
                          {player.wins}-{player.losses}
                        </span>
                        <span className="mx-1">•</span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-1">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${parseInt(player.winPercentage)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            ({player.winPercentage}%)
                          </span>
                        </div>
                      </div>
                      
                      <span className="px-2">
                        <AvailabilityToggle
  isAvailable={player.available !== false}
  onChange={() => {
    console.log(`Before toggle - ${player.name}: available=${player.available}`);
    actions.togglePlayerAvailability(player.name);
    // Log again after a short delay to see if state updated
    setTimeout(() => {
      console.log(`After toggle - ${player.name}: available=${player.available}`);
    }, 100);
  }}
/>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Opponent Team</h2>
          <div className="mb-4">
            <label className="block text-neutral-600 mb-1">
              Select Opponent Team
            </label>
            <SearchableDropdown
              options={teams}
              value={selectedAwayTeam}
              onChange={actions.setAwayTeam}
              placeholder="Type to search opponent teams..."
            />
          </div>

          {awayTeamAllPlayers.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">
                Available Players: {awayTeamPlayers.length}/{awayTeamAllPlayers.length}
              </h3>
              <div className="border rounded p-2 mb-4 max-h-64 overflow-y-auto">
                {awayTeamAllPlayers.map((player) => (
                  <div
                    key={`away-player-${player.name}`}
                    className={`p-3 px-4 mb-2 rounded-lg border hover:bg-blue-50 transition-all ${player.available === false ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium px-2">{player.displayName}</span>
                      <span className="text-sm py-1 px-2 rounded-full text-primary-dark">
                        HCP: {player.handicap}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="mr-1 px-2">Record:</span>
                        <span className="font-medium">
                          {player.wins}-{player.losses}
                        </span>
                        <span className="mx-1">•</span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-1">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${parseInt(player.winPercentage)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            ({player.winPercentage}%)
                          </span>
                        </div>
                      </div>
                      
                      <span className="px-2">
                        <AvailabilityToggle
  isAvailable={player.available !== false}
  onChange={() => {
    console.log(`Before toggle - ${player.name}: available=${player.available}`);
    actions.togglePlayerAvailability(player.name);
    // Log again after a short delay to see if state updated
    setTimeout(() => {
      console.log(`After toggle - ${player.name}: available=${player.available}`);
    }, 100);
  }}
/>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={!selectedHomeTeam || !selectedAwayTeam}
          onClick={actions.handleTeamSelection}
        >
          Continue to Coin Flip
        </button>
      </div>
    </div>
  );
};

export default TeamSelection;