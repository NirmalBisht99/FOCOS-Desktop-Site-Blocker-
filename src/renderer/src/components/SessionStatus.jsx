import React from 'react';

const SessionStatus = ({ isBlocking, timeLeft, formatTime, handleStartBlocking, handleStopBlocking, blockedSites }) => (
  <div className="bg-gray-800 p-8 rounded-xl text-center w-full min-h-[250px]">
    <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center justify-center gap-2">
      <span className="text-2xl">🎯</span> Session Status
    </h2>
    {isBlocking ? (
      <>
        <p className="text-green-400 text-2xl font-medium">{formatTime(timeLeft)}</p>
        <button 
          onClick={handleStopBlocking} 
          className="bg-red-600 text-white px-5 py-2 mt-4 rounded-full text-lg"
        >
          Stop
        </button>
      </>
    ) : (
      <>
        <p className="text-gray-300 mb-2 text-lg">Ready to start</p>
        <button 
          onClick={handleStartBlocking} 
          disabled={blockedSites.length === 0} 
          className="bg-blue-600 text-white px-5 py-2 mt-2 rounded-full text-lg disabled:opacity-50"
        >
          ▶ Start
        </button>
      </>
    )}
  </div>
);

export default SessionStatus;