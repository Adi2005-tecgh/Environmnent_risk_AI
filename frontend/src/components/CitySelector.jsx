import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { getSupportedCities } from '../api/api';

const CitySelector = ({ selectedCity, onCityChange }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoading(true);
                const response = await getSupportedCities();
                const cityList = response.data?.cities || [];
                setCities(cityList);
                setError(null);
            } catch (err) {
                console.error('Error fetching nodes:', err);
                setError('Nodes Offline');
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    return (
        <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className={`p-2 rounded-lg ${loading ? 'bg-slate-50 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                {loading ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
            </div>
            <div className="flex-grow">
                <label htmlFor="city-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    {loading ? 'Scanning Sensor Network...' : 'Strategic Location Selector'}
                </label>

                {error ? (
                    <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                        <AlertCircle size={12} /> {error}
                    </div>
                ) : (
                    <select
                        id="city-select"
                        value={selectedCity}
                        onChange={(e) => onCityChange(e.target.value)}
                        disabled={loading || cities.length === 0}
                        className="block w-full bg-transparent font-bold text-slate-800 focus:outline-none focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <option>Syncing Nodes...</option>
                        ) : cities.length > 0 ? (
                            cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}, India
                                </option>
                            ))
                        ) : (
                            <option>No Supported Cities Available</option>
                        )}
                    </select>
                )}
            </div>
        </div>
    );
};

export default CitySelector;
