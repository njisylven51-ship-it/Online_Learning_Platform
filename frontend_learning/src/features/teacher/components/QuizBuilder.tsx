import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { quizService } from '../../quizzes/services/quizService';
import type { QuizQuestionPayload } from '../../quizzes/types';

interface QuizBuilderProps {
  lessonId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const emptyQuestion = (): QuizQuestionPayload => ({
  prompt: '',
  question_type: 'multiple_choice',
  choices: ['', '', '', ''],
  correct_answers: [], // stores INDICES as strings, e.g. ["0", "2"]
  points: 1,
  position: 0,
});

export function QuizBuilder({ lessonId, onComplete, onCancel }: QuizBuilderProps) {
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [questions, setQuestions] = useState<QuizQuestionPayload[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion(), position: questions.length }]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestionPayload, value: any) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    const newQs = [...questions];
    newQs[qIndex].choices[cIndex] = value;
    setQuestions(newQs);
  };

  /**
   * Toggle a choice at cIndex as a correct answer.
   * We store the INDEX (as a string) because the backend expects indices.
   */
  const toggleCorrectAnswer = (qIndex: number, cIndex: number) => {
    const newQs = [...questions];
    const q = newQs[qIndex];
    const indexStr = String(cIndex);
    
    if (q.correct_answers.includes(indexStr)) {
      q.correct_answers = q.correct_answers.filter(c => c !== indexStr);
    } else {
      q.correct_answers = [...q.correct_answers, indexStr];
    }
    setQuestions(newQs);
  };

  // A question is valid if:
  //  - prompt is filled
  //  - at least 2 non-empty choices exist
  //  - at least 1 correct answer index is checked
  function isValidQuestion(q: QuizQuestionPayload): boolean {
    const filledChoices = q.choices.filter(c => c.trim() !== '');
    return (
      q.prompt.trim().length > 0 &&
      filledChoices.length >= 2 &&
      q.correct_answers.length > 0
    );
  }

  const allQuestionsValid = questions.every(isValidQuestion);

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!isValidQuestion(q)) {
        setError(
          `Question ${i + 1} is incomplete: fill the prompt, add at least 2 options, and check the correct answer.`
        );
        return;
      }
    }

    setSaving(true);
    try {
      // Build a clean payload:
      //  - Filter out empty choices
      //  - Re-map correct answer indices to the new positions in the filtered choices array
      const cleanedQuestions = questions.map((q, i) => {
        const originalChoices = q.choices;
        // Keep track of which original indices had non-empty values
        const keptOriginalIndices: number[] = [];
        const cleanedChoices: string[] = [];
        
        originalChoices.forEach((choice, idx) => {
          if (choice.trim() !== '') {
            keptOriginalIndices.push(idx);
            cleanedChoices.push(choice.trim());
          }
        });
        
        // Map old indices → new indices
        const newCorrectIndices = q.correct_answers
          .map(oldIdxStr => keptOriginalIndices.indexOf(Number(oldIdxStr)))
          .filter(newIdx => newIdx !== -1)
          .map(newIdx => String(newIdx));

        return {
          prompt: q.prompt.trim(),
          question_type: 'multiple_choice' as const,
          choices: cleanedChoices,
          correct_answers: newCorrectIndices, // send as strings of new indices
          points: q.points,
          position: i,
        };
      });

      await quizService.createQuiz(lessonId, {
        title: title.trim(),
        passing_score: Number(passingScore),
        max_attempts: Number(maxAttempts),
        questions: cleanedQuestions,
      });

      alert('Quiz created successfully!');
      onComplete();
    } catch (e: any) {
      setError(e?.info?.message || 'Failed to create quiz.');
      console.error('Quiz create failed:', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-accent bg-accent-tint p-5">
      <h3 className="text-lg font-bold text-forest">Create a Quiz</h3>
      
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Passing Score (%)" type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
        <Input label="Max Attempts" type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} />
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-forest">Question {qIndex + 1}</h4>
              <Input 
                type="number" 
                value={q.points} 
                onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))} 
                className="w-24" 
                label="Points" 
              />
            </div>
            
            <Textarea 
              label="Question Prompt" 
              value={q.prompt} 
              onChange={(e) => updateQuestion(qIndex, 'prompt', e.target.value)} 
              rows={2} 
              className="mb-4" 
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-forest">
                Options (Check the correct answer)
              </label>
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    // FIXED: check by index, not by value
                    checked={q.correct_answers.includes(String(cIndex))} 
                    onChange={() => toggleCorrectAnswer(qIndex, cIndex)}
                    disabled={!choice.trim()}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <Input 
                    value={choice} 
                    onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)} 
                    placeholder={`Option ${cIndex + 1}`} 
                  />
                </div>
              ))}

              {q.correct_answers.length === 0 && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  ⚠️ Check the box next to at least one correct answer.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <Button variant="secondary" onClick={addQuestion}>+ Add Another Question</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !title.trim() || !allQuestionsValid}
          >
            {saving ? 'Saving…' : 'Save Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
}