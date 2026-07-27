"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PanelNav({
  items,
  className,
  itemClassName,
  badges,
}: {
  items: readonly { href: string; label: string }[];
  className?: string;
  itemClassName?: string;
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {items.map((item) => {
        const active = pathname === item.href;
        const count = badges?.[item.href] ?? 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              itemClassName,
            )}
          >
            {item.label}
            {count > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
