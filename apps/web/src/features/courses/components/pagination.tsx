import { ChevronRight, ChevronLeft } from "lucide-react"

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageWindow(currentPage: number, totalPages: number): (number | "…")[] {
    if (totalPages <= 7 ) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "…", totalPages];
    if (currentPage >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1 font-mono text-sm">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
      >
        < ChevronLeft size={16} />
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <button
            key={`page-${p}-${i}`}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={
              p === page
                ? "px-3 py-2 font-semibold text-primary underline underline-offset-[6px]"
                : "px-3 py-2 text-muted-foreground transition-colors hover:text-primary"
            }
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
      >
        < ChevronRight size={16} />
      </button>
    </nav>
  );
}