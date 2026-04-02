/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export default function Timer({ initialSeconds, onTimeUp, isActive }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      onTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onTimeUp]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (seconds <= 120) return "text-red-600 font-bold";
    if (seconds <= 240) return "text-amber-600 font-semibold";
    return "text-gray-700 font-medium";
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`text-2xl font-mono ${getTimerColor()} transition-colors duration-500`}>
        {formatTime(seconds)}
      </div>
      <AnimatePresence>
        {seconds <= 120 && seconds > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
