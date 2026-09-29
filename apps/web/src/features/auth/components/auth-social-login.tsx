import { Apple, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthSocialLogin() {
  return (
    <>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-border" />
        <span>Or log in with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Continue with Google"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-base font-bold text-[#4285f4] transition-colors hover:bg-accent"
        >
          <Globe size={19} strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Continue with Facebook"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-base font-bold text-[#1877f2] transition-colors hover:bg-accent"
        >
          <span className="text-xl font-bold leading-none">f</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Continue with Apple"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-slate-900 transition-colors hover:bg-accent"
        >
          <Apple size={19} fill="currentColor" />
        </Button>
      </div>
    </>
  );
}
