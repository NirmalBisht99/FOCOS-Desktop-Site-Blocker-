import React from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => (
  <section className="py-16 px-6" id="features">
    <h2 className="text-3xl font-bold text-center mb-8">Why Choose FOCOS?</h2>
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      <FeatureCard 
        icon="🛡️" 
        title="Precision Blocking" 
        desc="Block specific websites with surgical precision. No more accidental visits to time-wasting sites." 
      />
      <FeatureCard 
        icon="⏱️" 
        title="Flexible Timing" 
        desc="Set custom durations from 30 minutes to 12 hours. Perfect for any workflow or focus session." 
      />
      <FeatureCard 
        icon="⚡" 
        title="Instant Effect" 
        desc="Blocks take effect immediately. No complicated setup or system restarts required." 
      />
    </div>
  </section>
);

export default FeaturesSection;