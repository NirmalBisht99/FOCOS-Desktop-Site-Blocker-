import React from 'react';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-gray-800 p-6 rounded-xl text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-gray-400">{desc}</p>
  </div>
);

export default FeatureCard;
