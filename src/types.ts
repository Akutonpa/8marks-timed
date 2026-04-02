/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  status: 'Complete' | 'v1 — needs update' | 'In Progress';
  icon: string;
}

export interface SessionData {
  toolId: string;
  timestamp: number;
  answers: Record<string, string>;
  feedback: Record<string, any>;
  reflections: string[];
  isRestored?: boolean;
}

export interface Question {
  id: string;
  stimulus: string;
  workedExample: string;
  criteria: string[];
}

export interface Feedback {
  level: 1 | 2 | 3;
  marks: string;
  criteriaComments: {
    balanced: 'pass' | 'partial' | 'fail';
    inflation: 'pass' | 'partial' | 'fail';
    conclusion: 'pass' | 'partial' | 'fail';
    terminology: 'pass' | 'partial' | 'fail';
  };
  summary: string;
}
