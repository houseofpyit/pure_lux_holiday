import * as React from "react";
import { cva } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    {...props}
  />
));
ToastProvider.displayName = "ToastProvider";

// Kept for API compatibility — rendering is handled by ToastProvider
const ToastViewport = React.forwardRef((_props, _ref) => null);
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border shadow-lg p-4 pr-10 transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in",
  {
    variants: {
      variant: {
        default: "bg-white border-border text-foreground",
        destructive: "bg-destructive border-destructive text-destructive-foreground",
        success: "bg-white border-emerald-200 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const variantIcon = {
  default: <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
  destructive: <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />,
};

const Toast = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {variantIcon[variant] ?? variantIcon.default}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/40 transition-colors hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-muted-foreground mt-0.5", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
