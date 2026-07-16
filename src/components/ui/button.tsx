import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "md" | "lg";
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font800 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        size === "lg" && "min-h-14 rounded-[22px] text-base",
        variant === "primary" &&
          "bg-gradient-to-r from-[#6C4CF5] to-[#4361EE] text-white shadow-lg shadow-indigo-500/25",
        variant === "secondary" && "bg-white text-[#172033] shadow-sm",
        variant === "danger" &&
          "bg-gradient-to-r from-[#FF4567] to-[#FF6B7D] text-white shadow-lg shadow-rose-500/20",
        variant === "success" &&
          "bg-gradient-to-r from-[#12B76A] to-[#00BFA6] text-white shadow-lg shadow-emerald-500/20",
        variant === "ghost" && "bg-transparent text-[#6C4CF5]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
