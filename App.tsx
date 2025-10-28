
import React from 'react';
import MindMap from './components/MindMap';
import Header from './components/Header';
import { mindMapData } from './data/mindMapData';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-800 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <MindMap data={mindMapData} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Tip: Scroll to zoom, and drag to pan the mind map. Hover over nodes for details.
        </p>
      </main>
    </div>
  );
};

export default App;