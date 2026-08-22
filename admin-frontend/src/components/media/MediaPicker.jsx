/**
 * MediaPicker — modal that lets users browse the media library OR upload new files.
 *
 * Props:
 *   open        bool    Whether the modal is open
 *   onClose     fn      Called when the modal is dismissed
 *   onSelect    fn      Called with enriched media object when user picks an item
 *   folder      string  Pre-selected folder filter & upload destination
 *   accept      string  MIME filter for uploads
 *
 * Usage:
 *   <MediaPicker
 *     open={pickerOpen}
 *     onClose={() => setPickerOpen(false)}
 *     folder="hero"
 *     onSelect={(media) => {
 *       setForm(f => ({ ...f, image_id: media.id }));
 *       setPreviewUrl(media.full_url);
 *     }}
 *   />
 */
import { useState } from 'react';
import { X, Upload, Check, Loader2, Search, Image as ImageIcon } from 'lucide-react';
import { useMediaList, useMediaFolders, useUploadMedia } from '@/hooks/use-media';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

const cn = (...c) => c.filter(Boolean).join(' ');

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB = 10;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPicker({ open, onClose, onSelect, folder = 'general', accept = 'image/*' }) {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState(folder);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('library'); // 'library' | 'upload'

  const { data: foldersData = [] } = useMediaFolders();
  const { data: mediaData, isLoading } = useMediaList({
    page,
    page_size: 24,
    folder: activeFolder !== 'all' ? activeFolder : undefined,
    search: search || undefined,
  });

  const uploadMutation = useUploadMedia({
    onSuccess: (media) => {
      toast({ title: 'Image uploaded' });
      onSelect?.(media);
      onClose?.();
    },
    onError: (err) => handleApiError(err, toast),
  });

  const items = mediaData?.items ?? [];
  const total = mediaData?.total ?? 0;
  const totalPages = mediaData?.total_pages ?? 1;

  const handleConfirm = () => {
    if (!selected) return;
    onSelect?.(selected);
    onClose?.();
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'JPG, PNG, WebP or GIF only.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Max ${MAX_MB}MB.`, variant: 'destructive' });
      return;
    }
    uploadMutation.mutate({ file, folder: activeFolder !== 'all' ? activeFolder : folder });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground">Media Library</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setTab('library')}
                className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all', tab === 'library' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground')}
              >
                Browse
              </button>
              <button
                onClick={() => setTab('upload')}
                className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all', tab === 'upload' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground')}
              >
                Upload New
              </button>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {tab === 'library' ? (
          <div className="flex flex-1 min-h-0">
            {/* Folder sidebar */}
            <div className="w-44 shrink-0 border-r border-border p-3 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">Folders</p>
              <button
                onClick={() => { setActiveFolder('all'); setPage(1); }}
                className={cn('w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5', activeFolder === 'all' ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted')}
              >
                <span>All Files</span>
                <span className="text-xs">{total}</span>
              </button>
              {foldersData.map((f) => (
                <button
                  key={f.name}
                  onClick={() => { setActiveFolder(f.name); setPage(1); }}
                  className={cn('w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5', activeFolder === f.name ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted')}
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs shrink-0">{f.count}</span>
                </button>
              ))}
            </div>

            {/* Media grid */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Search bar */}
              <div className="px-4 py-3 border-b border-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No files found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                    {items.map((item) => {
                      const isSelected = selected?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelected(isSelected ? null : item)}
                          className={cn(
                            'group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-muted',
                            isSelected ? 'border-primary shadow-soft' : 'border-border hover:border-primary/40',
                          )}
                        >
                          <img src={item.full_url} alt={item.original_name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate">{item.original_name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
                  <p className="text-xs text-muted-foreground">{total} files</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload tab */
          <div className="flex-1 flex items-center justify-center p-8">
            <label className="flex flex-col items-center gap-4 w-full max-w-sm cursor-pointer">
              <div className={cn(
                'w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:border-primary/40',
                uploadMutation.isPending && 'opacity-60 pointer-events-none',
              )}>
                {uploadMutation.isPending ? (
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 opacity-40" />
                    <p className="text-sm font-medium">Click to browse files</p>
                    <p className="text-xs opacity-60">JPG, PNG, WebP, GIF · Max {MAX_MB}MB</p>
                  </>
                )}
              </div>
              <input type="file" accept={accept} className="hidden" onChange={handleFileInput} />
              <p className="text-xs text-muted-foreground">Uploading to folder: <span className="font-medium text-foreground">{activeFolder !== 'all' ? activeFolder : folder}</span></p>
            </label>
          </div>
        )}

        {/* Footer */}
        {tab === 'library' && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
            <div>
              {selected && (
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  Selected: <span className="font-medium text-foreground">{selected.original_name}</span>
                  {' · '}{formatBytes(selected.size)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Use Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
