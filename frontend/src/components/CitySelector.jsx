import React from 'react';
import { MapPin } from 'lucide-react';

const cities = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad", "Ahmedabad"];

const CitySelector = ({ selectedCity, onCityChange }) => {
    return (
        <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <MapPin size={24} />
            </div>
            <div className="flex-grow">
                <label htmlFor="city-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Select Location
                </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => onCityChange(e.target.value)}
                    className="block w-full bg-transparent font-bold text-slate-800 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}, India
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CitySelector;
