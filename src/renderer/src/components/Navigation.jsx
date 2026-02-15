import React from 'react';

const Navigation = ({ isDark, toggleTheme }) => (
  <nav className="flex justify-between items-center p-4 px-8 border-b border-gray-700">
    <div className="text-2xl font-bold text-purple-500">🛡️ FOCOS</div>
    <div className="space-x-8 hidden md:flex">
      <button onClick={() => document.getElementById('blockList').scrollIntoView({ behavior: 'smooth' })}>
        Block List
      </button>
      <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
        Features
      </button>
    </div>
    <button onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
  </nav>
);

export default Navigation;