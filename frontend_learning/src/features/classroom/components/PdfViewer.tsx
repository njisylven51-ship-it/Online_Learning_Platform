interface PdfViewerProps {
  url: string;
  title?: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-forest-tint px-4 py-2">
        <span className="text-sm font-medium text-forest">{title || 'Document'}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-accent hover:underline"
        >
          Open in new tab ↗
        </a>
      </div>
      <object
        data={url}
        type="application/pdf"
        className="h-[600px] w-full"
        aria-label={title || 'PDF document'}
      >
        <p className="p-4 text-sm text-ink-muted">
          Your browser does not support PDFs.{' '}
          <a href={url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Download the PDF
          </a>
          .
        </p>
      </object>
    </div>
  );
}