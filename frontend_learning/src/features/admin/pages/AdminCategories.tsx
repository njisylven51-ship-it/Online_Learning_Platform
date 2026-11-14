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
    } catch { alert('Failed to create category.'); } 
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Course Categories" subtitle="Manage categories for the course catalogue." />
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 rounded-xl border border-line bg-white p-4 shadow-sm items-end">
        <div className="flex-1">
          <Input label="Category Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Web Development" />
        </div>
        <div className="flex-1">
          <Input label="Description" value={desc} onChange={e => setDesc(e.target.value)} placeholder="HTML, CSS, JS..." />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Category'}</Button>
      </form>

      {loading ? <LoadingState message="Loading categories..." /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map(c => (
            <div key={c.id} className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <h3 className="font-bold text-forest">{c.name}</h3>
              <p className="text-sm text-ink-muted">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}