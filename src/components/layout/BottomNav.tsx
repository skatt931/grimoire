"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Головна",
    icon: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10.5L11 3l9 7.5" />
        <path d="M4 9v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Журнал",
    icon: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="16" height="18" rx="2" />
        <line x1="7" y1="7" x2="15" y2="7" />
        <line x1="7" y1="11" x2="15" y2="11" />
        <line x1="7" y1="15" x2="11" y2="15" />
      </svg>
    ),
  },
  {
    href: "/cards",
    label: "Карти",
    icon: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round">
        <rect x="5" y="1" width="12" height="20" rx="2.5" />
        <circle cx="11" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "Знаки",
    icon: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round">
        <circle cx="4.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="11" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
        <path d="M4.5 16.5L11 8.5M11 8.5L17.5 14M11 8.5L17.5 4.5" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Обране",
    icon: (
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13.5a8.5 8.5 0 01-8.5 8.5 8.5 8.5 0 010-17A6.5 6.5 0 0120 13.5z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center
      pt-2 border-t border-white/5
      bg-[#06060F]/95 backdrop-blur-xl"
      style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))" }}>
      {NAV.map(({ href, label, icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-colors duration-200"
            style={{ color: active ? "#8B9FD4" : "rgba(234,240,248,0.28)" }}
          >
            <span className="w-[22px] h-[22px] flex items-center justify-center">
              {icon}
            </span>
            <span className="text-[11px] font-[500] tracking-[0.06em]"
              style={{ fontFamily: "var(--font-manrope)" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
