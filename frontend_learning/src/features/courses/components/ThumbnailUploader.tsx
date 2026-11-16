import { useRef, useState } from 'react';
import { courseService } from '../../courses/services/courseService';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/feedback/LoadingState';

interface ThumbnailUploaderProps {
  courseId: string;
  currentUrl: string | null | undefined;
  onUpdate: (newUrl: string | null) => void;
}

export function ThumbnailUploader({ courseId, currentUrl, onUpdate }: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploading(true);
    try {
      // 1. Get signature
      const sig = await courseService.getThumbnailSignature();
      
      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      if (sig.api_key) formData.append('api_key', sig.api_key);
      if (sig.signature) formData.append('signature', sig.signature);

      // Append signed params (skip signature, api_key, cloud_name, upload_url, public_id)
      Object.keys(sig).forEach((key) => {
        if (!['signature', 'api_key', 'cloud_name', 'upload_url', 'public_id'].includes(key)) {
          const value = (sig as any)[key];
          if (value !== undefined && value !== null) formData.append(key, String(value));
        }
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;
      const cloudRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!cloudRes.ok) throw new Error('Failed to upload image to Cloudinary');
      const cloudData = await cloudRes.json();

      // 3. Confirm with backend
      const result = await courseService.confirmThumbnail(courseId, cloudData.public_id);
      
      // 4. Update parent state
      onUpdate(result.thumbnail_url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upload thumbnail.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove the course thumbnail?')) return;
    setUploading(true);
    try {
      await courseService.deleteThumbnail(courseId);
      onUpdate(null);
    } catch (error) {
      alert('Failed to delete thumbnail.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-carbon">Course Thumbnail</label>
      
      {uploading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-surface-container bg-surface-container-lowest">
          <LoadingState message="Uploading image..." />
        </div>
      ) : currentUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest group">
          <img src={currentUrl} alt="Course Thumbnail" className="aspect-video w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-carbon/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Button onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-white text-carbon hover:bg-gray-200">Replace</Button>
            <Button onClick={handleDelete} className="rounded-lg bg-error text-white hover:bg-error/90">Delete</Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container bg-primary-container/10 transition hover:bg-primary-container/20"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-carbon">Click to upload a thumbnail</p>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">Recommended: 1280x720 (16:9 ratio)</p>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  );
}