import React from 'react';
import { useGame } from '../../context/GameContext';
import FloatingInfoButton from '../layout/FloatingInfoButton';
import InfoPopup from '../layout/InfoPopup';

const CoinFlip = ({ showInfoPopup, setShowInfoPopup }) => {
  const { state, actions } = useGame();
  
  return (
    <div className="container mx-auto p-4">
      <FloatingInfoButton onClick={() => setShowInfoPopup(true)} />
      <InfoPopup isOpen={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      <h1 className="app-title text-3xl font-bold mb-6 text-center">
        Pool Team Stats Analyzer
      </h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Coin Flip Result</h2>
        <p className="mb-4">
          The coin flip determines who selects first and the order of player
          selection. Who won the coin flip?
        </p>

        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => actions.handleCoinFlipResult(true)}
          >
            We Won
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => actions.handleCoinFlipResult(false)}
          >
            Opponent Won
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

export default CoinFlip;