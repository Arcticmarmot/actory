import { cn } from "@/lib/cn";

export function ActoryLogo({
  compact = false,
  markClassName,
  textClassName,
}: {
  compact?: boolean;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <ActoryLogoMark className={markClassName} />
      {compact ? null : (
        <strong
          className={cn(
            "truncate text-base font-extrabold leading-none tracking-wide text-foreground",
            textClassName,
          )}
        >
          Actory
        </strong>
      )}
    </div>
  );
}

export function ActoryLogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center text-foreground",
        className,
      )}
    >
      <svg
        className="size-9"
        fill="none"
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-10 6 16)">
          <rect
            x="6"
            y="9"
            width="25"
            height="5"
            fill="currentColor"
            opacity="0.18"
          />
          <rect
            x="6"
            y="9"
            width="25"
            height="5"
            stroke="currentColor"
            strokeLinejoin="miter"
            strokeWidth="2.2"
          />
          <path
            d="M11 9L14 14M18 9L21 14M25 9L28 14"
            stroke="currentColor"
            strokeLinecap="square"
            strokeWidth="1.2"
          />
        </g>
        <rect
          x="6"
          y="15.8"
          width="25"
          height="15.2"
          fill="currentColor"
          opacity="0.08"
        />
        <rect
          x="6"
          y="15.8"
          width="25"
          height="15.2"
          stroke="currentColor"
          strokeLinejoin="miter"
          strokeWidth="2.2"
        />
        <path
          d="M6 21H31"
          stroke="currentColor"
          strokeLinecap="square"
          strokeWidth="2.2"
        />
        <path
          d="M9 21L12 15.8M16 21L19 15.8M23 21L26 15.8"
          stroke="currentColor"
          strokeLinecap="square"
          strokeWidth="1.2"
        />
        <path
          d="M10.5 26.5H20.5M24 26.5H27.5"
          stroke="currentColor"
          strokeLinecap="square"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}
