import React from 'react';
import PricingCalculator from '../../../src/components/PricingCalculator';

const Pricing: React.FC = () => {
  return (
    <div>
      <PricingCalculator />
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-2xl font-bold">Echofy.ai</span>
          </div>
          <div className="text-center text-gray-400 mb-4">
            <p>&copy; 2024 Echofy.ai. All rights reserved.</p>
          </div>
          <div className="flex justify-center">
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/logotext_poweredby_360w.png"
                alt="Built with Bolt.new"
                style={{
                  maxWidth: '150px',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;