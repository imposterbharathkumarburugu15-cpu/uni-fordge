import { Search } from "lucide-react";
import { NavLink } from "react-router";
import { MODULES } from "@/app/config/modules";
import { Logo } from "@/components/common/Logo";
import { NotificationsMenu } from "./NotificationsMenu";
import { SystemStatusMenu } from "./SystemStatusMenu";
import { UserMenu } from "./UserMenu";

export function AppTopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--uf-border)] bg-[var(--uf-bg-raised)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <NavLink
          to="/command-center"
          className="flex shrink-0 items-center gap-2 text-[16px] text-[var(--uf-text-primary)]"
          aria-label="UNIFORGE — Command Center"
        >
          <Logo markClassName="text-[var(--uf-accent)]" />
        </NavLink>

        <nav
          className="ml-2 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none"
          aria-label="Primary modules"
        >
          {MODULES.map((m) => (
            <NavLink
              key={m.id}
              to={m.path}
              className={({ isActive }) =>
                `relative whitespace-nowrap rounded-sm px-2.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] [font-family:var(--uf-font-condensed)] transition-colors ${
                  isActive
                    ? "text-[var(--uf-text-primary)]"
                    : "text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-secondary)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {m.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-px bg-[var(--uf-accent)]" aria-hidden />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-9 items-center gap-2 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 text-[var(--uf-text-tertiary)] transition-colors hover:border-[var(--uf-border-strong)] hover:text-[var(--uf-text-secondary)]"
            aria-label="Search products, sources and conflicts"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="hidden text-[11px] lg:inline">Search</span>
            <span className="uf-kbd hidden md:inline">⌘K</span>
          </button>
          <NotificationsMenu />
          <SystemStatusMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
