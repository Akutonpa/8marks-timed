/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, CheckCircle, AlertCircle, ArrowRight, Share2, MessageSquare } from "lucide-react";
import { getTutorFeedback } from "../lib/gemini";

const CONCLUSION_TASKS = [
  {
    id: "c1",
    question: "Discuss whether or not an increase in income tax will reduce inflation.",
    body: "On one hand, higher income tax reduces disposable income, leading to lower consumer spending and a fall in aggregate demand, which reduces demand-pull inflation. On the other hand, workers may demand higher wages to maintain their standard of living, increasing firms' costs of production and causing cost-push inflation.",
    hint: "Make a judgement: which effect is more likely? Add a qualifying condition (e.g., 'it depends on...')."
  },
  {
    id: "c2",
    question: "Discuss whether or not a decrease in tariffs will benefit an economy.",
    body: "A decrease in tariffs makes imports cheaper, increasing consumer choice and purchasing power. However, it also increases competition for domestic firms, potentially leading to lower profits, job losses, and a decline in domestic output.",
    hint: "Judge the overall impact. Does it depend on the competitiveness of domestic firms?"
  },
  {
    id: "c3",
    question: "Discuss whether or not a rise in the national minimum wage will benefit workers.",
    body: "A higher minimum wage increases the income and purchasing power of low-paid workers, potentially reducing poverty. However, it also increases labour costs for firms, which may respond by reducing their workforce or increasing prices, leading to unemployment or cost-push inflation.",
    hint: "Which workers benefit most? Does it depend on the elasticity of demand for labour?"
  }
];

export default function ConclusionPractice() {
  const [step, setStep] = useState<'intro' | 'practice' | 'summary'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const task = CONCLUSION_TASKS[currentIdx];

  const handleSubmit = async () => {
    const input = answers[task.id] || "";
    setIsSubmitting(true);
    try {
      const feedback = await getTutorFeedback(task.body, input, "Conclusion Practice");
      setFeedbacks(prev => ({ ...prev, [task.id]: feedback }));
      
      if (feedback.verdict === 'correct') {
        setTimeout(() => {
          if (currentIdx < CONCLUSION_TASKS.length - 1) {
            setCurrentIdx(prev => prev + 1);
          } else {
            setStep('summary');
          }
        }, 2500);
      }
    } catch (error) {
      console.error("Conclusion error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSummary = () => {
    let text = `IGCSE Economics Conclusion Practice Summary\n\n`;
    CONCLUSION_TASKS.forEach(t => {
      text += `Question: ${t.question}\nConclusion: ${answers[t.id] || "Skipped"}\n\n`;
    });
    return text;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Conclusion Practice</h1>
          <p className="text-xl text-gray-600">Writing evaluative conclusions — not summaries. The examiner has already read the body — a summary adds nothing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-3">
            <h3 className="text-sm font-black text-red-900 uppercase tracking-widest flex items-center">
              <AlertCircle className="mr-2 w-4 h-4" /> Summary Conclusion (Weak)
            </h3>
            <p className="text-sm text-red-800 italic">"Overall, income tax can reduce inflation by decreasing demand, but it can also cause inflation if wages rise."</p>
            <p className="text-xs text-red-600 font-bold">Problem: Just repeats the two sides.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-3">
            <h3 className="text-sm font-black text-green-900 uppercase tracking-widest flex items-center">
              <CheckCircle className="mr-2 w-4 h-4" /> Evaluative Conclusion (Strong)
            </h3>
            <p className="text-sm text-green-800 italic">"Overall, the effect depends on whether workers respond by demanding higher wages — if they do, cost-push inflation becomes the more likely outcome, making the policy counterproductive."</p>
            <p className="text-xs text-green-600 font-bold">Strength: Makes a judgement + qualifying condition.</p>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={() => setStep('practice')} className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-lg flex items-center group">
            Start Practice <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'practice') {
    const feedback = feedbacks[task.id];
    
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Task {currentIdx + 1} of 3</span>
          <div className="flex space-x-1">
            {CONCLUSION_TASKS.map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full ${i === currentIdx ? 'bg-blue-600' : i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">The Question</h2>
              <p className="text-xl font-bold text-gray-900 leading-tight">{task.question}</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl text-white space-y-4">
              <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center">
                <MessageSquare className="mr-2 w-4 h-4" /> Pre-written Body
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed italic">"{task.body}"</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center">
                <Lightbulb className="mr-2 w-4 h-4" /> Write your conclusion
              </h2>
              <textarea
                value={answers[task.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                disabled={isSubmitting || feedback?.verdict === 'correct'}
                placeholder="Start with 'Overall...' and make a judgement."
                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 font-bold italic">Hint: {task.hint}</p>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answers[task.id] || feedback?.verdict === 'correct'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Checking..." : "Submit Conclusion"}
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
          </div>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900">Practice Complete</h1>
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
