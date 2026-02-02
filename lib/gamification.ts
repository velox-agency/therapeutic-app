/**
 * Gamification logic for stars and badges
 */

import { Badge } from '@/types/database.types';
import { supabase } from './supabase';

export interface StarEvent {
  childId: string;
  starsEarned: number;
  reason: string;
}

/**
 * Award stars to a child and check for new badges
 */
export const awardStars = async ({ childId, starsEarned, reason }: StarEvent) => {
  // First, get current stars
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('total_stars')
    .eq('id', childId)
    .single();

  if (childError || !child) {
    return { success: false, error: childError };
  }

  const newTotalStars = (child.total_stars || 0) + starsEarned;

  // Update child's total stars
  const { error: updateError } = await supabase
    .from('children')
    .update({ total_stars: newTotalStars })
    .eq('id', childId);

  if (updateError) {
    return { success: false, error: updateError };
  }

  // Check for new badges
  const newBadges = await checkAndAwardBadges(childId, newTotalStars);

  return {
    success: true,
    newTotalStars,
    newBadges,
    error: null
  };
};

/**
 * Check if child qualifies for any new badges and award them
 */
export const checkAndAwardBadges = async (childId: string, totalStars: number): Promise<Badge[]> => {
  // Get all badges the child doesn't have yet
  const { data: earnedBadges } = await supabase
    .from('child_badges')
    .select('badge_id')
    .eq('child_id', childId);

  const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || [];

  // Get available badges for stars_total requirement
  const { data: availableBadges } = await supabase
    .from('badges')
    .select('*')
    .eq('requirement_type', 'stars_total')
    .lte('requirement_value', totalStars);

  if (!availableBadges) return [];

  // Filter to only unearned badges
  const newBadges = availableBadges.filter(
    badge => !earnedBadgeIds.includes(badge.id)
  );

  // Award new badges
  for (const badge of newBadges) {
    await supabase.from('child_badges').insert({
      child_id: childId,
      badge_id: badge.id,
    });
  }

  return newBadges;
};

/**
 * Get all badges for a child
 */
export const getChildBadges = async (childId: string) => {
  const { data, error } = await supabase
    .from('child_badges')
    .select(`
      *,
      badges (*)
    `)
    .eq('child_id', childId)
    .order('earned_at', { ascending: false });

  return { data, error };
};

/**
 * Calculate streak days for a child
 */
export const calculateStreak = async (childId: string): Promise<number> => {
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date')
    .eq('child_id', childId)
    .order('log_date', { ascending: false });

  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].log_date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Star tier milestones
export const STAR_MILESTONES = [
  { stars: 10, title: 'First Steps', icon: '🌟' },
  { stars: 50, title: 'Rising Star', icon: '⭐' },
  { stars: 100, title: 'Star Explorer', icon: '🌟' },
  { stars: 250, title: 'Star Champion', icon: '🏆' },
  { stars: 500, title: 'Super Star', icon: '💫' },
  { stars: 1000, title: 'Star Master', icon: '👑' },
];

/**
 * Get the next milestone for a child
 */
export const getNextMilestone = (currentStars: number) => {
  for (const milestone of STAR_MILESTONES) {
    if (currentStars < milestone.stars) {
      return {
        ...milestone,
        remaining: milestone.stars - currentStars,
        progress: (currentStars / milestone.stars) * 100,
      };
    }
  }
  return null; // All milestones achieved
};
