import { useCallback, useEffect, useState } from 'react';
import { quizService } from '../services/quizService';
import { ApiError } from '../../../services/api/client';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { Quiz, QuizQuestion, QuizAttemptResult } from '../types';

interface QuizSectionProps {
  lessonId: string;
  onQuizPassed?: () => void;
}

export function QuizSection({ lessonId, onQuizPassed }: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await quizService.getQuizzesForLesson(lessonId);
      setQuizzes(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openQuiz(quizId: string) {
    try {
      const full = await quizService.getQuiz(quizId);
      setActiveQuiz(full);
      setAnswers({});
      setResult(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.info.message : 'Failed to load quiz.');
    }
  }

  function toggleAnswer(questionId: string, choiceIndex: number) {
    const indexStr = String(choiceIndex);
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      const has = existing.includes(indexStr);
      return {
        ...prev,
        [questionId]: has
          ? existing.filter((v) => v !== indexStr)
          : [...existing, indexStr],
      };
    });
  }

  async function submitQuiz() {
    if (!activeQuiz?.questions) return;

    // Every question must have at least one answer
    for (const q of activeQuiz.questions) {
      if (!answers[q.id] || answers[q.id].length === 0) {
        alert('Please answer every question before submitting.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await quizService.submitAttempt(activeQuiz.id, answers);
      setResult(res);
      if (res.passed) {
        onQuizPassed?.();
      }
    } catch (e) {
      alert(e instanceof ApiError ? e.info.message : 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;
  if (quizzes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-forest">
        Quizzes ({quizzes.length})
      </h3>

      {quizzes.map((q) => (
        <div key={q.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-forest">{q.title}</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge tone="neutral">Pass: {q.passing_score}%</Badge>
                <Badge tone="warning">Max attempts: {q.max_attempts}</Badge>
              </div>
            </div>
            {!activeQuiz || activeQuiz.id !== q.id ? (
              <Button size="sm" onClick={() => openQuiz(q.id)}>
                Take Quiz
              </Button>
            ) : null}
          </div>

          {/* Active quiz renderer */}
          {activeQuiz?.id === q.id && (
            <div className="mt-5 space-y-4 border-t border-line pt-5">
              {result ? (
                <div className={`rounded-lg p-4 ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                    {result.passed ? '✓ Passed!' : '✗ Not passed'}
                  </p>
                  <p className="mt-1 text-sm">
                    Score: {result.score}% (passing: {activeQuiz.passing_score}%)
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setResult(null);
                        setAnswers({});
                      }}
                    >
                      Try again
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveQuiz(null);
                        setResult(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {activeQuiz.questions?.map((question, qi) => (
                    <div key={question.id} className="rounded-lg border border-line bg-white p-4">
                      <p className="font-medium text-forest">
                        {qi + 1}. {question.prompt}
                      </p>
                      <div className="mt-3 space-y-2">
                        {question.choices.map((choice, ci) => (
                          <label
                            key={ci}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-forest-tint"
                          >
                            <input
                              type="checkbox"
                              checked={answers[question.id]?.includes(String(ci)) ?? false}
                              onChange={() => toggleAnswer(question.id, ci)}
                              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-ink">{choice}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveQuiz(null);
                        setAnswers({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={submitQuiz} disabled={submitting}>
                      {submitting ? 'Grading…' : 'Submit Quiz'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}