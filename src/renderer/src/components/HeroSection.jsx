import React from 'react';

const HeroSection = () => (
  <section className="text-center py-20">
    <p className="bg-indigo-700 inline-block px-4 py-1 rounded-full text-sm mb-4">
      ⚡ Focus. Block. Achieve.
    </p>
    <h1 className="text-5xl font-extrabold leading-tight">
      Reclaim Your{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
        Digital Focus
      </span>
    </h1>
    <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
      Block distracting websites with precision. Boost productivity with intention. Transform your browsing habits with FOCOS.
    </p>
    <div className="mt-8 flex justify-center space-x-4">
      <button 
        onClick={() => document.getElementById('blockList').scrollIntoView({ behavior: 'smooth' })} 
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-lg"
      >
        Start Now
      </button>
      <button className="text-white border border-gray-400 px-6 py-2 rounded-full text-lg">
        Learn More
      </button>
    </div>
  </section>
);

export default HeroSection;