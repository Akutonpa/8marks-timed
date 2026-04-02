/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Construction, CheckCircle, AlertCircle, ArrowRight, Share2, Plus, Trash2 } from "lucide-react";
import { getTutorFeedback } from "../lib/gemini";

interface ChainStep {
  id: string;
  text: string;
  feedback?: any;
}

export default function ChainBuilder() {
  const [step, setStep] = useState<'intro' | 'build' | 'summary'>('intro');
  const [chain, setChain] = useState<ChainStep[]>([{ id: '1', text: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const handleAddStep = () => {
    if (chain[chain.length - 1].text.length > 0) {
      setChain([...chain, { id: Date.now().toString(), text: '' }]);
      setCurrentStepIdx(chain.length);
    }
  };

  const handleRemoveStep = (id: string) => {
    if (chain.length > 1) {
      setChain(chain.filter(s => s.id !== id));
      setCurrentStepIdx(Math.max(0, currentStepIdx - 1));
    }
  };

  const handleCheckStep = async (idx: number) => {
    const stepText = chain[idx].text;
    const previousSteps = chain.slice(0, idx).map(s => s.text).join(" → ");
    
    setIsSubmitting(true);
    try {
      const feedback = await getTutorFeedback(
        `Previous steps: ${previousSteps || "None (this is the first step)"}`,
        stepText,
        "Chain Builder"
      );
      
      const newChain = [...chain];
      newChain[idx].feedback = feedback;
      setChain(newChain);
    } catch (error) {
      console.error("Chain builder error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSummary = () => {
    let text = `IGCSE Economics Chain Builder Summary\n\n`;
    text += `Chain of Reasoning:\n`;
    chain.forEach((s, i) => {
      text += `${i + 1}. ${s.text}\n`;
    });
    return text;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Chain Builder</h1>
          <p className="text-xl text-gray-600">Build complex economic chains of reasoning step by step. Each step is checked by the AI Tutor for logical flow and terminology.</p>
        </div>

        <div className="bg-blue-600 p-8 rounded-3xl text-white space-y-6 shadow-xl">
          <h2 className="text-xl font-bold flex items-center">
            <Construction className="mr-3 w-6 h-6" /> How it works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
              <p className="text-sm text-blue-50">Write your first causal step (e.g., "Income tax rises").</p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
              <p className="text-sm text-blue-50">Check the step. The AI Tutor will coach you if the logic is weak.</p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
              <p className="text-sm text-blue-50">Add the next step until you reach a named inflation outcome.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={() => setStep('build')} className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-lg flex items-center group">
            Start Building <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'build') {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900">Chain Construction</h2>
          <button
            onClick={() => setStep('summary')}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
          >
            Finish Chain
          </button>
        </div>

        <div className="space-y-4">
          {chain.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Step {i + 1}</span>
                <button onClick={() => handleRemoveStep(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={s.text}
                  onChange={(e) => {
                    const newChain = [...chain];
                    newChain[i].text = e.target.value;
                    setChain(newChain);
                  }}
                  placeholder="e.g., Disposable income falls..."
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                <button
                  onClick={() => handleCheckStep(i)}
                  disabled={isSubmitting || !s.text}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  Check
                </button>
              </div>

              <AnimatePresence>
                {s.feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 rounded-xl border mt-4 ${
                      s.feedback.verdict === 'correct' ? 'bg-green-50 border-green-100 text-green-800' : 
                      s.feedback.verdict === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
                      'bg-red-50 border-red-100 text-red-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {s.feedback.verdict === 'correct' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                      <p className="text-sm font-medium leading-relaxed">{s.feedback.message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          <button
            onClick={handleAddStep}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center group"
          >
            <Plus className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" /> Add Next Step
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900">Chain Complete</h1>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h2 className="font-bold flex items-center"><Share2 className="mr-2 w-5 h-5 text-blue-600" /> Share Text</h2>
          <textarea readOnly value={generateSummary()} className="w-full h-64 p-4 bg-gray-50 border rounded-xl font-mono text-xs" />
          <button onClick={() => { navigator.clipboard.writeText(generateSummary()); alert("Copied!"); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Copy to Clipboard</button>
        </div>
      </div>
    );
  }

  return null;
}
