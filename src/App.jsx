import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CountdownCard from './components/CountdownCard';
import StatsGrid from './components/StatsGrid';
import DelayChart from './components/DelayChart';
import HistoryTable from './components/HistoryTable';
import ExplainerSection from './components/ExplainerSection';
import Footer from './components/Footer';

// Bundled initial data
import initialExecutionData from './data/executions.json';

const VERSION = '0.1.0';

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('heartbeat-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [data, setData] = useState(initialExecutionData);
  const [selectedRunId, setSelectedRunId] = useState(null);

  // Sync theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('heartbeat-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Optional: try fetching live static data at runtime
  useEffect(() => {
    fetch('./data/executions.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Fallback to bundled data');
      })
      .then((liveData) => {
        if (liveData && liveData.cron) {
          setData(liveData);
        }
      })
      .catch(() => {
        // Silently use bundled initial data
      });
  }, []);

  const handleSelectRun = (run) => {
    setSelectedRunId(run.id);
  };

  return (
    <div className="min-h-screen flex flex-col ecg-grid">
      <Navbar theme={theme} onToggleTheme={toggleTheme} version={VERSION} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Countdown & Live Schedule Hero */}
        <CountdownCard />

        {/* High-level Metrics */}
        <StatsGrid cronData={data.cron} manualData={data.manual} />

        {/* Visualized Delay Time Chart */}
        <DelayChart
          data={data.cron}
          onSelectRun={handleSelectRun}
          selectedRunId={selectedRunId}
        />

        {/* Separate Execution History Table (Cron vs Manual) */}
        <HistoryTable
          cronData={data.cron}
          manualData={data.manual}
          selectedRunId={selectedRunId}
        />

        {/* Educational / Context Section */}
        <ExplainerSection />
      </main>

      <Footer version={VERSION} lastUpdated={data.lastUpdated} />
    </div>
  );
}
