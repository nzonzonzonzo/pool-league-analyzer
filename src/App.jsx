import React, { useState, useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import TeamSelection from "./components/steps/TeamSelection";
import CoinFlip from "./components/steps/CoinFlip";
import GameSelection from "./components/steps/GameSelection";
import OpponentSelection from "./components/steps/OpponentSelection";
import BestPlayerConfirmation from "./components/steps/BestPlayerConfirmation";
import ManualPlayerSelection from "./components/steps/ManualPlayerSelection";
import Summary from "./components/steps/Summary";
import ThemeToggle from "./components/layout/ThemeToggle";
import DebugPanel from "./components/layout/DebugPanel";
import { getInitialTheme, applyTheme } from "./utils/theme";
import { loadAppData } from "./utils/DataLoader.js";
import "./App.css";

// Initialize theme on page load (outside App function)
applyTheme(getInitialTheme());

// Main App container with GameProvider
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

// App content with access to GameContext
function AppContent() {
  const { state, actions } = useGame();
  const { currentStep, error, loading } = state;
  
  const [darkMode, setDarkMode] = useState(getInitialTheme());
  const [userHasSetTheme, setUserHasSetTheme] = useState(
    localStorage.getItem('theme') !== null
  );
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        actions.setLoading(true);
        const data = await loadAppData();
        actions.setData(data);
      } catch (err) {
        actions.setError(err.message);
      }
    };

    initializeData();
  }, []); // Empty dependency array - only run once on mount

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    
    // Only save to localStorage if user has explicitly chosen a theme
    if (userHasSetTheme) {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode, userHasSetTheme]);

  // Toggle theme function
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    setUserHasSetTheme(true); // Mark that user has made a choice
  };

  // Render loading state
  if (loading) {
    return <div className="text-center p-8">Loading data...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  // Render current step based on state
  const renderCurrentStep = () => {
    // Match steps to corresponding components
    if (currentStep === "team-selection") {
      return <TeamSelection showInfoPopup={showInfoPopup} setShowInfoPopup={setShowInfoPopup} />;
    }
    
    if (currentStep === "coin-flip") {
      return <CoinFlip showInfoPopup={showInfoPopup} setShowInfoPopup={setShowInfoPopup} />;
    }
    
    if (currentStep.match(/^game-\d-best-player$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return <BestPlayerConfirmation 
        gameNumber={gameNumber} 
        showInfoPopup={showInfoPopup} 
        setShowInfoPopup={setShowInfoPopup} 
      />;
    }
    
    if (currentStep.match(/^game-\d-manual-selection$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return <ManualPlayerSelection 
        gameNumber={gameNumber} 
        showInfoPopup={showInfoPopup} 
        setShowInfoPopup={setShowInfoPopup} 
      />;
    }
    
    if (currentStep.match(/^game-\d-opponent$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return <OpponentSelection 
        gameNumber={gameNumber} 
        showInfoPopup={showInfoPopup} 
        setShowInfoPopup={setShowInfoPopup} 
      />;
    }
    
    if (currentStep.match(/^game-\d$/)) {
      const gameNumber = parseInt(currentStep.split('-')[1]);
      return <GameSelection 
        gameNumber={gameNumber} 
        showInfoPopup={showInfoPopup} 
        setShowInfoPopup={setShowInfoPopup} 
      />;
    }
    
    if (currentStep === "summary") {
      return <Summary showInfoPopup={showInfoPopup} setShowInfoPopup={setShowInfoPopup} />;
    }
    
    // Fallback for unrecognized states
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="app-title text-3xl font-bold mb-6 text-center">
          Pool Team Stats Analyzer
        </h1>
        <p>Unrecognized state: {currentStep}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
          onClick={() => actions.handleReset()}
        >
          Start Over
        </button>
      </div>
    );
  };

  return (
    <>
      {renderCurrentStep()}
      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      {/*<DebugPanel />*/}
    </>
  );
}

export default App;