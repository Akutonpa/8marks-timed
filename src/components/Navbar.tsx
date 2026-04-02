/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";

interface NavbarProps {
  onBack: () => void;
  showBack: boolean;
  title?: string;
}

export default function Navbar({ onBack, showBack, title }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showBack ? (
            <motion.button
              whileHover={{ x: -2 }}
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-bold">Back to Suite</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">IGCSE Economics</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">8-Mark Practice Suite</p>
              </div>
            </div>
          )}
        </div>

        {title && (
          <div className="hidden md:block">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{title}</h2>
          </div>
        )}

        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>0455 Syllabus</span>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs">
            AJ
          </div>
        </div>
      </div>
    </nav>
  );
}
