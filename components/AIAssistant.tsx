import React, { useState } from 'react';
import { generateTripItinerary } from '../services/geminiService';
import { FullTripData } from '../types';
import { Sparkles, Loader2, Plane } from 'lucide-react';

interface Props {
  onTripGenerated: (trip: FullTripData) => void;
  onClose: () => void;
}

export const AIAssistant: React.FC<Props> = ({ onTripGenerated, onClose }) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!destination) return;
    setLoading(true);
    setError('');
    
    try {
      const trip = await generateTripItinerary(destination, days, budget, interests);
      onTripGenerated(trip);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate trip. Please check API Key configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Trip Planner
          </h2>
          <p className="text-indigo-100 mt-1">Let Gemini design your perfect itinerary.</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Kyoto, Japan"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="14"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={days}
                onChange={e => setDays(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              >
                <option>Budget</option>
                <option>Moderate</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interests</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Food, History, Nature, Anime"
              rows={3}
              value={interests}
              onChange={e => setInterests(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !destination}
              className="flex-1 px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Dreaming...
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  Generate Trip
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};