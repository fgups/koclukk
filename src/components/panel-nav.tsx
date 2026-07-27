"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PanelNav({
  items,
  className,
  itemClassName,
}: {
  items: readonly { href: string; label: string }[];
  className?: string;
  itemClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              itemClassName,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
