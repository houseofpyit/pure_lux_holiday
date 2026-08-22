/**
 * MediaLibrary — full media management page.
 *
 * Connected to real backend via:
 *   useMediaList → MediaService.list() → GET /api/v1/media
 *   useMediaFolders → MediaService.getFolders() → GET /api/v1/media/folders
 *   useUploadMedia → MediaService.upload() → POST /api/v1/media/upload
 *   useBulkDeleteMedia → MediaService.bulkDelete() → POST /api/v1/media/bulk-delete
 *   useDeleteMedia → MediaService.delete() → DELETE /api/v1/media/:id
 */
import { useRef, useState } from 'react';
import {
  Grid,
  List,
  FolderPlus,
  Upload,
  Search,
  Folder,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Film,
  FileText,
  MoreHorizontal,
  X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useMediaList,
  useMediaFolders,
  useUploadMedia,
  useDeleteMedia,
  useBulkDeleteMedia,
} from '@/hooks/use-media';

const cn = (...c) => c.filter(Boolean).join(' ');

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf'];
const MAX_MB = 10;

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaTypeIcon({ mediaType, className = 'w-8 h-8' }) {
  if (mediaType === 'video') return <Film className={cn(className, 'text-blue-400')} />;
  if (mediaType === 'document') return <FileText className={cn(className, 'text-orange-400')} />;
  return <ImageIcon className={cn(className, 'text-muted-foreground/40')} />;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const uploadInputRef = useRef(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [view, setView] = useState('grid');
  const [selected, setSelected] = useState([]);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState(null); // for side panel / preview

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: foldersData = [], isLoading: foldersLoading } = useMediaFolders();

  const listParams = {
    page,
    page_size: 24,
    folder: activeFolder !== 'all' ? activeFolder : undefined,
    search: search || undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
  };
  const { data: mediaData, isLoading: mediaLoading, isError, error } = useMediaList(listParams);

  const items = mediaData?.items ?? [];
  const total = mediaData?.total ?? 0;
  const totalPages = mediaData?.total_pages ?? 1;

  // ── Mutations ───────────────────────────────────────────────────────────────
  const uploadMutation = useUploadMedia({
    onSuccess: (media) => {
      toast({ title: 'File uploaded', description: media.original_name });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteMedia({
    onSuccess: () => {
      toast({ title: 'File deleted' });
      setSelected([]);
      setDetailItem(null);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const bulkDeleteMutation = useBulkDeleteMedia({
    onSuccess: (result) => {
      toast({ title: `${result.success_count} file${result.success_count !== 1 ? 's' : ''} deleted` });
      setSelected([]);
    },
    onError: (err) => handleApiError(err, toast),
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Maximum size is ${MAX_MB}MB.`, variant: 'destructive' });
      return;
    }

    const targetFolder = activeFolder !== 'all' ? activeFolder : 'general';
    uploadMutation.mutate({ file, folder: targetFolder });
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.full_url).then(() =>
      toast({ title: 'URL copied' })
    );
  };

  const handleFolderChange = (folderName) => {
    setActiveFolder(folderName);
    setPage(1);
    setSelected([]);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hidden upload input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleUploadFile}
      />

      <PageHeader
        title="Media Library"
        description="Upload, organize, and manage your media assets"
        searchPlaceholder="Search media files..."
        onSearch={handleSearchChange}
        onAdd={() => uploadInputRef.current?.click()}
        addLabel="Upload Media"
        actions={
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            onClick={() => toast({ title: 'Folders are auto-created on upload.' })}
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Folders</span>
          </button>
        }
      />

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-4 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-primary">{selected.length} file{selected.length !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected([])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Deselect
            </button>
            <button
              onClick={() => bulkDeleteMutation.mutate(selected)}
              disabled={bulkDeleteMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive bg-white border border-border rounded-lg hover:bg-destructive/5 transition-colors disabled:opacity-60"
            >
              {bulkDeleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Folders sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-foreground mb-3">Folders</h3>
            <div className="space-y-0.5">
              <button
                onClick={() => handleFolderChange('all')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  activeFolder === 'all' ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="flex items-center gap-2"><Folder className="w-4 h-4" /> All Files</span>
                <span className="text-xs">{total}</span>
              </button>

              {foldersLoading ? (
                <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
              ) : (
                foldersData.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => handleFolderChange(f.name)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      activeFolder === f.name ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="text-xs shrink-0">{f.count}</span>
                  </button>
                ))
              )}
            </div>

            {/* Upload drop zone */}
            <div
              onClick={() => uploadInputRef.current?.click()}
              className="mt-4 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer relative"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin mb-2" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-xs font-medium text-foreground">
                {uploadMutation.isPending ? 'Uploading…' : 'Drag & drop or click'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                to {activeFolder !== 'all' ? activeFolder : 'general'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Media grid/list ── */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-xl p-4">
            {/* View toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {mediaLoading ? 'Loading…' : `${total} file${total !== 1 ? 's' : ''} in ${activeFolder === 'all' ? 'All Folders' : activeFolder}`}
              </p>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setView('grid')}
                  className={cn('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground')}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-white shadow-soft text-primary' : 'text-muted-foreground')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error */}
            {isError && (
              <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error?.message || 'Failed to load media'}</p>
              </div>
            )}

            {/* Loading skeleton */}
            {mediaLoading && !isError && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!mediaLoading && !isError && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">No files found</p>
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="mt-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upload First File
                </button>
              </div>
            )}

            {/* Grid view */}
            {!mediaLoading && !isError && items.length > 0 && view === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      'group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
                      selected.includes(item.id) ? 'border-primary shadow-soft' : 'border-border hover:border-primary/30',
                    )}
                  >
                    <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                      {item.media_type === 'image' ? (
                        <img src={item.full_url} alt={item.original_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <MediaTypeIcon mediaType={item.media_type} className="w-10 h-10" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">{item.original_name}</p>
                      <p className="text-[11px] text-muted-foreground">{formatBytes(item.size)}</p>
                    </div>
                    {selected.includes(item.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyUrl(item); }}
                        className="p-1.5 rounded-lg bg-white/90 shadow-soft hover:bg-white"
                        title="Copy URL"
                      >
                        <Copy className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                        className="p-1.5 rounded-lg bg-white/90 shadow-soft hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List view */}
            {!mediaLoading && !isError && items.length > 0 && view === 'list' && (
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                      selected.includes(item.id) ? 'bg-primary/5' : 'hover:bg-muted/50',
                    )}
                  >
                    <div className="w-4 h-4 rounded border-2 border-border flex items-center justify-center shrink-0">
                      {selected.includes(item.id) && <Check className="w-3 h-3 text-primary" strokeWidth={3} />}
                    </div>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {item.media_type === 'image' ? (
                        <img src={item.full_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MediaTypeIcon mediaType={item.media_type} className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.original_name}</p>
                      <p className="text-xs text-muted-foreground">{item.folder} · {item.extension.toUpperCase()}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(item.size)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(item); }}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!mediaLoading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">{total} total files</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground px-3">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
