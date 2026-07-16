import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#EAECF0] bg-white px-4 shadow-sm focus-within:border-[#6C4CF5]">
      {icon ? <span className="text-[#667085]">{icon}</span> : null}
      <input
        className={cn(
          "h-12 min-w-0 flex-1 bg-transparent text-base font700 text-[#172033] placeholder:text-[#98A2B3] focus:outline-none",
          className,
        )}
        {...props}
      />
    </label>
  );
}
