-- ============================================
-- Gamification Functions for Therapeutic App
-- ============================================

-- Function to safely increment child stars
-- Uses SECURITY DEFINER to bypass RLS for internal operations
CREATE OR REPLACE FUNCTION increment_stars(p_child_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE children
  SET total_stars = COALESCE(total_stars, 0) + p_amount
  WHERE id = p_child_id
  RETURNING total_stars INTO v_new_total;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_stars(UUID, INTEGER) TO authenticated;

-- Function to calculate streak days for a child
CREATE OR REPLACE FUNCTION calculate_streak(p_child_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_log_date DATE;
  v_expected_date DATE;
  v_logs CURSOR FOR
    SELECT DISTINCT log_date::DATE
    FROM daily_logs
    WHERE child_id = p_child_id
    ORDER BY log_date DESC;
BEGIN
  OPEN v_logs;
  
  LOOP
    FETCH v_logs INTO v_log_date;
    EXIT WHEN NOT FOUND;
    
    v_expected_date := v_current_date - v_streak;
    
    IF v_log_date = v_expected_date THEN
      v_streak := v_streak + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  CLOSE v_logs;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_streak(UUID) TO authenticated;

-- Function to get child's gamification stats
CREATE OR REPLACE FUNCTION get_child_stats(p_child_id UUID)
RETURNS TABLE (
  total_stars INTEGER,
  goals_completed INTEGER,
  streak_days INTEGER,
  total_logs INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.total_stars,
    (SELECT COUNT(*)::INTEGER FROM goals g WHERE g.child_id = p_child_id AND g.status = 'completed'),
    calculate_streak(p_child_id),
    (SELECT COUNT(*)::INTEGER FROM daily_logs dl WHERE dl.child_id = p_child_id)
  FROM children c
  WHERE c.id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_child_stats(UUID) TO authenticated;

-- Trigger to auto-update goal status when target is reached
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_goal RECORD;
  v_total_achieved INTEGER;
BEGIN
  -- Get the goal details
  SELECT * INTO v_goal FROM goals WHERE id = NEW.goal_id;
  
  -- If goal has a target value, check if it's been reached
  IF v_goal.target_value IS NOT NULL THEN
    -- Sum all achieved values for this goal
    SELECT COALESCE(SUM(achieved_value), 0) INTO v_total_achieved
    FROM daily_logs
    WHERE goal_id = NEW.goal_id;
    
    -- If total achieved >= target, mark goal as completed
    IF v_total_achieved >= v_goal.target_value THEN
      UPDATE goals
      SET status = 'completed', is_active = false
      WHERE id = NEW.goal_id
      AND status != 'completed'; -- Only update if not already completed
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for goal completion check
DROP TRIGGER IF EXISTS on_daily_log_check_goal ON daily_logs;
CREATE TRIGGER on_daily_log_check_goal
  AFTER INSERT ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_goal_completion();

-- ============================================
-- Seed Default Badges
-- ============================================

-- Insert default badges if they don't exist
INSERT INTO badges (id, name, description, icon_name, requirement_type, requirement_value)
VALUES
  ('first_steps', 'First Steps', 'Earned your first star!', '🌟', 'stars_total', 1),
  ('rising_star', 'Rising Star', 'Collected 10 stars', '⭐', 'stars_total', 10),
  ('star_explorer', 'Star Explorer', 'Collected 25 stars!', '✨', 'stars_total', 25),
  ('super_star', 'Super Star', 'Collected 50 stars!', '🌠', 'stars_total', 50),
  ('star_champion', 'Star Champion', 'Collected 100 stars!', '🏆', 'stars_total', 100),
  ('goal_getter', 'Goal Getter', 'Completed first goal', '🎯', 'goals_completed', 1),
  ('goal_master', 'Goal Master', 'Completed 5 goals', '🏅', 'goals_completed', 5),
  ('consistent', 'Consistent Champion', '3-day logging streak', '🔥', 'streak_days', 3),
  ('week_warrior', 'Week Warrior', '7-day logging streak', '💪', 'streak_days', 7),
  ('streak_master', 'Streak Master', '14-day logging streak', '🌈', 'streak_days', 14)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON FUNCTION increment_stars IS 'Safely increment a child''s total stars by a given amount. Returns the new total.';
COMMENT ON FUNCTION calculate_streak IS 'Calculate the current consecutive day streak for a child based on daily logs.';
COMMENT ON FUNCTION get_child_stats IS 'Get comprehensive gamification stats for a child including stars, completed goals, and streak.';
COMMENT ON FUNCTION check_goal_completion IS 'Trigger function to automatically mark goals as completed when target is reached.';
