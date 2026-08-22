/**
 * MediaUploader — reusable drag-and-drop / click-to-upload component.
 *
 * Props:
 *   folder        string   Target folder (e.g. 'hero', 'collections'). Default: 'general'
 *   module        string   Optional folder prefix, combined with section
 *   section       string   Optional folder suffix, combined with module
 *   accept        string   MIME type filter. Default: 'image/*'
 *   maxSizeMB     number   Max file size in MB. Default: 10
 *   value         string   Currently selected media full_url (for preview)
 *   mediaId       string   Currently selected media ID
 *   media         object   Currently selected media record for metadata preview
 *   onChange      fn       Called with { id, full_url, ...media } after successful upload
 *   onClear       fn       Called when the user removes the current image
 *   disabled      bool
 *   aspectClass   string   Tailwind aspect ratio class. Default: 'aspect-video'
 *   label         string   Optional label shown in the empty state
 *   hint          string   Optional hint text below the upload zone
 */
import { useRef, useState } from 'react';
import { Upload, X, Loader2, FileVideo } from 'lucide-react';
import { useUploadMedia } from '@/hooks/use-media';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

const cn = (...c) => c.filter(Boolean).join(' ');

const DEFAULT_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_ACCEPT_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

function formatBytes(bytes) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export default function MediaUploader({
  folder = 'general',
  module,
  section,
  accept = 'image/*',
  maxSizeMB = 10,
  value,          // preview URL
  mediaId,        // current media ID (for display only)
  media,          // current media record for display metadata
  onChange,       // (media: { id, full_url, ... }) => void
  onClear,        // () => void
  disabled = false,
  aspectClass = 'aspect-video',
  label,
  hint,
}) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const uploadMutation = useUploadMedia({
    onSuccess: (media) => {
      onChange?.(media);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const isPending = uploadMutation.isPending;
  const targetFolder = module && section ? `${module}/${section}` : folder;
  const isVideo = accept.includes('video') || media?.media_type === 'video' || media?.mime_type?.startsWith('video/');
  const buttonNoun = isVideo ? 'Video' : 'Image';
  const fileName = media?.original_name || media?.filename || (mediaId ? `Media ${mediaId.slice(0, 8)}` : null);
  const fileSize = formatBytes(media?.size);
  const duration = formatDuration(media?.duration);

  const handleFile = (file) => {
    if (!file) return;

    const accepted = isVideo ? VIDEO_ACCEPT_TYPES : DEFAULT_ACCEPT_TYPES;
    if (!accepted.includes(file.type) && accept !== '*/*') {
      toast({
        title: 'Invalid file type',
        description: isVideo ? 'Please upload MP4, MOV, or WebM.' : 'Please upload JPG, PNG, WebP, or GIF.',
        variant: 'destructive',
      });
      return;
    }

    // Size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum size is ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({ file, folder: targetFolder });
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || isPending) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <div
        onClick={() => !disabled && !isPending && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
          aspectClass,
          dragging ? 'border-primary bg-primary/5' : 'border-dashed border-border hover:border-primary/40',
          (disabled || isPending) && 'cursor-not-allowed opacity-60',
        )}
      >
        {value ? (
          <>
            {isVideo ? (
              <div className="w-full h-full bg-slate-950 text-white flex flex-col items-center justify-center gap-3 p-4 text-center">
                <FileVideo className="w-8 h-8 opacity-80" />
                <div className="min-w-0 max-w-full">
                  <p className="text-xs font-medium truncate">{fileName || 'Selected video'}</p>
                  {(fileSize || duration) && (
                    <p className="mt-1 text-[11px] text-white/65">
                      {[fileSize, duration].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <img
                src={value}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
            )}
            {/* Clear button */}
            {onClear && !disabled && !isPending && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {isVideo ? <FileVideo className="w-8 h-8 opacity-40" /> : <Upload className="w-8 h-8 opacity-40" />}
            <p className="text-xs font-medium">{label || (isVideo ? 'Upload video' : 'Upload image')}</p>
            <p className="text-[11px] opacity-60">Drag & drop or click to browse</p>
          </div>
        )}

        {/* Upload progress overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Replace / Upload button */}
      <button
        type="button"
        onClick={() => !disabled && !isPending && inputRef.current?.click()}
        disabled={disabled || isPending}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
        ) : (
          <><Upload className="w-4 h-4" /> {value ? `Replace ${buttonNoun}` : `Upload New ${buttonNoun}`}</>
        )}
      </button>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || isPending}
      />
    </div>
  );
}
