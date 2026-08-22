import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function LoadingState({ className, lines = 3 }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ title = 'Unable to load content', message, className }) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message || 'Please try again shortly.'}</AlertDescription>
    </Alert>
  );
}

export function EmptyState({ title = 'No content available', message, className }) {
  return (
    <div className={cn('rounded-md border border-dashed border-slate-300 p-6 text-center', className)}>
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {message ? <p className="mt-2 text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}

export function UnavailableImage({ label = 'Image unavailable', className }) {
  return (
    <div className={cn('flex min-h-40 items-center justify-center bg-slate-100 text-sm text-slate-500', className)}>
      {label}
    </div>
  );
}
