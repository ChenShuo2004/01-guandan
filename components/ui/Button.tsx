import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0058be] text-white shadow-[0_12px_26px_rgba(0,88,190,0.24)] hover:bg-[#2170e4]",
  secondary:
    "border border-[#adc6ff] bg-[#e7eeff] text-[#0058be] hover:border-[#64a8fe]",
  ghost:
    "border border-transparent bg-transparent text-[#424754] hover:bg-[#e7eeff] hover:text-[#0058be]",
  danger:
    "border border-guandan-danger/45 bg-guandan-danger/10 text-guandan-danger hover:bg-guandan-danger/20",
  success:
    "border border-guandan-success/45 bg-guandan-success/10 text-guandan-success hover:bg-guandan-success/20"
};

export function Button({
  children,
  className,
  href,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
