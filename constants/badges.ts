/**
 * Badge definitions for the gamification system
 */

import { BadgeRequirementType } from '@/types/database.types';

export interface BadgeDefinition {
  name: string;
  description: string;
  iconName: string;
  emoji: string;
  requirementType: BadgeRequirementType;
  requirementValue: number;
  color: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Star-based badges
  {
    name: 'First Star',
    description: 'Earned your very first star!',
    iconName: 'star',
    emoji: '⭐',
    requirementType: 'stars_total',
    requirementValue: 1,
    color: '#FFD700',
  },
  {
    name: 'Star Collector',
    description: 'Collected 10 stars',
    iconName: 'star-circle',
    emoji: '🌟',
    requirementType: 'stars_total',
    requirementValue: 10,
    color: '#FFB300',
  },
  {
    name: 'Star Explorer',
    description: 'Collected 25 stars',
    iconName: 'star-four-points',
    emoji: '✨',
    requirementType: 'stars_total',
    requirementValue: 25,
    color: '#FFA000',
  },
  {
    name: 'Rising Star',
    description: 'Collected 50 stars',
    iconName: 'star-shooting',
    emoji: '🌠',
    requirementType: 'stars_total',
    requirementValue: 50,
    color: '#FF8F00',
  },
  {
    name: 'Star Champion',
    description: 'Collected 100 stars',
    iconName: 'trophy-award',
    emoji: '🏆',
    requirementType: 'stars_total',
    requirementValue: 100,
    color: '#FF6F00',
  },
  {
    name: 'Super Star',
    description: 'Collected 250 stars',
    iconName: 'medal',
    emoji: '🥇',
    requirementType: 'stars_total',
    requirementValue: 250,
    color: '#E65100',
  },
  {
    name: 'Star Legend',
    description: 'Collected 500 stars',
    iconName: 'crown',
    emoji: '👑',
    requirementType: 'stars_total',
    requirementValue: 500,
    color: '#9C27B0',
  },

  // Goal-based badges
  {
    name: 'Goal Getter',
    description: 'Completed your first goal',
    iconName: 'target',
    emoji: '🎯',
    requirementType: 'goals_completed',
    requirementValue: 1,
    color: '#4CAF50',
  },
  {
    name: 'Goal Crusher',
    description: 'Completed 5 goals',
    iconName: 'target-account',
    emoji: '💪',
    requirementType: 'goals_completed',
    requirementValue: 5,
    color: '#2E7D32',
  },
  {
    name: 'Goal Master',
    description: 'Completed 10 goals',
    iconName: 'check-decagram',
    emoji: '🏅',
    requirementType: 'goals_completed',
    requirementValue: 10,
    color: '#1B5E20',
  },
  {
    name: 'Goal Champion',
    description: 'Completed 25 goals',
    iconName: 'shield-check',
    emoji: '🛡️',
    requirementType: 'goals_completed',
    requirementValue: 25,
    color: '#00695C',
  },

  // Streak-based badges
  {
    name: 'Getting Started',
    description: '3 day streak',
    iconName: 'fire',
    emoji: '🔥',
    requirementType: 'streak_days',
    requirementValue: 3,
    color: '#FF5722',
  },
  {
    name: 'On Fire',
    description: '7 day streak',
    iconName: 'fire-circle',
    emoji: '💥',
    requirementType: 'streak_days',
    requirementValue: 7,
    color: '#F4511E',
  },
  {
    name: 'Committed',
    description: '14 day streak',
    iconName: 'calendar-check',
    emoji: '📅',
    requirementType: 'streak_days',
    requirementValue: 14,
    color: '#E64A19',
  },
  {
    name: 'Dedication',
    description: '30 day streak',
    iconName: 'calendar-star',
    emoji: '🗓️',
    requirementType: 'streak_days',
    requirementValue: 30,
    color: '#D84315',
  },
  {
    name: 'Unstoppable',
    description: '60 day streak',
    iconName: 'lightning-bolt',
    emoji: '⚡',
    requirementType: 'streak_days',
    requirementValue: 60,
    color: '#BF360C',
  },
];

/**
 * Get badge by name
 */
export const getBadgeByName = (name: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find(b => b.name === name);
};

/**
 * Get badges by requirement type
 */
export const getBadgesByType = (type: BadgeRequirementType): BadgeDefinition[] => {
  return BADGE_DEFINITIONS.filter(b => b.requirementType === type);
};

/**
 * Get the next badge for a given requirement type and current value
 */
export const getNextBadge = (type: BadgeRequirementType, currentValue: number): BadgeDefinition | null => {
  const badges = getBadgesByType(type).sort((a, b) => a.requirementValue - b.requirementValue);

  for (const badge of badges) {
    if (currentValue < badge.requirementValue) {
      return badge;
    }
  }

  return null; // All badges earned
};
