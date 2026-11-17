import { useState, type FormEvent } from 'react';
import { useCategories } from '../../courses/hooks/useCategories';
import { adminService } from '../services/adminService';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/feedback/LoadingState';

export default function AdminCategories() {
  const { data: categories, loading, refetch } = useCategories();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.createCategory(name, desc);
      setName(''); setDesc('');
      await refetch();
      alert('Category created!');
    } catch { 
      alert('Failed to create category.'); 
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="mx-auto space-y-8 pb-8">
      <PageHeader 
        title="Course Categories" 
        subtitle="Manage the categories used to filter the course catalogue." 
      />
      
      {/* Add Category Form */}
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-5 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.04)] sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input 
            label="Category Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="e.g. Web Development" 
            disabled={saving}
          />
        </div>
        <div className="flex-1">
          <Input 
            label="Description (Optional)" 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            placeholder="HTML, CSS, JavaScript..." 
            disabled={saving}
          />
        </div>
        <Button 
          type="submit" 
          disabled={saving}
          className="rounded-lg bg-carbon px-8 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-carbon-light"
        >
          {saving ? 'Saving...' : 'Add Category'}
        </Button>
      </form>

      {/* Categories List */}
      {loading ? (
        <LoadingState message="Loading categories..." />
      ) : !categories || categories.length === 0 ? (
        // Blended Empty State
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-carbon">No categories yet</h3>
          <p className="mt-2 text-on-surface-variant">Create your first category to help organize the course catalogue.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <div 
              key={c.id} 
              className="rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-extrabold text-carbon">{c.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-on-surface-variant">
                {c.description || 'No description provided.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}