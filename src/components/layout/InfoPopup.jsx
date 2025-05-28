import React from 'react';
import CloseIcon from './icons/CloseIcon';

const InfoPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-6 border rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-neutral-700">How Win Probabilities and Optimal Matchups Are Calculated</h2>
          <button className="bg-transparent hover:opacity-80 transition-opacity duration-200" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        
        <p className="mb-4 text-gray-300">The Pool Team Stats Analyzer uses advanced algorithms with multi-season data analysis to calculate individual matchup probabilities and determine the optimal overall lineup strategy.</p>
        
        <h3 className="text-lg font-medium mb-2 text-neutral-700">Individual Matchup Probability Factors</h3>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Overall Win Percentage:</span> A player's foundational performance metric:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Establishes a baseline probability for matchup calculations</li>
              <li>More weight given to recent matches than older ones</li>
              <li>Provides general performance context for other factors</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Handicap Performance Analysis:</span> How players historically perform in specific handicap situations:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Tracks win rates against higher, equal, and lower handicapped players</li>
              <li>Analyzes both players' historical performance in similar matchup scenarios</li>
              <li>Increases weight with larger sample sizes (up to 60% combined influence)</li>
              <li>Adapts to each player's unique handicap dynamics instead of using fixed percentages</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Head-to-Head History:</span> Direct matchup results between specific players:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>30% weight given to direct head-to-head results when available</li>
              <li>Analyzes all previous encounters between the same players</li>
              <li>Provides crucial insight into matchup-specific dynamics that general stats miss</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Player Progression Tracking:</span> Multi-season analysis of player development:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Performance trends (improving, declining, or stable) with 3% impact</li>
              <li>Recent handicap changes and their impact (±2-3% adjustment)</li>
              <li>Experience factor based on seasons played (logarithmic scaling)</li>
              <li>Adaptation period after handicap adjustments (players may temporarily over/underperform)</li>
            </ul>
          </li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-neutral-700">Blind Selection Optimization</h3>
        <p className="mb-2 text-gray-300">For blind selection scenarios (when you don't know opponents), we use a sophisticated analysis that considers:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Multi-dimensional Scoring:</span> Players are evaluated on multiple factors:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Average win probability across all potential opponents (40% weight)</li>
              <li>Consistency across different opponents (30% weight)</li>
              <li>Minimum win probability in worst-case scenarios (20% weight)</li>
              <li>Recent form and experience bonuses (5-10% weight)</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Statistical Variance Analysis:</span> Evaluates how consistently players perform:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Calculates standard deviation of win probabilities against all opponents</li>
              <li>Prioritizes players with more predictable performance</li>
              <li>Reduces risk by avoiding high-variability players for blind selection</li>
            </ul>
          </li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-neutral-700">Team Lineup Optimization (Hungarian Algorithm)</h3>
        <p className="mb-2 text-gray-300">To determine the best possible combination of player matchups, we implement the Hungarian Algorithm – a sophisticated mathematical approach used in assignment problems:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Optimal Assignment:</span> The Hungarian Algorithm finds the combination that:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Maximizes the team's overall win probability</li>
              <li>Ensures each player is matched optimally for team success</li>
              <li>Finds the mathematically optimal solution among all possibilities</li>
            </ul>
          </li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-neutral-700">Multi-Season Data Analysis</h3>
        <p className="mb-2 text-gray-300">The system now maintains comprehensive historical data:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li className="mb-1"><span className="font-medium">Seasonal Archiving:</span> Automatically archives complete seasonal data (Spring, Summer, Fall) for long-term analysis</li>
          <li className="mb-1"><span className="font-medium">Player History Tracking:</span> Monitors players across seasons to identify:
            <ul className="list-disc list-inside pl-6 mt-1">
              <li>Team changes and player migration patterns</li>
              <li>Handicap progression and adjustment periods</li>
              <li>Long-term performance trends and player development</li>
              <li>Experience effects (performance improvements over multiple seasons)</li>
            </ul>
          </li>
          <li className="mb-1"><span className="font-medium">Rating System:</span> Implements an ELO-like rating that tracks improvement or decline beyond the handicap system</li>
        </ol>
        
        <h3 className="text-lg font-medium mb-2 text-neutral-700">The Calculation Process</h3>
        <p className="mb-2 text-gray-300">For each potential lineup configuration, the system:</p>
        <ol className="list-decimal list-inside mb-4 pl-2 text-gray-300">
          <li>Analyzes both current and historical performance data</li>
          <li>Calculates individual win probabilities for all possible player combinations</li>
          <li>Applies the Hungarian Algorithm to find the globally optimal set of matchups</li>
          <li>Recommends the lineup with the highest mathematical probability of team success</li>
        </ol>
        
        <p className="mb-0 italic text-gray-300">This sophisticated approach leverages multi-season data analysis and advanced mathematical optimization to provide your team with a significant competitive advantage based on comprehensive historical performance insights.</p>
      </div>
    </div>
  );
};

export default InfoPopup;