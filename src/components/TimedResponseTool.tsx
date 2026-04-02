/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, BookOpen, Send, CheckCircle, AlertCircle, RotateCcw, ArrowRight, ArrowLeft, Share2 } from "lucide-react";
import Timer from "./Timer";
import WordCounter from "./WordCounter";
import AIFeedback from "./AIFeedback";
import { getExaminerFeedback } from "../lib/gemini";
import { Question, Feedback } from "../types";

const QUESTIONS: Question[] = [
  {
    id: "fiscal",
    stimulus: "Discuss whether or not an increase in income tax will reduce inflation in an economy.",
    workedExample: "Income tax rises → disposable income falls → spending falls → aggregate demand falls → demand-pull inflation falls. On the other hand, workers may demand higher wages to maintain their purchasing power → firms' costs of production rise → cost-push inflation rises.",
    criteria: ["Two balanced sides", "Chains end with inflation type", "Evaluative conclusion", "Terminology throughout"]
  },
  {
    id: "trade",
    stimulus: "Discuss whether or not a decrease in tariffs on imports will benefit an economy.",
    workedExample: "Tariffs fall → import prices fall → consumer spending on cheaper imports rises → standard of living rises. However, domestic firms face more competition → demand for domestic goods falls → firms may cut production and labour costs → unemployment rises → demand-pull inflation falls.",
    criteria: ["Two balanced sides", "Chains end with inflation type", "Evaluative conclusion", "Terminology throughout"]
  },
  {
    id: "labour",
    stimulus: "Discuss whether or not an increase in the national minimum wage will benefit workers.",
    workedExample: "Minimum wage rises → low-paid workers' incomes rise → purchasing power increases → consumption rises → aggregate demand rises → demand-pull inflation rises. However, firms' labour costs rise → cost of production increases → firms may reduce their workforce to maintain profit margins → unemployment rises.",
    criteria: ["Two balanced sides", "Chains end with inflation type", "Evaluative conclusion", "Terminology throughout"]
  }
];

export default function TimedResponseTool() {
  const [step, setStep] = useState<'intro' | 'exam' | 'reflection' | 'summary'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [reflections, setReflections] = useState<string[]>(["", "", ""]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Auto-save logic
  useEffect(() => {
    const session = {
      toolId: '8mark_timed_response',
      timestamp: Date.now(),
      answers,
      feedbacks,
      reflections,
      currentQuestionIndex,
      step,
      isRestored: true
    };
    localStorage.setItem('igcse_econ_session', JSON.stringify(session));
  }, [answers, feedbacks, reflections, currentQuestionIndex, step]);

  // Session restore logic
  useEffect(() => {
    const saved = localStorage.getItem('igcse_econ_session');
    if (saved) {
      const session = JSON.parse(saved);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - session.timestamp < sevenDays) {
        setShowRestoreBanner(true);
      }
    }
  }, []);

  const restoreSession = () => {
    const saved = localStorage.getItem('igcse_econ_session');
    if (saved) {
      const session = JSON.parse(saved);
      setAnswers(session.answers || {});
      setFeedbacks(session.feedbacks || {});
      setReflections(session.reflections || ["", "", ""]);
      setCurrentQuestionIndex(session.currentQuestionIndex || 0);
      setStep(session.step || 'intro');
      setIsRestored(true);
      setShowRestoreBanner(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('igcse_econ_session');
    setShowRestoreBanner(false);
  };

  const handleStartExam = () => {
    setStep('exam');
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (!isTimerActive && value.length > 0) {
      setIsTimerActive(true);
    }
  };

  const handleSubmitResponse = async () => {
    setIsTimerActive(false);
    setIsSubmitting(true);
    
    try {
      const response = answers[currentQuestion.id] || "";
      const feedback = await getExaminerFeedback(currentQuestion.stimulus, response);
      setFeedbacks(prev => ({ ...prev, [currentQuestion.id]: feedback }));
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsTimerActive(false);
    } else {
      setStep('reflection');
    }
  };

  const handleReflectionChange = (index: number, value: string) => {
    const newReflections = [...reflections];
    newReflections[index] = value;
    setReflections(newReflections);
    
    // Auto-summary trigger
    if (newReflections.every(r => r.length > 50)) {
      setTimeout(() => setStep('summary'), 1500);
    }
  };

  const generateShareText = () => {
    const date = new Date().toLocaleDateString();
    let text = `IGCSE Economics 8-Mark Timed Response Summary\nDate: ${date}\n`;
    if (isRestored) text += `Restored session — original answers shown below.\n`;
    text += `--------------------------------------------------\n\n`;

    QUESTIONS.forEach((q, i) => {
      const answer = answers[q.id] || "No answer provided.";
      const feedback = feedbacks[q.id];
      text += `Question ${i + 1}: ${q.stimulus}\n`;
      text += `Response: ${answer}\n`;
      if (feedback) {
        text += `Examiner Feedback: Level ${feedback.level} (${feedback.marks} marks)\n`;
        text += `Summary: ${feedback.summary}\n`;
      }
      text += `\n`;
    });

    text += `Reflections:\n`;
    text += `1. Hardest part: ${reflections[0]}\n`;
    text += `2. Inflation chains: ${reflections[1]}\n`;
    text += `3. Next steps: ${reflections[2]}\n`;

    return text;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        {showRestoreBanner && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center text-amber-800">
              <RotateCcw className="mr-3 w-5 h-5" />
              <p className="text-sm font-medium">Previous session found. Restore your answers from where you left off?</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={restoreSession} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors">Yes, restore</button>
              <button onClick={clearSession} className="px-4 py-2 bg-white text-amber-700 border border-amber-200 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors">Start fresh</button>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">8-Mark Timed Response</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Master the "discuss" question under exam conditions with real-time AI feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center text-blue-600">
                <CheckCircle className="mr-2 w-5 h-5" /> The Four Criteria
              </h2>
              <ul className="space-y-3">
                {["Two balanced sides", "Chains end with inflation type", "Evaluative conclusion", "Terminology throughout"].map((c, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700">
                    <span className="mr-2 text-blue-500 font-bold">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl text-white space-y-4">
              <h2 className="text-lg font-bold flex items-center text-blue-400">
                <BookOpen className="mr-2 w-5 h-5" /> Worked Example
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "Income tax rises → disposable income falls → spending falls → aggregate demand falls → <strong>demand-pull inflation falls</strong>."
              </p>
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Tip: Always end with a named inflation type.</p>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={handleStartExam}
              className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center group"
            >
              Begin Exam Practice <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'exam') {
    const feedback = feedbacks[currentQuestion.id];
    
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <Timer initialSeconds={720} onTimeUp={handleSubmitResponse} isActive={isTimerActive} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of 3</span>
            <div className="flex space-x-1">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i === currentQuestionIndex ? 'bg-blue-600' : i < currentQuestionIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{currentQuestion.stimulus}</h2>
              
              <div className="relative">
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={handleInputChange}
                  disabled={!!feedback || isSubmitting}
                  placeholder="Start typing your response here..."
                  className="w-full h-80 p-6 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-gray-800 leading-relaxed font-medium"
                />
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>All answers saved</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <WordCounter text={answers[currentQuestion.id] || ""} />
                <div className="ml-8">
                  {!feedback ? (
                    <button
                      onClick={handleSubmitResponse}
                      disabled={isSubmitting || (answers[currentQuestion.id]?.length || 0) < 50}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center whitespace-nowrap"
                    >
                      {isSubmitting ? "Marking..." : "Submit Response"} <Send className="ml-2 w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center whitespace-nowrap"
                    >
                      {currentQuestionIndex < QUESTIONS.length - 1 ? "Next Question" : "Continue to Reflection"} <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {feedback && <AIFeedback feedback={feedback} />}
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-4">
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center">
                <AlertCircle className="mr-2 w-4 h-4" /> Exam Strategy
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                  <p className="text-xs font-bold text-amber-800 mb-1">Check 1: Inflation</p>
                  <p className="text-xs text-amber-700">Does every chain of reasoning end with a named type of inflation?</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                  <p className="text-xs font-bold text-amber-800 mb-1">Check 2: Conclusion</p>
                  <p className="text-xs text-amber-700">Does your conclusion make a clear judgement, or does it just summarise?</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Marking Criteria</h3>
              <div className="space-y-2">
                {currentQuestion.criteria.map((c, i) => (
                  <div key={i} className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reflection') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Self-Reflection</h1>
          <p className="text-xl text-gray-600">Think about your performance today. Be honest — this is for your own growth.</p>
        </div>

        <div className="space-y-8">
          {[
            "Which question felt hardest under time pressure — and what does that tell you about where to focus?",
            "In the chain drill, did the inflation outcome come automatically — or did you still have to remind yourself?",
            "Read your conclusions. Do they make a judgement or summarise? What's one thing to fix next time?"
          ].map((q, i) => (
            <div key={i} className="space-y-4">
              <label className="text-lg font-bold text-gray-900 block">{q}</label>
              <textarea
                value={reflections[i]}
                onChange={(e) => handleReflectionChange(i, e.target.value)}
                placeholder="Type your reflection here (min 50 characters)..."
                className="w-full h-32 p-6 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-gray-800 leading-relaxed"
              />
              <div className="flex justify-end">
                <span className={`text-xs font-bold ${reflections[i].length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  {reflections[i].length}/50 characters
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600 font-bold">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Generating summary...</span>
            </div>
            <p className="text-sm text-gray-500">The summary will appear automatically once all reflections are complete.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const shareText = generateShareText();
    
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Activity Complete</h1>
          <p className="text-xl text-gray-600">Great work. Copy the summary below and send it to your teacher.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Share2 className="mr-2 w-5 h-5 text-blue-600" /> Shareable Summary
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareText);
                alert("Summary copied to clipboard!");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
          <textarea
            readOnly
            value={shareText}
            className="w-full h-96 p-6 bg-gray-50 border border-gray-200 rounded-2xl font-mono text-sm text-gray-700 leading-relaxed resize-none focus:outline-none"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              clearSession();
              window.location.reload();
            }}
            className="flex items-center text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="mr-2 w-4 h-4" /> Start a New Session
          </button>
        </div>
      </div>
    );
  }

  return null;
}
