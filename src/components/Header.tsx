"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_CTA, NAV_GROUPS, type NavGroup } from "@/lib/nav";

function SparkIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className="inline-block"
      aria-hidden="true"
    >
      <path
        d="M18 2L6 18h8l-2 12 12-16h-8l2-12z"
        fill="url(#spark-gradient)"
        stroke="rgba(245,158,11,0.4)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="spark-gradient" x1="8" y1="2" x2="22" y2="32">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");

function DesktopGroup({
  group,
  open,
  active,
  onOpen,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  active: boolean;
  onOpen: (id: string, focusFirst?: boolean) => void;
  onClose: (returnFocus?: boolean) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const hoverOpened = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = `nav-panel-${group.id}`;

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) hoverOpened.current = false;
  }, [open]);

  const focusItem = (delta: number) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = i === -1 ? (delta > 0 ? 0 : items.length - 1) : (i + delta + items.length) % items.length;
    items[next].focus();
  };

  return (
    <li
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        cancelClose();
        if (!open) {
          hoverOpened.current = true;
          onOpen(group.id);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        if (!hoverOpened.current) return;
        cancelClose();
        closeTimer.current = setTimeout(() => onClose(), 150);
      }}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          onClose(true);
          buttonRef.current?.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!open) onOpen(group.id, true);
          else focusItem(1);
        } else if (e.key === "ArrowUp" && open) {
          e.preventDefault();
          focusItem(-1);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open && hoverOpened.current) {
            // Opened by hover a moment ago: a click confirms it rather than closing it.
            hoverOpened.current = false;
            return;
          }
          if (open) onClose();
          else onOpen(group.id);
        }}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-semibold transition-colors hover:text-spark-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
          open || active ? "text-spark-orange" : "text-stone-700"
        }`}
      >
        {group.label}
        <Chevron open={open} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
      >
        <ul
          ref={listRef}
          className="min-w-56 rounded-2xl border border-black/8 bg-white p-2 shadow-xl shadow-black/10"
        >
          {group.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => onClose()}
                className="block whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-surface-light hover:text-spark-orange focus-visible:bg-surface-light focus-visible:text-spark-orange focus-visible:outline-none"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const focusFirstOnOpen = useRef(false);

  const openMenu = useCallback((id: string, focusFirst = false) => {
    focusFirstOnOpen.current = focusFirst;
    setOpenGroup(id);
  }, []);
  const closeMenu = useCallback(() => setOpenGroup(null), []);

  // Close everything when the page changes (including back and forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenGroup(null);
    setMobileOpen(false);
  }

  // Move focus into a menu opened with the arrow key.
  useEffect(() => {
    if (!openGroup || !focusFirstOnOpen.current) return;
    focusFirstOnOpen.current = false;
    document.querySelector<HTMLAnchorElement>(`#nav-panel-${openGroup} a`)?.focus();
  }, [openGroup]);

  // Outside click and Escape close the open dropdown and the mobile menu.
  useEffect(() => {
    if (!openGroup && !mobileOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup, mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-black/8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link href="/" className="flex shrink-0 items-center gap-2 group" aria-label="Spark Powered home">
            <SparkIcon />
            <span className="whitespace-nowrap text-xl font-extrabold text-ink">Spark Powered</span>
          </Link>

          {/* Desktop nav */}
          <nav ref={navRef} aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {NAV_GROUPS.map((group) => (
                <DesktopGroup
                  key={group.id}
                  group={group}
                  open={openGroup === group.id}
                  active={group.links.some((l) => isActive(pathname, l.href))}
                  onOpen={openMenu}
                  onClose={closeMenu}
                />
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href={NAV_CTA.href} className="hidden sm:inline-flex whitespace-nowrap btn btn-primary btn-sm">
              {NAV_CTA.label}
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-stone-700 hover:text-spark-orange"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-black/8 bg-background/98 backdrop-blur-lg pb-4"
        >
          <div className="px-4 pt-4 sm:hidden">
            <Link
              href={NAV_CTA.href}
              className="btn btn-primary w-full"
              onClick={() => setMobileOpen(false)}
            >
              {NAV_CTA.label}
            </Link>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2 px-4 sm:px-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className="pt-4">
                <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-muted">{group.label}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block rounded-lg px-2 py-2.5 text-[15px] font-medium transition-colors hover:bg-surface-light hover:text-spark-orange ${
                          isActive(pathname, link.href) ? "text-spark-orange" : "text-stone-700"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
