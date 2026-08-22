import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ({ duration = 2000, ...props }) => (
  <ToastPrimitives.Provider duration={duration} swipeDirection="right" {...props} />
);
ToastProvider.displayName = "ToastProvider";

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-10 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/95 transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-100",
        destructive:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950 dark:text-red-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  default: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  destructive: <AlertTriangle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

const Toast = React.forwardRef(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="mt-0.5 shrink-0">
          {iconMap[variant || "default"]}
        </div>

        <div className="grid gap-1 flex-1">
          {children}
        </div>

        <ToastClose />

        <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-2xl">
          <div
            className={cn(
              "h-full origin-left animate-[toast-progress_5s_linear_forwards]",
              variant === "success" && "bg-emerald-500/80",
              variant === "destructive" && "bg-red-500/80",
              variant === "warning" && "bg-amber-500/80",
              (!variant || variant === "default") && "bg-blue-500/80"
            )}
          />
        </div>
      </ToastPrimitives.Root>
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "mt-2 inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-current/15 bg-white/60 px-3 text-xs font-medium transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-slate-900/40 dark:hover:bg-slate-900/70",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-md p-1 text-current/50 opacity-70 transition-all hover:bg-black/5 hover:text-current hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring dark:hover:bg-white/10",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};