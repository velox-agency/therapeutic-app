/**
 * M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised)
 * Scoring logic and utilities
 */

import { RiskLevel as DbRiskLevel } from '@/types/database.types';

// Re-export for convenience
export type RiskLevel = DbRiskLevel;

// Questions where "Yes" is the concerning response
const YES_CONCERNING = [11, 18, 20];

// All other questions where "No" is the concerning response
const NO_CONCERNING = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 19];

// Critical items (for medium risk assessment)
const CRITICAL_ITEMS = [2, 5, 12, 14, 17, 18, 20];

export interface MChatAnswer {
  questionNumber: number;
  answer: boolean; // true = Yes, false = No
}

export interface MChatResult {
  totalScore: number;
  riskLevel: RiskLevel;
  criticalItemsCount: number;
  followUpNeeded: boolean;
  message: string;
}

/**
 * Calculate if a single answer is concerning
 */
export const isConcerningAnswer = (questionNumber: number, answer: boolean): boolean => {
  if (YES_CONCERNING.includes(questionNumber)) {
    return answer === true; // Yes is concerning
  }
  return answer === false; // No is concerning
};

/**
 * Score M-CHAT-R answers and determine risk level
 */
export const scoreMChatR = (answers: Record<string, boolean>): MChatResult => {
  let totalScore = 0;
  let criticalItemsCount = 0;

  // Calculate total score
  for (let i = 1; i <= 20; i++) {
    const answer = answers[String(i)];
    if (answer !== undefined && isConcerningAnswer(i, answer)) {
      totalScore++;

      // Count critical items
      if (CRITICAL_ITEMS.includes(i)) {
        criticalItemsCount++;
      }
    }
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  let message: string;
  let followUpNeeded: boolean;

  if (totalScore <= 2) {
    riskLevel = 'low';
    followUpNeeded = false;
    message = 'Low risk. If child is younger than 24 months, screen again after second birthday.';
  } else if (totalScore >= 3 && totalScore <= 7) {
    riskLevel = 'medium';
    followUpNeeded = true;
    message = 'Medium risk. Administer the Follow-Up (M-CHAT-R/F) to get additional information about at-risk responses.';
  } else {
    riskLevel = 'high';
    followUpNeeded = true;
    message = 'High risk. Immediate referral for diagnostic evaluation and eligibility evaluation for early intervention is recommended.';
  }

  return {
    totalScore,
    riskLevel,
    criticalItemsCount,
    followUpNeeded,
    message,
  };
};

/**
 * Get risk level color based on theme
 */
export const getRiskColor = (riskLevel: RiskLevel): string => {
  const colors = {
    low: '#4CAF50',    // Green
    medium: '#FF9800', // Orange
    high: '#F44336',   // Red
  };
  return colors[riskLevel];
};

/**
 * Get risk level display text
 */
export const getRiskDisplayText = (riskLevel: RiskLevel): string => {
  const text = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };
  return text[riskLevel];
};
