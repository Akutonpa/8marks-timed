/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ToolMetadata } from "../types";
import ToolCard from "./ToolCard";

const TOOLS: ToolMetadata[] = [
  {
    id: "8mark_timed_response",
    name: "8-Mark Timed Response",
    description: "Full timed 8-mark responses under exam conditions with AI examiner feedback.",
    status: "Complete",
    icon: "📊"
  },
  {
    id: "chain_ending_drill",
    name: "Chain Ending Drill",
    description: "Drill the habit of ending chains with a named inflation type (demand-pull or cost-push).",
    status: "Complete",
    icon: "🔗"
  },
  {
    id: "conclusion_practice",
    name: "Conclusion Practice",
    description: "Practice writing evaluative conclusions that make a judgement, not just a summary.",
    status: "Complete",
    icon: "💡"
  },
  {
    id: "terminology_drill",
    name: "Terminology Drill",
    description: "Master using economic terms correctly in chains and conclusions under pressure.",
    status: "Complete",
    icon: "📖"
  },
  {
    id: "chain_builder",
    name: "Chain Builder",
    description: "Build chains of reasoning step by step with real-time AI tutor coaching.",
    status: "v1 — needs update",
    icon: "🏗️"
  }
];

interface DashboardProps {
  onSelectTool: (id: string) => void;
}

export default function Dashboard({ onSelectTool }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4"
        >
          <span className="text-sm font-black uppercase tracking-widest">ACS Jakarta — IGCSE Economics 0455</span>
        </motion.div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">8-Mark Question Practice Suite</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A set of AI-powered tools designed to take you from understanding the mark scheme to writing full timed responses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <ToolCard tool={tool} onClick={() => onSelectTool(tool.id)} />
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-900">The Core Skill</h2>
        <p className="text-sm text-gray-600 max-w-xl mx-auto italic">
          "The single most common reason for dropping from Level 3 to Level 2 is ending a chain before naming the inflation type."
        </p>
        <div className="flex justify-center space-x-8 pt-4">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600">12m</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Timed Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600">250w</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Word Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600">L3</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Band</div>
          </div>
        </div>
      </div>
    </div>
  );
}
