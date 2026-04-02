/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ToolMetadata } from "../types";

interface ToolCardProps {
  tool: ToolMetadata;
  onClick: () => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {/* Icon placeholder - would normally use tool.icon */}
          <span className="text-2xl">📊</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          tool.status === 'Complete' ? 'bg-green-100 text-green-700' : 
          tool.status === 'v1 — needs update' ? 'bg-amber-100 text-amber-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {tool.status}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {tool.description}
      </p>
      <div className="flex items-center text-blue-600 font-medium text-sm">
        Launch Tool <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}
