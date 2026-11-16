import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCourse } from '../hooks/useCreateCourse';
import { useCategories } from '../../courses/hooks/useCategories';
import { courseService } from '../../courses/services/courseService';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base || 'course'}-${randomSuffix}`;
}

const STEPS = [
  { id: 1, title: 'Identity', desc: 'Title & Summary' },
  { id: 2, title: 'Details', desc: 'Category & Pricing' },
  { id: 3, title: 'Curriculum', desc: 'First Module' },
  { id: 4, title: 'Cover', desc: 'Thumbnail' },
];

export default function CreateCourse() {
  const navigate = useNavigate();
  const { create, loading, error } = useCreateCourse();
  const { data: categories, loading: catLoading, error: catError } = useCategories();

  const [currentStep, setCurrentStep] = useState(1);

  // Course State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);

  // Thumbnail State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Curriculum State (Optional)
  const [includeCurriculum, setIncludeCurriculum] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');

  function processImageFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    processImageFile(e.target.files?.[0]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  }

  async function uploadThumbnailToCloudinary(courseId: string, file: File) {
    try {
      setUploadingThumbnail(true);
      const sig = await courseService.getThumbnailSignature();

      const formData = new FormData();
      formData.append('file', file);
      if (sig.api_key) formData.append('api_key', sig.api_key);
      if (sig.signature) formData.append('signature', sig.signature);

      Object.keys(sig).forEach((key) => {
        if (!['signature', 'api_key', 'cloud_name', 'upload_url', 'public_id'].includes(key)) {
          const value = (sig as any)[key];
          if (value !== undefined && value !== null) formData.append(key, String(value));
        }
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;
      const cloudRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!cloudRes.ok) throw new Error('Failed to upload image');

      const cloudData = await cloudRes.json();
      await courseService.confirmThumbnail(courseId, cloudData.public_id);
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      alert('Course created, but thumbnail upload failed. You can add it on the next screen.');
    } finally {
      setUploadingThumbnail(false);
    }
  }

  async function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault();
    if (currentStep !== 4) {
      nextStep();
      return;
    }

    const slug = generateSlug(title);
    const finalPrice = isFree ? 0 : Math.max(0, Number(price));

    const payload: any = {
      title: title.trim(),
      slug,
      description: description.trim(),
      level,
      price_xaf: finalPrice,
    };

    if (categoryId) {
      payload.category_id = categoryId;
    }

    try {
      const newCourse = await create(payload);

      if (thumbnailFile) {
        await uploadThumbnailToCloudinary(newCourse.id, thumbnailFile);
      }

      if (includeCurriculum && moduleTitle.trim()) {
        const newModule = await courseService.createModule(newCourse.id, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim() || 'No description provided.',
          position: 0,
        });

        if (lessonTitle.trim()) {
          await courseService.createLesson(newModule.id, {
            title: lessonTitle.trim(),
            content: lessonContent.trim(),
            position: 0,
            youtube_url: lessonYoutubeUrl.trim() || null,
          });
        }
      }

      navigate(`/teacher/courses/${newCourse.id}/edit`);
    } catch {
      // Error handled by useCreateCourse hook
    }
  }

  function nextStep() {
    if (currentStep === 1 && (!isTitleValid || !isDescriptionValid)) return;
    if (currentStep === 2 && !isFree && (!price || Number(price) <= 0)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const selectedCategoryName =
    categories?.find((c) => c.id === categoryId)?.name || 'Uncategorized';

  const isLoading = loading || uploadingThumbnail;
  const isTitleValid = title.trim().length >= 3;
  const isDescriptionValid = description.trim().length >= 10;
  
  // Validation for current step
  const canProceed = 
    currentStep === 1 ? (isTitleValid && isDescriptionValid) :
    currentStep === 2 ? (isFree || Number(price) > 0) :
    true;

  const formattedPrice =
    isFree || Number(price) === 0
      ? 'Free'
      : `${Number(price || 0).toLocaleString()} XAF`;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full pb-28">
      {/* Top Breadcrumb & Header */}
      <div className="mb-8 space-y-4">
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-2 rounded-full border border-surface-container bg-surface-container-lowest px-4 py-1.5 text-xs font-extrabold text-on-surface-variant transition hover:border-primary-container hover:text-primary"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to My Courses</span>
        </Link>

        <PageHeader
          title="Create a New Course"
          subtitle="Craft your course identity, set pricing, and optionally launch with your first module."
        />
      </div>

      <div className="grid w-full items-start gap-8 xl:grid-cols-12">
        
        {/* LEFT COLUMN: Wizard Steps */}
        <div className="space-y-6 xl:col-span-8">
          
          {/* Step Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-2 shadow-sm">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    // Only allow going back, or forward if the current step is valid
                    if (step.id < currentStep) setCurrentStep(step.id);
                    else if (step.id > currentStep && canProceed) setCurrentStep(step.id);
                  }}
                  className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : isCompleted
                        ? 'bg-surface-container/50 text-carbon hover:bg-surface-container'
                        : 'text-on-surface-variant opacity-60 hover:bg-surface-container/50'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      isActive
                        ? 'bg-carbon text-white'
                        : isCompleted
                          ? 'bg-primary text-white'
                          : 'border border-outline-variant bg-white'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-extrabold">{step.title}</p>
                    <p className="text-[11px] font-medium opacity-80">{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          <form id="create-course-form" onSubmit={handleSubmit} className="w-full">
            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] duration-300 sm:p-8">
                <div className="mb-6 flex items-start gap-4 border-b border-surface-container pb-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-sm font-black text-on-primary-container">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">Course Identity</h2>
                    <p className="mt-0.5 text-sm font-medium text-on-surface-variant">
                      Give your course a clear title and compelling summary for the catalog.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Input
                      id="title"
                      label="Course Title"
                      placeholder="e.g. Complete Python Bootcamp: Zero to Hero"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={3}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className={title.length > 0 && !isTitleValid ? 'font-bold text-error' : 'text-outline'}>
                        {title.length > 0 && !isTitleValid
                          ? 'Title must be at least 3 characters'
                          : 'Make it specific and outcome-focused'}
                      </span>
                      <span className="font-semibold text-outline">{title.length} chars</span>
                    </div>
                  </div>

                  <div>
                    <Textarea
                      id="description"
                      label="Course Description"
                      placeholder="Outline what students will build, key concepts covered, and who this course is for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={5}
                      disabled={isLoading}
                      minLength={10}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span
                        className={
                          description.length > 0 && !isDescriptionValid ? 'font-bold text-error' : 'text-outline'
                        }
                      >
                        {description.length > 0 && !isDescriptionValid
                          ? `${10 - description.trim().length} more characters required`
                          : 'Minimum 10 characters'}
                      </span>
                      <span className="font-semibold text-outline">{description.trim().length} chars</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: DETAILS & PRICING */}
            {currentStep === 2 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] duration-300 sm:p-8">
                <div className="mb-6 flex items-start gap-4 border-b border-surface-container pb-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-sm font-black text-on-primary-container">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">Audience & Pricing</h2>
                    <p className="mt-0.5 text-sm font-medium text-on-surface-variant">
                      Help students filter your course by topic, skill level, and enrollment price.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      {catLoading ? (
                        <div className="animate-pulse">
                          <div className="mb-2 h-4 w-20 rounded bg-surface-container" />
                          <div className="h-12 w-full rounded-lg bg-surface-container" />
                        </div>
                      ) : catError ? (
                        <div className="rounded-lg border border-error-container bg-error-container/50 p-3 text-xs font-bold text-error">
                          Failed to load categories.
                        </div>
                      ) : (
                        <Select
                          id="category"
                          label="Category"
                          placeholder={categoryOptions.length === 0 ? 'No categories available' : 'Select a category'}
                          options={categoryOptions}
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          disabled={isLoading || categoryOptions.length === 0}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-800">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-2 rounded-xl border border-surface-container bg-surface-container/40 p-1">
                        {[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                        ].map((opt) => {
                          const active = level === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isLoading}
                              onClick={() => setLevel(opt.value)}
                              className={`rounded-lg py-2.5 text-xs font-extrabold transition-all ${
                                active
                                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                                  : 'text-on-surface-variant hover:text-slate-800'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {!catLoading && !catError && categoryOptions.length === 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-tertiary-container bg-tertiary-container/30 p-4 text-xs font-bold text-on-tertiary-container">
                      <span>⚠️</span>
                      <span>
                        No categories exist yet. You can still create this course, though it won&apos;t appear under category filters.
                      </span>
                    </div>
                  )}

                  <div className="rounded-xl border border-surface-container bg-surface-container/25 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Enrollment Access</p>
                        <p className="text-xs font-medium text-on-surface-variant">
                          Choose whether students can enroll for free or pay a one-time fee.
                        </p>
                      </div>

                      <div className="inline-flex rounded-full border border-surface-container bg-white p-1">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setIsFree(true);
                            setPrice('0');
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                            isFree ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-slate-800'
                          }`}
                        >
                          Free Course
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setIsFree(false);
                            if (price === '0') setPrice('5000');
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                            !isFree ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-slate-800'
                          }`}
                        >
                          Paid (XAF)
                        </button>
                      </div>
                    </div>

                    {!isFree && (
                      <div className="mt-5 border-t border-surface-container pt-5">
                        <Input
                          id="price"
                          label="Course Price (XAF)"
                          type="number"
                          min="0"
                          step="100"
                          placeholder="e.g. 10000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          disabled={isLoading}
                          hint="Students will pay this amount in Central African CFA franc (XAF) to unlock full access."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3: CURRICULUM */}
            {currentStep === 3 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] duration-300 sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-sm font-black text-on-primary-container">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">Initial Curriculum</h2>
                        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                          Optional
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-on-surface-variant">
                        Kickstart your syllabus with Module 1 and its opening lesson right away.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIncludeCurriculum((prev) => !prev)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      includeCurriculum
                        ? 'border border-surface-container bg-white text-slate-800 hover:bg-surface-container'
                        : 'bg-primary-container text-on-primary-container hover:bg-primary-container/80'
                    }`}
                  >
                    {includeCurriculum ? (
                      <span>Hide Curriculum Builder</span>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Add First Module</span>
                      </>
                    )}
                  </button>
                </div>

                {includeCurriculum && (
                  <div className="mt-6 space-y-5 border-t border-surface-container pt-6">
                    <div className="rounded-xl border border-surface-container bg-surface-container/20 p-5 sm:p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                          Module 01
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Module Title"
                          placeholder="e.g. Getting Started & Environment Setup"
                          value={moduleTitle}
                          onChange={(e) => setModuleTitle(e.target.value)}
                          disabled={isLoading}
                        />
                        <Textarea
                          label="Module Description"
                          placeholder="Summarize what students will achieve in this module..."
                          value={moduleDesc}
                          onChange={(e) => setModuleDesc(e.target.value)}
                          rows={2}
                          disabled={isLoading}
                        />
                      </div>

                      {moduleTitle.trim() && (
                        <div className="mt-6 border-t border-surface-container pt-6">
                          <div className="mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-secondary" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-secondary">
                              Lesson 1.1 (Optional)
                            </h4>
                          </div>

                          <div className="space-y-4">
                            <Input
                              label="Lesson Title"
                              placeholder="e.g. Welcome & Course Overview"
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                              disabled={isLoading}
                            />

                            {lessonTitle.trim() && (
                              <>
                                <Textarea
                                  label="Lesson Notes / Content"
                                  placeholder="Write key takeaways, reading material, or exercise instructions..."
                                  value={lessonContent}
                                  onChange={(e) => setLessonContent(e.target.value)}
                                  rows={3}
                                  disabled={isLoading}
                                />
                                <Input
                                  label="YouTube Video URL (Optional)"
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  value={lessonYoutubeUrl}
                                  onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                                  disabled={isLoading}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* STEP 4: THUMBNAIL */}
            {currentStep === 4 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)] duration-300 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-2 border-b border-surface-container pb-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-sm font-black text-on-primary-container">
                      4
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">Course Thumbnail</h2>
                      <p className="mt-0.5 text-sm font-medium text-on-surface-variant">
                        Upload a high-contrast cover image for the course catalog.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                    1280 × 720 (16:9)
                  </span>
                </div>

                {thumbnailPreview ? (
                  <div className="flex flex-col gap-5 rounded-xl border border-surface-container bg-surface-container/25 p-4 sm:flex-row sm:items-center">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-surface-container sm:w-64">
                      <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 text-[11px] font-extrabold text-on-secondary-container">
                          Ready to upload
                        </span>
                        <p className="mt-1.5 truncate text-sm font-extrabold text-slate-800">
                          {thumbnailFile?.name}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                          Will be uploaded automatically as soon as your course is created.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="rounded-full border border-surface-container bg-white px-4 py-1.5 text-xs font-extrabold text-slate-800 transition hover:bg-surface-container"
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          disabled={isLoading}
                          className="rounded-full px-4 py-1.5 text-xs font-extrabold text-error transition hover:bg-error-container/50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                      isDragging
                        ? 'border-primary bg-surface-container/60'
                        : 'border-outline-variant bg-surface-container/20 hover:border-primary hover:bg-surface-container/40'
                    }`}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-extrabold text-slate-800">
                      Drag & drop your cover image here, or <span className="underline">browse files</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">
                      PNG, JPG, or WebP · Optional (you can add or change it anytime)
                    </p>
                  </div>
                )}

                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              </section>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mt-6 rounded-xl border border-error-container bg-error-container p-5">
                <p className="text-sm font-extrabold text-on-error-container">Failed to create course</p>
                <p className="mt-1 text-sm text-on-error-container">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: Sticky Live Catalog Card Preview (Always visible) */}
        <aside className="space-y-6 xl:sticky xl:top-6 xl:col-span-4">
          <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(18,18,20,0.03)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                Live Catalog Preview
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-container px-2.5 py-0.5 text-[11px] font-extrabold text-on-tertiary-container">
                Draft
              </span>
            </div>

            {/* Simulated Course Card */}
            <div className="overflow-hidden rounded-xl border border-surface-container bg-white shadow-sm">
              <div className="relative aspect-video w-full bg-surface-container">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Course card preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-outline">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold">No thumbnail uploaded</span>
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-primary-container px-3 py-1 text-[11px] font-extrabold capitalize text-on-primary-container shadow-sm backdrop-blur-sm">
                  {level}
                </span>
              </div>

              <div className="space-y-3 p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  {selectedCategoryName}
                </div>
                <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-800">
                  {title.trim() || 'Your Course Title Appears Here'}
                </h3>
                <p className="line-clamp-3 text-xs leading-relaxed text-on-surface-variant">
                  {description.trim() || 'Your course summary will appear here so students know exactly what they will learn.'}
                </p>
                <div className="flex items-center justify-between border-t border-surface-container pt-3.5">
                  <span className="text-base font-black text-slate-800">{formattedPrice}</span>
                  {includeCurriculum && moduleTitle.trim() && (
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                      1 Module Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="mt-6 space-y-2.5 border-t border-surface-container pt-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                Launch Checklist
              </p>
              {[
                { label: 'Course title (3+ chars)', done: isTitleValid },
                { label: 'Description (10+ chars)', done: isDescriptionValid },
                { label: 'Cover thumbnail attached', done: !!thumbnailFile, optional: true },
                { label: 'First module drafted', done: includeCurriculum && !!moduleTitle.trim(), optional: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                      item.done ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant bg-white text-transparent'
                    }`}>
                      ✓
                    </span>
                    <span className={item.done ? 'font-bold text-slate-800' : 'font-medium text-on-surface-variant'}>
                      {item.label}
                    </span>
                  </div>
                  {item.optional && <span className="text-[11px] font-semibold text-outline">Optional</span>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-container bg-white/90 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex w-full flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <p className="hidden text-xs font-medium text-on-surface-variant sm:block">
            {currentStep === 4
              ? 'Ready to launch! Your course will be created and you will be taken to the editor.'
              : 'Complete this step to continue to the next one.'}
          </p>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={isLoading}
                className="rounded-full px-6 font-bold text-on-surface-variant hover:bg-surface-container"
              >
                Back
              </Button>
            )}
            
            {currentStep === 4 ? (
              <Button
                type="submit"
                form="create-course-form"
                disabled={isLoading || !isTitleValid || !isDescriptionValid}
                className="rounded-full bg-primary px-8 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-50"
              >
                {uploadingThumbnail ? 'Uploading Thumbnail…' : loading ? 'Creating Course…' : 'Create Course & Launch'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className="rounded-full bg-primary px-8 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-50"
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}