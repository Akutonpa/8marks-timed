/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function getExaminerFeedback(question: string, response: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are an expert IGCSE Economics 0455 examiner. 
  Mark the following 8-mark "discuss" response against the Cambridge mark scheme.
  
  Question Stimulus: ${question}
  
  Student Response: ${response}
  
  Criteria:
  1. Two balanced sides (both arguments developed to equal depth).
  2. Chains end with inflation type (demand-pull or cost-push inflation).
  3. Evaluative conclusion (makes a clear judgement + qualifying condition, not just a summary).
  4. Terminology throughout (economic terms used correctly).
  
  Return your feedback in JSON format with the following structure:
  {
    "level": 1 | 2 | 3,
    "marks": "1-2" | "3-4" | "5-6" | "7-8",
    "criteriaComments": {
      "balanced": "pass" | "partial" | "fail",
      "inflation": "pass" | "partial" | "fail",
      "conclusion": "pass" | "partial" | "fail",
      "terminology": "pass" | "partial" | "fail"
    },
    "summary": "A two-sentence summary for the student's share text."
  }`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.NUMBER },
            marks: { type: Type.STRING },
            criteriaComments: {
              type: Type.OBJECT,
              properties: {
                balanced: { type: Type.STRING, enum: ["pass", "partial", "fail"] },
                inflation: { type: Type.STRING, enum: ["pass", "partial", "fail"] },
                conclusion: { type: Type.STRING, enum: ["pass", "partial", "fail"] },
                terminology: { type: Type.STRING, enum: ["pass", "partial", "fail"] }
              },
              required: ["balanced", "inflation", "conclusion", "terminology"]
            },
            summary: { type: Type.STRING }
          },
          required: ["level", "marks", "criteriaComments", "summary"]
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("AI Examiner Error:", error);
    throw error;
  }
}

export async function getTutorFeedback(context: string, studentInput: string, toolType: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are an AI Economics Tutor for IGCSE 0455. 
  Tool: ${toolType}
  Context: ${context}
  Student Input: ${studentInput}
  
  Follow the Socratic coaching protocol:
  - Do not give the answer.
  - Correct: Confirm, explain why this earns marks, move on.
  - Partial: Acknowledge what's right, ask one nudging question.
  - Incorrect: Identify the specific problem, ask a Socratic question.
  
  Return your feedback in JSON format:
  {
    "verdict": "correct" | "partial" | "incorrect",
    "message": "Your coaching message here."
  }`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ["correct", "partial", "incorrect"] },
            message: { type: Type.STRING }
          },
          required: ["verdict", "message"]
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("AI Tutor Error:", error);
    throw error;
  }
}
