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
    "bg-guandan-gold text-guandan-background shadow-energy hover:bg-guandan-reward",
  secondary:
    "border border-guandan-blue/40 bg-guandan-blue/10 text-guandan-text shadow-tech hover:border-guandan-blue/70",
  ghost:
    "border border-transparent bg-transparent text-guandan-subtext hover:bg-guandan-muted hover:text-guandan-text",
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
