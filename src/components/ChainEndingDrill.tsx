/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, CheckCircle, AlertCircle, RotateCcw, ArrowRight, Share2, HelpCircle } from "lucide-react";
import { getTutorFeedback } from "../lib/gemini";

interface DrillQuestion {
  id: string;
  partialChain: string;
  hint: string;
}

const DRILL_QUESTIONS: DrillQuestion[] = [
  { id: "1", partialChain: "Income tax rises → disposable income falls → spending falls → firms reinvest less → aggregate demand falls →", hint: "Name the inflation type." },
  { id: "2", partialChain: "Interest rates fall → borrowing rises → investment rises → aggregate demand rises →", hint: "Name the inflation type." },
  { id: "3", partialChain: "Exchange rate falls → import prices rise → raw material costs rise → firms raise prices →", hint: "Name the inflation type." },
  { id: "4", partialChain: "Government spending rises → infrastructure improves → productivity rises → aggregate supply rises →", hint: "What happens to the price level?" },
  { id: "5", partialChain: "Tariffs fall → import competition rises → domestic firms cut costs → wages fall → spending falls →", hint: "Complete the chain." },
  { id: "6", partialChain: "Oil prices rise → transport costs rise → cost of production rises →", hint: "Name the inflation type." }
];

const PRECISION_QUESTIONS = [
  { id: "p1", vague: "Prices go up because people have more money.", target: "Use 'aggregate demand' and 'demand-pull inflation'." },
  { id: "p2", vague: "Firms make less stuff and fire people.", target: "Use 'output' and 'unemployment'." },
  { id: "p3", vague: "The economy gets bigger.", target: "Use 'economic growth' or 'real GDP'." },
  { id: "p4", vague: "People can't buy as much as before.", target: "Use 'purchasing power' or 'real income'." }
];

export default function ChainEndingDrill() {
  const [step, setStep] = useState<'intro' | 'chains' | 'precision' | 'reflection' | 'summary'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reflections, setReflections] = useState<string[]>(["", "", ""]);

  const handleStart = () => setStep('chains');

  const handleSubmit = async () => {
    const qId = step === 'chains' ? DRILL_QUESTIONS[currentIdx].id : PRECISION_QUESTIONS[currentIdx].id;
    const input = answers[qId] || "";
    const context = step === 'chains' ? DRILL_QUESTIONS[currentIdx].partialChain : PRECISION_QUESTIONS[currentIdx].vague;
    
    setIsSubmitting(true);
    try {
      const feedback = await getTutorFeedback(context, input, step === 'chains' ? "Chain Ending Drill" : "Language Precision Drill");
      setFeedbacks(prev => ({ ...prev, [qId]: feedback }));
      setAttempts(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
      
      if (feedback.verdict === 'correct' || (attempts[qId] || 0) >= 2) {
        // Move on after correct or 3 attempts
        setTimeout(() => {
          if (step === 'chains') {
            if (currentIdx < DRILL_QUESTIONS.length - 1) {
              setCurrentIdx(prev => prev + 1);
            } else {
              setStep('precision');
              setCurrentIdx(0);
            }
          } else {
            if (currentIdx < PRECISION_QUESTIONS.length - 1) {
              setCurrentIdx(prev => prev + 1);
            } else {
              setStep('reflection');
            }
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Drill error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReflectionChange = (i: number, val: string) => {
    const newRef = [...reflections];
    newRef[i] = val;
    setReflections(newRef);
    if (newRef.every(r => r.length > 30)) {
      setTimeout(() => setStep('summary'), 1500);
    }
  };

  const generateSummary = () => {
    let text = `IGCSE Economics Chain Ending Drill Summary\n\n`;
    text += `Part 1: Chain Endings\n`;
    DRILL_QUESTIONS.forEach(q => {
      text += `Q: ${q.partialChain}\nA: ${answers[q.id] || "Skipped"}\nAttempts: ${attempts[q.id] || 0}\n\n`;
    });
    text += `Part 2: Language Precision\n`;
    PRECISION_QUESTIONS.forEach(q => {
      text += `Vague: ${q.vague}\nRewrite: ${answers[q.id] || "Skipped"}\n\n`;
    });
    text += `Reflections:\n1. ${reflections[0]}\n2. ${reflections[1]}\n3. ${reflections[2]}`;
    return text;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Chain Ending Drill</h1>
          <p className="text-xl text-gray-600">The single most common reason for dropping from Level 3 to Level 2: ending a chain before naming the inflation type.</p>
        </div>

        <div className="bg-gray-900 p-8 rounded-3xl text-white space-y-6">
          <h2 className="text-xl font-bold flex items-center text-blue-400">
            <Link className="mr-3 w-6 h-6" /> The Two Endings to Know
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">Demand-Side</p>
              <p className="text-sm text-gray-300">→ aggregate demand rises/falls → <strong>demand-pull inflation rises/falls</strong></p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">Supply-Side</p>
              <p className="text-sm text-gray-300">→ firms raise prices → <strong>cost-push inflation</strong></p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={handleStart} className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-lg flex items-center group">
            Start Drill <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'chains' || step === 'precision') {
    const q = step === 'chains' ? DRILL_QUESTIONS[currentIdx] : PRECISION_QUESTIONS[currentIdx];
    const feedback = feedbacks[q.id];
    
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {step === 'chains' ? `Part 1: Chain Endings (${currentIdx + 1}/6)` : `Part 2: Language Precision (${currentIdx + 1}/4)`}
          </span>
          <div className="flex space-x-1">
            {(step === 'chains' ? DRILL_QUESTIONS : PRECISION_QUESTIONS).map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full ${i === currentIdx ? 'bg-blue-600' : i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center">
              <HelpCircle className="mr-2 w-4 h-4" /> {step === 'chains' ? "Complete the chain" : "Rewrite precisely"}
            </h2>
            <p className="text-xl font-bold text-gray-900 leading-relaxed">
              {step === 'chains' ? (q as DrillQuestion).partialChain : (q as any).vague}
            </p>
            {step === 'precision' && <p className="text-sm text-gray-500 italic">Target: {(q as any).target}</p>}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              disabled={isSubmitting || feedback?.verdict === 'correct'}
              placeholder={step === 'chains' ? "Type the final steps..." : "Type your precise rewrite..."}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400 font-bold italic">Hint: {step === 'chains' ? (q as DrillQuestion).hint : "Use exact examiner terms."}</p>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !answers[q.id] || feedback?.verdict === 'correct'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Checking..." : "Check Answer"}
              </button>
            </div>
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

  if (step === 'reflection') {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-12">
        <h1 className="text-3xl font-black text-gray-900 text-center">Metacognition</h1>
        <div className="space-y-8">
          {[
            "Did the inflation outcome come automatically — or did you still have to remind yourself?",
            "Which chain was hardest to complete?",
            "What's one term you need to use more often?"
          ].map((q, i) => (
            <div key={i} className="space-y-3">
              <label className="font-bold text-gray-700">{q}</label>
              <textarea
                value={reflections[i]}
                onChange={(e) => handleReflectionChange(i, e.target.value)}
                className="w-full h-24 p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          ))}
        </div>
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
