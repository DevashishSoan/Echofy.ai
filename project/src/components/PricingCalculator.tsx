import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Clock, 
  Globe, 
  CheckCircle, 
  Star,
  Users,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  currency: string;
  features: string[];
  limits: {
    minutes: number;
    languages: number;
    exports: string[];
    support: string;
    watermark: boolean;
  };
  popular?: boolean;
  lifetime?: boolean;
}

const PricingCalculator: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const [selectedLanguages, setSelectedLanguages] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['transcription']);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [recommendedPlan, setRecommendedPlan] = useState<string>('free');

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: '$',
      features: [
        'Real-time transcription',
        'Basic text export',
        'Community support',
        'English only'
      ],
      limits: {
        minutes: 10,
        languages: 1,
        exports: ['TXT'],
        support: 'Community',
        watermark: true
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      yearlyPrice: 89,
      currency: '$',
      popular: true,
      features: [
        'Everything in Free',
        '10+ languages',
        'AI-powered cleanup',
        'Multiple export formats',
        'Cloud sync',
        'Email support',
        'No watermark'
      ],
      limits: {
        minutes: 300,
        languages: 10,
        exports: ['TXT', 'DOCX', 'PDF', 'SRT'],
        support: 'Email',
        watermark: false
      }
    },
    {
      id: 'team',
      name: 'Team',
      price: 29,
      currency: '$',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Speaker identification',
        'Custom vocabulary',
        'Priority support',
        'Advanced analytics',
        'Team management'
      ],
      limits: {
        minutes: 1000,
        languages: 15,
        exports: ['TXT', 'DOCX', 'PDF', 'SRT', 'VTT'],
        support: 'Priority',
        watermark: false
      }
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 149,
      currency: '$',
      lifetime: true,
      features: [
        'Everything in Pro',
        'Lifetime access',
        'No monthly fees',
        'Future updates included',
        'Limited to 200 spots',
        'Early supporter badge'
      ],
      limits: {
        minutes: 300,
        languages: 10,
        exports: ['TXT', 'DOCX', 'PDF', 'SRT'],
        support: 'Email',
        watermark: false
      }
    }
  ];

  const features = [
    { id: 'transcription', name: 'Real-time Transcription', icon: Clock },
    { id: 'translation', name: 'Auto Translation', icon: Globe },
    { id: 'cleanup', name: 'AI Cleanup', icon: Zap },
    { id: 'collaboration', name: 'Team Collaboration', icon: Users },
    { id: 'analytics', name: 'Advanced Analytics', icon: TrendingUp }
  ];

  // Calculate recommended plan based on usage
  useEffect(() => {
    let recommended = 'free';
    
    if (selectedMinutes > 10 || selectedLanguages > 1 || selectedFeatures.length > 1) {
      recommended = 'pro';
    }
    
    if (selectedMinutes > 300 || selectedFeatures.includes('collaboration')) {
      recommended = 'team';
    }
    
    setRecommendedPlan(recommended);
  }, [selectedMinutes, selectedLanguages, selectedFeatures]);

  const calculateMonthlyCost = (tier: PricingTier): number => {
    if (tier.lifetime) return tier.price;
    if (billingCycle === 'yearly' && tier.yearlyPrice) {
      return Math.round(tier.yearlyPrice / 12);
    }
    return tier.price;
  };

  const calculateYearlySavings = (tier: PricingTier): number => {
    if (!tier.yearlyPrice) return 0;
    const monthlyTotal = tier.price * 12;
    return monthlyTotal - tier.yearlyPrice;
  };

  const getUsageColor = (used: number, limit: number): string => {
    const percentage = (used / limit) * 100;
    if (percentage <= 50) return 'text-green-600';
    if (percentage <= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Calculate your usage and discover the best plan for your voice transcription needs
        </p>
      </div>

      {/* Usage Calculator */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Usage Calculator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Minutes Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Monthly Minutes
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0</span>
                <span className="font-bold text-blue-600">{selectedMinutes} min</span>
                <span>2000+</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900">{selectedMinutes}</span>
                <span className="text-gray-500 ml-1">minutes/month</span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Languages Needed
            </label>
            <select
              value={selectedLanguages}
              onChange={(e) => setSelectedLanguages(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>English only</option>
              <option value={3}>3 languages</option>
              <option value={5}>5 languages</option>
              <option value={10}>10+ languages</option>
              <option value={15}>All languages</option>
            </select>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Required Features
            </label>
            <div className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <label key={feature.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFeatures([...selectedFeatures, feature.id]);
                        } else {
                          setSelectedFeatures(selectedFeatures.filter(f => f !== feature.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{feature.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Save up to 30%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingTiers.map((tier) => {
          const isRecommended = tier.id === recommendedPlan;
          const monthlyCost = calculateMonthlyCost(tier);
          const yearlySavings = calculateYearlySavings(tier);
          const exceedsMinutes = selectedMinutes > tier.limits.minutes;
          const exceedsLanguages = selectedLanguages > tier.limits.languages;

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                isRecommended
                  ? 'ring-2 ring-blue-500 transform scale-105'
                  : tier.popular
                  ? 'ring-2 ring-purple-500'
                  : ''
              }`}
            >
              {/* Badges */}
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended for you
                  </span>
                </div>
              )}
              
              {tier.popular && !isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {tier.lifetime && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Limited: 200 spots
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.currency}{monthlyCost}
                  </span>
                  {!tier.lifetime && (
                    <span className="text-gray-500 ml-1">/month</span>
                  )}
                </div>
                
                {billingCycle === 'yearly' && yearlySavings > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {tier.currency}{yearlySavings}/year
                  </p>
                )}
                
                {tier.lifetime && (
                  <p className="text-sm text-orange-600 mt-1">One-time payment</p>
                )}
              </div>

              {/* Usage Compatibility */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Minutes:</span>
                  <span className={exceedsMinutes ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {tier.limits.minutes === 1000 ? '1000+' : tier.limits.minutes}/month
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Languages:</span>
                  <span className={exceedsLanguages ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {tier.limits.languages === 15 ? 'All' : tier.limits.languages}
                  </span>
                </div>
                
                {(exceedsMinutes || exceedsLanguages) && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Your usage exceeds this plan's limits
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  isRecommended
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                    : tier.popular
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                    : tier.lifetime
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {tier.id === 'free' ? 'Start Free' : 
                 tier.lifetime ? 'Get Lifetime Deal' :
                 tier.id === 'team' ? 'Contact Sales' : 
                 'Upgrade to ' + tier.name}
              </button>

              {/* Additional Info */}
              {tier.lifetime && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Only 200 lifetime spots available
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Breakdown */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Your Usage Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Monthly Usage</h4>
            <p className="text-3xl font-bold text-blue-600">{selectedMinutes}</p>
            <p className="text-gray-600">minutes per month</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
            <p className="text-3xl font-bold text-purple-600">{selectedLanguages}</p>
            <p className="text-gray-600">languages needed</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
            <p className="text-3xl font-bold text-green-600">{selectedFeatures.length}</p>
            <p className="text-gray-600">features selected</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my limits?</h4>
            <p className="text-gray-600 text-sm">
              You'll receive notifications when approaching your limits. You can upgrade anytime or purchase additional minutes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
            <p className="text-gray-600 text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Is the lifetime deal really lifetime?</h4>
            <p className="text-gray-600 text-sm">
              Yes! Pay once and use Echofy.ai forever. Includes all future updates and improvements.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
            <p className="text-gray-600 text-sm">
              We offer a 30-day money-back guarantee for all paid plans. No questions asked.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-xl text-blue-100 mb-6">
          Join thousands of professionals using Echofy.ai for their voice transcription needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;