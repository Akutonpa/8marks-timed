/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Dashboard from "./components/Dashboard";
import TimedResponseTool from "./components/TimedResponseTool";
import ChainEndingDrill from "./components/ChainEndingDrill";
import ConclusionPractice from "./components/ConclusionPractice";
import TerminologyDrill from "./components/TerminologyDrill";
import ChainBuilder from "./components/ChainBuilder";
import Navbar from "./components/Navbar";

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const handleSelectTool = (id: string) => {
    setActiveToolId(id);
  };

  const handleBackToDashboard = () => {
    setActiveToolId(null);
  };

  const getToolTitle = (id: string) => {
    switch (id) {
      case '8mark_timed_response': return 'Timed Response Tool';
      case 'chain_ending_drill': return 'Chain Ending Drill';
      case 'conclusion_practice': return 'Conclusion Practice';
      case 'terminology_drill': return 'Terminology Drill';
      case 'chain_builder': return 'Chain Builder v1';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        onBack={handleBackToDashboard} 
        showBack={!!activeToolId} 
        title={activeToolId ? getToolTitle(activeToolId) : undefined} 
      />

      <main className="py-12">
        <AnimatePresence mode="wait">
          {!activeToolId ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard onSelectTool={handleSelectTool} />
            </motion.div>
          ) : (
            <motion.div
              key={activeToolId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeToolId === '8mark_timed_response' && <TimedResponseTool />}
              {activeToolId === 'chain_ending_drill' && <ChainEndingDrill />}
              {activeToolId === 'conclusion_practice' && <ConclusionPractice />}
              {activeToolId === 'terminology_drill' && <TerminologyDrill />}
              {activeToolId === 'chain_builder' && <ChainBuilder />}
              {activeToolId !== '8mark_timed_response' && activeToolId !== 'chain_ending_drill' && activeToolId !== 'conclusion_practice' && activeToolId !== 'terminology_drill' && activeToolId !== 'chain_builder' && (
                <div className="max-w-4xl mx-auto p-8 text-center space-y-8">
                  <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full mb-4">
                    <span className="text-4xl">🏗️</span>
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tool Under Construction</h1>
                  <p className="text-xl text-gray-600">
                    The {getToolTitle(activeToolId)} is currently being implemented. 
                    Please check back soon or try the <strong>8-Mark Timed Response</strong> tool.
                  </p>
                  <button
                    onClick={handleBackToDashboard}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-gray-100 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Built at ACS Jakarta</span>
            <span className="text-gray-200">•</span>
            <span>IGCSE 0455 Economics</span>
            <span className="text-gray-200">•</span>
            <span>March–April 2026</span>
          </div>
          <div className="flex items-center space-x-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
