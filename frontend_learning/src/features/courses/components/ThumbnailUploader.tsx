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

      // Append signed params
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-carbon">Course Thumbnail</label>
        {currentUrl && !uploading && (
          <button 
            type="button"
            onClick={handleDelete}
            className="text-xs font-semibold text-error hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      
      {uploading ? (
        /* Simple Loader State */
        <div className="flex h-12 items-center rounded-xl bg-surface-container-lowest border border-surface-container px-4">
          <LoadingState message="Uploading..." />
        </div>
      ) : currentUrl ? (
        /* Image Preview with clean overlay */
        <div className="relative overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest group">
          <img 
            src={currentUrl} 
            alt="Course Thumbnail" 
            className="aspect-video w-full object-cover transition-opacity group-hover:opacity-50" 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="rounded-lg bg-white/90 text-carbon shadow-sm backdrop-blur-sm hover:bg-white"
            >
              Replace Image
            </Button>
          </div>
        </div>
      ) : (
        /* Simple dashed line for empty state */
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-outline-variant/50 bg-transparent transition-colors hover:border-primary hover:bg-surface-container-lowest"
        >
          <p className="text-sm font-medium text-on-surface-variant">Click to upload (16:9 recommended)</p>
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