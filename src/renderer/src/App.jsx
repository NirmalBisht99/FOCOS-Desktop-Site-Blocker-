import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ControlCenter from './components/ControlCenter';
import PomodoroMode from './components/PomodoroMode';
import StrictMode from './components/strictMode';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

export default function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping');
  const [blockDuration, setBlockDuration] = useState([1]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockedSites, setBlockedSites] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [siteUsage, setSiteUsage] = useState({});
  const [activeMode, setActiveMode] = useState('normal'); // 'normal', 'pomodoro', 'strict'
  const timerRef = useRef(null);

  const isDark = theme === 'dark';

  const mostUsedApp = Object.entries(siteUsage).reduce(
    (max, [site, count]) => (count > max.count ? { site, count } : max),
    { site: 'None', count: 0 }
  ).site;

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleAddSite = () => {
    const trimmed = inputUrl.trim();
    if (trimmed && !blockedSites.includes(trimmed)) {
      setBlockedSites([...blockedSites, trimmed]);
      setInputUrl('');
    }
  };

  const handleRemoveSite = (index) => {
    if (activeMode === 'strict' && isBlocking) {
      alert("❌ Cannot modify blocked sites during Strict Mode!");
      return;
    }
    setBlockedSites(blockedSites.filter((_, i) => i !== index));
  };

  const handleStartBlocking = async () => {
    if (blockedSites.length === 0) return;

    try {
      const response = await window.focos.blockSites(blockedSites);
      if (response.success) {
        const updatedUsage = { ...siteUsage };
        blockedSites.forEach(site => {
          updatedUsage[site] = (updatedUsage[site] || 0) + 1;
        });
        setSiteUsage(updatedUsage);
        setTimeLeft(blockDuration[0] * 3600);
        setIsBlocking(true);
        document.getElementById('blockList').scrollIntoView({ behavior: 'smooth' });
      } else {
        alert("Error blocking sites: " + response.error);
      }
    } catch (error) {
      console.error("Error calling focos API:", error);
      alert("Error: FOCOS API not available. Make sure the extension is installed and enabled.");
    }
  };

  const handleStopBlocking = async () => {
    if (activeMode === 'strict' && isBlocking) {
      alert("❌ Cannot stop blocking during Strict Mode! Use emergency stop with password.");
      return;
    }

    try {
      const response = await window.focos.unblockSites();
      if (response.success) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsBlocking(false);
        setTimeLeft(null);
        setBlockDuration([1]);
      } else {
        alert("Error unblocking sites: " + response.error);
      }
    } catch (error) {
      console.error("Error calling focos API:", error);
      alert("Error: FOCOS API not available. Make sure the extension is installed and enabled.");
    }
  };

  // Pomodoro handlers - provide direct blocking control
  const handlePomodoroBlock = async () => {
    try {
      const response = await window.focos.blockSites(blockedSites);
      if (response.success) {
        const updatedUsage = { ...siteUsage };
        blockedSites.forEach(site => {
          updatedUsage[site] = (updatedUsage[site] || 0) + 1;
        });
        setSiteUsage(updatedUsage);
        setIsBlocking(true);
      } else {
        alert("Error blocking sites: " + response.error);
      }
    } catch (error) {
      console.error("Error calling focos API:", error);
      alert("Error: FOCOS API not available. Make sure the extension is installed and enabled.");
    }
  };

  const handlePomodoroUnblock = async () => {
    try {
      const response = await window.focos.unblockSites();
      if (response.success) {
        setIsBlocking(false);
      } else {
        alert("Error unblocking sites: " + response.error);
      }
    } catch (error) {
      console.error("Error calling focos API:", error);
      alert("Error: FOCOS API not available. Make sure the extension is installed and enabled.");
    }
  };

  const handlePomodoroStart = async () => {
    setActiveMode('pomodoro');
  };

  const handlePomodoroStop = async () => {
    setActiveMode('normal');
    setIsBlocking(false);
    await handlePomodoroUnblock();
  };

  // Strict mode handlers
  const handleStrictStart = async () => {
    setActiveMode('strict');
    await handleStartBlocking();
  };

  const handleStrictStop = async () => {
    setActiveMode('normal');
    await handleStopBlocking();
  };

  useEffect(() => {
    if (!isBlocking || timeLeft === null || activeMode !== 'normal') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsBlocking(false);
          setTimeLeft(null);
          setBlockDuration([1]);

          if (typeof Notification !== 'undefined') {
            new Notification("Session Complete", {
              body: "You can now take a break and relax!",
            });
          }

          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isBlocking, activeMode]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${isDark ? 'bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white' : 'bg-white text-black'} min-h-screen font-sans`}>
      <Navigation isDark={isDark} toggleTheme={toggleTheme} />
      
      <HeroSection />
      
     
      
      {/* Mode Selection */}
      <section className="py-12 px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Choose Your Focus Mode</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select the mode that fits your productivity style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <button
            onClick={() => setActiveMode('normal')}
            disabled={isBlocking}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMode === 'normal'
                ? 'border-blue-500 bg-blue-500/20'
                : isDark 
                ? 'border-gray-700 bg-gray-800 hover:border-blue-400' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
            } ${isBlocking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-xl font-bold mb-2">Normal Mode</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Classic blocking with flexible duration control
            </p>
          </button>

          <button
            onClick={() => setActiveMode('pomodoro')}
            disabled={isBlocking}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMode === 'pomodoro'
                ? 'border-orange-500 bg-orange-500/20'
                : isDark 
                ? 'border-gray-700 bg-gray-800 hover:border-orange-400' 
                : 'border-gray-300 bg-gray-50 hover:border-orange-400'
            } ${isBlocking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">🍅</div>
            <h3 className="text-xl font-bold mb-2">Pomodoro Mode</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Focus sessions with automatic break intervals
            </p>
          </button>

          <button
            onClick={() => setActiveMode('strict')}
            disabled={isBlocking}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMode === 'strict'
                ? 'border-red-500 bg-red-500/20'
                : isDark 
                ? 'border-gray-700 bg-gray-800 hover:border-red-400' 
                : 'border-gray-300 bg-gray-50 hover:border-red-400'
            } ${isBlocking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold mb-2">Strict Mode</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Unbreakable focus - no cancellation allowed
            </p>
          </button>
        </div>
      </section>

      {/* Dynamic Mode Display */}
      {activeMode === 'normal' && (
        <ControlCenter 
          blockDuration={blockDuration}
          setBlockDuration={setBlockDuration}
          isBlocking={isBlocking}
          timeLeft={timeLeft}
          formatTime={formatTime}
          handleStartBlocking={handleStartBlocking}
          handleStopBlocking={handleStopBlocking}
          blockedSites={blockedSites}
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          handleAddSite={handleAddSite}
          handleRemoveSite={handleRemoveSite}
        />
      )}

      {activeMode === 'pomodoro' && (
        <section className="py-12 px-6" id="blockList">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <PomodoroMode
              isActive={isBlocking}
              onBlock={handlePomodoroBlock}
              onUnblock={handlePomodoroUnblock}
              onComplete={handlePomodoroStop}
              blockedSites={blockedSites}
              isDark={isDark}
            />
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-6 rounded-xl`}>
              <h2 className="text-xl font-bold mb-4 text-purple-400">Blocked Sites</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g., facebook.com"
                  className={`flex-1 border px-4 py-2 rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
                  disabled={isBlocking}
                />
                <button 
                  onClick={handleAddSite} 
                  disabled={isBlocking}
                  className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {blockedSites.length === 0 ? (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No sites added yet.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {blockedSites.map((site, i) => (
                    <li key={i} className={`flex justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-white'} p-2 rounded`}>
                      <span>{site}</span>
                      <button 
                        onClick={() => handleRemoveSite(i)} 
                        disabled={isBlocking}
                        className="text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded disabled:opacity-50"
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {activeMode === 'strict' && (
        <section className="py-12 px-6" id="blockList">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrictMode
              isActive={isBlocking}
              onStart={handleStrictStart}
              onStop={handleStrictStop}
              blockedSites={blockedSites}
              isDark={isDark}
            />
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-6 rounded-xl`}>
              <h2 className="text-xl font-bold mb-4 text-red-400">Blocked Sites</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g., facebook.com"
                  className={`flex-1 border px-4 py-2 rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
                  disabled={isBlocking}
                />
                <button 
                  onClick={handleAddSite} 
                  disabled={isBlocking}
                  className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {isBlocking && (
                <div className={`mb-4 p-3 rounded ${isDark ? 'bg-red-900/30' : 'bg-red-100'} border border-red-500`}>
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    🔒 Locked in Strict Mode
                  </p>
                </div>
              )}
              {blockedSites.length === 0 ? (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No sites added yet.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {blockedSites.map((site, i) => (
                    <li key={i} className={`flex justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-white'} p-2 rounded`}>
                      <span>{site}</span>
                      <button 
                        onClick={() => handleRemoveSite(i)} 
                        disabled={isBlocking}
                        className="text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded disabled:opacity-50"
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
      
      <FeaturesSection />
      
      <Footer />
    </div>
  );
}