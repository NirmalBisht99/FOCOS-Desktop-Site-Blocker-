import React from 'react';

const SiteListManager = ({ blockedSites, inputUrl, setInputUrl, handleAddSite, handleRemoveSite }) => (
  <div className="mt-10 bg-gray-800 p-6 rounded-xl">
    <h2 className="text-xl font-bold mb-2 text-red-400">Blocked Sites</h2>
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="e.g., facebook.com"
        className="flex-1 border px-4 py-2 rounded text-black"
        onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
      />
      <button onClick={handleAddSite} className="bg-black text-white px-4 py-2 rounded">
        Add
      </button>
    </div>
    {blockedSites.length === 0 ? (
      <p className="text-gray-400">No sites added yet.</p>
    ) : (
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {blockedSites.map((site, i) => (
          <li key={i} className="flex justify-between items-center bg-gray-100 text-black p-2 rounded">
            <span>{site}</span>
            <button 
              onClick={() => handleRemoveSite(i)} 
              className="text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SiteListManager;