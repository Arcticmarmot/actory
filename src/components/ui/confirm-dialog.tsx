import { cn } from "@/lib/cn";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  tone?: "default" | "danger";
  title: string;
};

const secondaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const primaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/15 bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const dangerButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-card px-3.5 text-xs font-bold text-red-500 shadow-sm transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ConfirmDialog({
  cancelLabel = "取消",
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  tone = "default",
  title,
}: ConfirmDialogProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg border bg-card shadow-xl">
        <div className="border-b px-4 py-4">
          <strong className="text-base text-foreground">{title}</strong>
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              tone === "danger" ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3">
          <button className={secondaryButtonClass} type="button" onClick={onCancel}>
            <strong>{confirmLabel ? cancelLabel : "返回"}</strong>
          </button>
          {confirmLabel ? (
            <button
              className={tone === "danger" ? dangerButtonClass : primaryButtonClass}
              type="button"
              onClick={onConfirm}
            >
              <strong>{confirmLabel}</strong>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
