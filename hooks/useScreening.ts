import { MChatResult, scoreMChatR } from '@/lib/mchat';
import { supabase } from '@/lib/supabase';
import { Screening } from '@/types/database.types';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

interface UseScreeningResult {
  answers: Record<string, boolean>;
  currentQuestion: number;
  isComplete: boolean;
  result: MChatResult | null;
  setAnswer: (questionNumber: number, answer: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (questionNumber: number) => void;
  submitScreening: (childId: string) => Promise<{ data: Screening | null; error: any }>;
  reset: () => void;
}

export function useScreening(): UseScreeningResult {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [result, setResult] = useState<MChatResult | null>(null);

  const isComplete = Object.keys(answers).length === 20;

  const setAnswer = useCallback((questionNumber: number, answer: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [String(questionNumber)]: answer,
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < 20) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const goToQuestion = useCallback((questionNumber: number) => {
    if (questionNumber >= 1 && questionNumber <= 20) {
      setCurrentQuestion(questionNumber);
    }
  }, []);

  const submitScreening = async (childId: string) => {
    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    if (!isComplete) {
      return { data: null, error: new Error('Please answer all questions') };
    }

    // Calculate result
    const mchatResult = scoreMChatR(answers);
    setResult(mchatResult);

    // Save to database
    const { data, error } = await supabase
      .from('screenings')
      .insert({
        child_id: childId,
        parent_id: user.id,
        answers,
        total_score: mchatResult.totalScore,
        risk_level: mchatResult.riskLevel,
        follow_up_requested: mchatResult.followUpNeeded,
      })
      .select()
      .single();

    return { data, error };
  };

  const reset = useCallback(() => {
    setAnswers({});
    setCurrentQuestion(1);
    setResult(null);
  }, []);

  return {
    answers,
    currentQuestion,
    isComplete,
    result,
    setAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitScreening,
    reset,
  };
}

/**
 * Hook to get screening history for a child
 */
export function useScreeningHistory(childId?: string) {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchScreenings = useCallback(async () => {
    if (!childId) {
      setScreenings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('screenings')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false });

    if (fetchError) {
      setError(fetchError);
    } else {
      setScreenings(data || []);
    }

    setLoading(false);
  }, [childId]);

  return { screenings, loading, error, refetch: fetchScreenings };
}

export default useScreening;
