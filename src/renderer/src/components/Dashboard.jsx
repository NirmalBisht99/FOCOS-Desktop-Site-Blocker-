import React from 'react';

const Dashboard = ({ blockedSites, blockDuration, isBlocking, mostUsedApp }) => (
  <section id="demographics" className="py-16 px-6 text-center bg-gray-900">
    <h2 className="text-3xl font-bold mb-4">Today's Focus Insights</h2>
    <div className="space-y-2">
      <p className="text-gray-400">
        Most Blocked Site: <span className="text-white font-semibold">{blockedSites[0] || 'None'}</span>
      </p>
      <p className="text-gray-400">
        Total Focus Time: <span className="text-white font-semibold">{blockDuration[0]} hour(s)</span>
      </p>
      <p className="text-gray-400">
        Active Sessions: <span className="text-white font-semibold">{isBlocking ? '1' : '0'}</span>
      </p>
      <p className="text-gray-400">
        Most Used App Today: <span className="text-white font-semibold">{mostUsedApp}</span>
      </p>
    </div>
  </section>
);

export default Dashboard;