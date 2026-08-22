import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, onOpenChange, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
              {action}
            </div>
            <ToastClose onClick={() => onOpenChange?.(false)} />
            {/* 5-second countdown progress bar */}
            <span
              className="absolute bottom-0 left-0 h-0.5 bg-primary/30 rounded-full"
              style={{ animation: "toast-progress 5s linear forwards" }}
            />
          </Toast>
        );
      })}
      <ToastViewport />

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastProvider>
  );
}
