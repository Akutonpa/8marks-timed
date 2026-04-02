/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface WordCounterProps {
  text: string;
}

export default function WordCounter({ text }: WordCounterProps) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  const getProgressColor = () => {
    if (words === 0) return "bg-gray-200";
    if (words < 150) return "bg-gray-400";
    if (words < 200) return "bg-amber-400";
    if (words <= 250) return "bg-green-500";
    return "bg-red-600";
  };

  const getLabel = () => {
    if (words < 150) return "Too short";
    if (words < 200) return "Getting there";
    if (words <= 250) return "Target range";
    return "Over target";
  };

  const progress = Math.min((words / 250) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Word Count</span>
        <span className={`text-sm font-semibold ${
          words < 150 ? 'text-gray-500' : 
          words < 200 ? 'text-amber-600' : 
          words <= 250 ? 'text-green-600' : 
          'text-red-600'
        }`}>
          {words} words — {getLabel()}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${getProgressColor()} transition-colors duration-500`}
        />
      </div>
    </div>
  );
}
