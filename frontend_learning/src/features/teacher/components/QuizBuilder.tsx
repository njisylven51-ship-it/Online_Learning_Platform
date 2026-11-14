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
  correct_answers: [],
  points: 1,
  position: 0,
});

export function QuizBuilder({ lessonId, onComplete, onCancel }: QuizBuilderProps) {
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [questions, setQuestions] = useState<QuizQuestionPayload[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

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

  const toggleCorrectAnswer = (qIndex: number, choiceValue: string) => {
    const newQs = [...questions];
    const q = newQs[qIndex];
    const current = q.correct_answers;
    
    if (current.includes(choiceValue)) {
      q.correct_answers = current.filter(c => c !== choiceValue);
    } else {
      q.correct_answers = [...current, choiceValue];
    }
    setQuestions(newQs);
  };

  async function handleSave() {
    setSaving(true);
    try {
      await quizService.createQuiz(lessonId, {
        title,
        passing_score: Number(passingScore),
        max_attempts: Number(maxAttempts),
        questions,
      });
      alert('Quiz created successfully!');
      onComplete();
    } catch (e) {
      alert('Failed to create quiz.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-accent bg-accent-tint p-5">
      <h3 className="text-lg font-bold text-forest">Create a Quiz</h3>
      
      {/* Quiz Settings */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Passing Score (%)" type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
        <Input label="Max Attempts" type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} />
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-forest">Question {qIndex + 1}</h4>
              <Input type="number" value={q.points} onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))} className="w-24" label="Points" />
            </div>
            
            <Textarea 
              label="Question Prompt" 
              value={q.prompt} 
              onChange={(e) => updateQuestion(qIndex, 'prompt', e.target.value)} 
              rows={2} 
              className="mb-4" 
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-forest">Options (Select the correct answer)</label>
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={q.correct_answers.includes(choice) && choice !== ''} 
                    onChange={() => toggleCorrectAnswer(qIndex, choice)}
                    disabled={choice === ''}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <Input 
                    value={choice} 
                    onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)} 
                    placeholder={`Option ${cIndex + 1}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <Button variant="secondary" onClick={addQuestion}>+ Add Another Question</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !title}>
            {saving ? 'Saving…' : 'Save Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
}