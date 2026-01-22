
import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import Dashboard from './components/Dashboard';
import ControlCenter from './components/ControlCenter';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

  export default function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [blockDuration, setBlockDuration] = useState([1]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockedSites, setBlockedSites] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [siteUsage, setSiteUsage] = useState({});
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

  useEffect(() => {
    if (!isBlocking || timeLeft === null) return;

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
  }, [isBlocking]);

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
      
      <Dashboard 
        blockedSites={blockedSites}
        blockDuration={blockDuration}
        isBlocking={isBlocking}
        mostUsedApp={mostUsedApp}
      />
      
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
      
      <FeaturesSection />
      
      <Footer />
    </div>
  );
}    