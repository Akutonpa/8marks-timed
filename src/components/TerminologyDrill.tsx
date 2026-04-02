/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, CheckCircle, AlertCircle, ArrowRight, Share2, Search } from "lucide-react";
import { getTutorFeedback } from "../lib/gemini";

const TERMS = [
  "aggregate demand", "aggregate supply", "demand-pull inflation", "cost-push inflation",
  "disposable income", "purchasing power", "labour costs", "cost of production",
  "consumer spending", "price level", "progressive tax", "real income"
];

const DRILL_TASKS = [
  {
    id: "t1",
    type: "gap",
    chain: "Income tax rises → ________ falls → consumer spending falls → aggregate demand falls.",
    answer: "disposable income",
    options: ["disposable income", "real income", "labour costs"]
  },
  {
    id: "t2",
    type: "gap",
    chain: "Oil prices rise → ________ rise → firms raise prices to maintain profit margins.",
    answer: "cost of production",
    options: ["cost of production", "labour costs", "aggregate demand"]
  },
  {
    id: "t3",
    type: "use",
    term: "purchasing power",
    instruction: "Write one sentence using 'purchasing power' as a causal step showing cause AND effect (not a definition)."
  },
  {
    id: "t4",
    type: "use",
    term: "aggregate demand",
    instruction: "Write one sentence using 'aggregate demand' to show how it leads to demand-pull inflation."
  }
];

export default function TerminologyDrill() {
  const [step, setStep] = useState<'intro' | 'drill' | 'summary'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const task = DRILL_TASKS[currentIdx];

  const handleSubmit = async (val?: string) => {
    const input = val || answers[task.id] || "";
    setIsSubmitting(true);
    try {
      const context = task.type === 'gap' ? task.chain : task.instruction;
      const feedback = await getTutorFeedback(context, input, "Terminology Drill");
      setFeedbacks(prev => ({ ...prev, [task.id]: feedback }));
      
      if (feedback.verdict === 'correct') {
        setTimeout(() => {
          if (currentIdx < DRILL_TASKS.length - 1) {
            setCurrentIdx(prev => prev + 1);
          } else {
            setStep('summary');
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Terminology error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSummary = () => {
    let text = `IGCSE Economics Terminology Drill Summary\n\n`;
    DRILL_TASKS.forEach(t => {
      text += `Task: ${t.type === 'gap' ? t.chain : t.term}\nAnswer: ${answers[t.id] || "Skipped"}\n\n`;
    });
    return text;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Terminology Drill</h1>
          <p className="text-xl text-gray-600">Knowing what a term means is different from using it correctly mid-chain under time pressure.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center text-blue-600">
            <Book className="mr-2 w-5 h-5" /> 12 Key Terms Covered
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TERMS.map((t, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 text-center uppercase tracking-wider">
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={() => setStep('drill')} className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-lg flex items-center group">
            Start Drill <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'drill') {
    const feedback = feedbacks[task.id];
    
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question {currentIdx + 1} of {DRILL_TASKS.length}</span>
          <div className="flex space-x-1">
            {DRILL_TASKS.map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full ${i === currentIdx ? 'bg-blue-600' : i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center">
              <Search className="mr-2 w-4 h-4" /> {task.type === 'gap' ? "Fill the gap" : "Use correctly"}
            </h2>
            <p className="text-2xl font-bold text-gray-900 leading-relaxed">
              {task.type === 'gap' ? task.chain : `Term: ${task.term}`}
            </p>
            {task.type === 'use' && <p className="text-sm text-gray-500 italic">{task.instruction}</p>}
          </div>

          <div className="space-y-6">
            {task.type === 'gap' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {task.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, [task.id]: opt }));
                      handleSubmit(opt);
                    }}
                    disabled={isSubmitting || feedback?.verdict === 'correct'}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      answers[task.id] === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={answers[task.id] || ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                  disabled={isSubmitting || feedback?.verdict === 'correct'}
                  placeholder="Type your sentence here..."
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting || !answers[task.id] || feedback?.verdict === 'correct'}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "Checking..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  feedback.verdict === 'correct' ? 'bg-green-50 border-green-100 text-green-800' : 
                  feedback.verdict === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
                  'bg-red-50 border-red-100 text-red-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {feedback.verdict === 'correct' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                  <p className="text-sm font-medium leading-relaxed">{feedback.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900">Drill Complete</h1>
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
