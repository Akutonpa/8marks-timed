/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, XCircle, Award } from "lucide-react";
import { Feedback } from "../types";

interface AIFeedbackProps {
  feedback: Feedback;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  const getStatusIcon = (status: 'pass' | 'partial' | 'fail') => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'partial': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: 'pass' | 'partial' | 'fail') => {
    switch (status) {
      case 'pass': return <span className="text-green-700 font-medium">Pass</span>;
      case 'partial': return <span className="text-amber-700 font-medium">Partial</span>;
      case 'fail': return <span className="text-red-700 font-medium">Fail</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-8"
    >
      <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Award className="mr-2 w-6 h-6" /> Examiner Feedback
          </h3>
          <p className="text-blue-100 text-sm mt-1">Level {feedback.level} — {feedback.marks} marks</p>
        </div>
        <div className="text-4xl font-black opacity-20">
          L{feedback.level}
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(feedback.criteriaComments).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status as any)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <div className="text-xs uppercase tracking-wider">
                {getStatusLabel(status as any)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">Examiner Summary</h4>
          <p className="text-blue-800 text-sm leading-relaxed italic">
            "{feedback.summary}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}
