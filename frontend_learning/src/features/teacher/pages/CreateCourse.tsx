import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCourse } from '../hooks/useCreateCourse';
import { useCategories } from '../../courses/hooks/useCategories';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

// Helper to auto-generate a safe, unique slug
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces and symbols with hyphens
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
  
  // Add a random 6-character string to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base || 'course'}-${randomSuffix}`;
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const { create, loading, error } = useCreateCourse();
  const { data: categories, loading: catLoading, error: catError } = useCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('0');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // 1. Generate the slug from the title
    const slug = generateSlug(title);

    // 2. Build the payload
    const payload: any = {
      title: title.trim(),
      slug: slug, // <-- ENSURE THIS IS INCLUDED
      description: description.trim(),
      level,
      price_xaf: Math.max(0, Number(price)),
    };

    if (categoryId) {
      payload.category_id = categoryId;
    }

    try {
      const newCourse = await create(payload);
      navigate(`/teacher/courses/${newCourse.id}/edit`);
    } catch {
      // Error handled by hook
    }
  }

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Create a New Course"
        subtitle="Start with the basics. You will add modules and lessons next."
      />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-line bg-white p-6 shadow-sm">
        <Input
          id="title"
          label="Course Title"
          placeholder="e.g. Introduction to Python"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />

        <Textarea
          id="description"
          label="Course Description"
          placeholder="What will students learn?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            {catLoading ? (
              <div className="animate-pulse">
                <div className="mb-1 h-4 w-16 rounded bg-gray-200" />
                <div className="h-10 w-full rounded-lg bg-gray-200" />
              </div>
            ) : catError ? (
              <div className="text-sm text-red-600">Failed to load categories.</div>
            ) : (
              <Select
                id="category"
                label="Category"
                placeholder={
                  categoryOptions.length === 0
                    ? "No categories available"
                    : "Select a category"
                }
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading || categoryOptions.length === 0}
              />
            )}
          </div>

          <Select
            id="level"
            label="Difficulty Level"
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={loading}
          />
        </div>

        <Input
          id="price"
          label="Price (XAF)"
          type="number"
          min="0"
          placeholder="0 for free"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          disabled={loading}
          hint="Set to 0 to make this course free."
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Failed to create course:</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/teacher/courses')} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !title.trim() || !description.trim()}>
            {loading ? 'Creating…' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}