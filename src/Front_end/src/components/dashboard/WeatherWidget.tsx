import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Compass, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Default: Ho Chi Minh City coordinates
    let lat = 10.762622;
    let lon = 106.660172;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Ho_Chi_Minh`
        );
        const data = await response.json();
        if (data && data.current_weather) {
          const cw = data.current_weather;
          setWeather({
            temp: cw.temperature,
            windSpeed: cw.windspeed,
            weatherCode: cw.weathercode,
            isDay: cw.is_day === 1,
            time: new Date(cw.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherDetails = (code: number, isDay: boolean) => {
    // WMO Weather interpretation codes
    if (code === 0) return { icon: Sun, label: 'Clear Sky', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (code >= 1 && code <= 3) return { icon: Cloud, label: 'Partly Cloudy', color: 'text-slate-400', bg: 'bg-slate-400/10' };
    if (code >= 45 && code <= 48) return { icon: Cloud, label: 'Foggy', color: 'text-slate-300', bg: 'bg-slate-300/10' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: CloudRain, label: 'Rainy', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (code >= 95 && code <= 99) return { icon: CloudLightning, label: 'Thunderstorm', color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    return { icon: Sun, label: 'Sunny', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  };

  if (loading) {
    return (
      <div className="p-4 rounded-3xl border border-[var(--lw-border)] bg-[var(--lw-bg-card)] flex items-center justify-center h-[120px] animate-pulse">
        <span className="text-xs text-[var(--lw-text-muted)] font-semibold uppercase tracking-wider">Loading Climate Data...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-4 rounded-3xl border border-[var(--lw-border)] bg-[var(--lw-bg-card)] flex items-center justify-center h-[120px]">
        <span className="text-xs text-rose-500 font-semibold">Climate API Offline</span>
      </div>
    );
  }

  const details = getWeatherDetails(weather.weatherCode, weather.isDay);
  const WeatherIcon = details.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 rounded-3xl border border-[var(--lw-border)] bg-[var(--lw-bg-card)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--lw-text-muted)]">Live Climate</span>
          <h3 className="text-sm font-black text-[var(--lw-text-primary)] mt-0.5">Ho Chi Minh City</h3>
        </div>
        <div className={`p-2 rounded-2xl ${details.bg} ${details.color} flex items-center justify-center`}>
          <WeatherIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight text-[var(--lw-text-primary)]">{weather.temp}°C</span>
          <span className="text-xs font-semibold text-[var(--lw-text-secondary)]">{details.label}</span>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--lw-text-secondary)]">
          <div className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Feels Real</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
