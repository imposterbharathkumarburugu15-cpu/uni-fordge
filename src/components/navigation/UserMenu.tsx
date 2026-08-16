import { LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSystemStatus } from "@/hooks/use-forge-store";
import { initials } from "@/utils/format";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const system = useSystemStatus();
  const navigate = useNavigate();

  const displayName = user?.name ?? system.operator;
  const email = user?.email ?? `${system.operator.toLowerCase().replace(/\s+/g, ".")}@uniforge.io`;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-sm border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-[var(--uf-border)] hover:bg-[var(--uf-surface)]"
          aria-label="User menu"
        >
          <Avatar className="size-8 rounded-sm border border-[var(--uf-border-strong)]">
            <AvatarFallback className="rounded-sm bg-[var(--uf-surface-2)] text-[11px] font-semibold text-[var(--uf-text-primary)]">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left lg:block">
            <span className="block text-[12px] font-medium leading-tight text-[var(--uf-text-primary)]">
              {displayName}
            </span>
            <span className="block uf-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
              {system.operatorRole}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[240px] border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="text-[13px] font-medium text-[var(--uf-text-primary)]">{displayName}</p>
          <p className="uf-mono mt-0.5 text-[10.5px] text-[var(--uf-text-tertiary)]">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--uf-border-faint)]" />
        <DropdownMenuItem
          onSelect={() => navigate("/command-center")}
          className="gap-2 text-[12.5px] focus:bg-[var(--uf-accent-dim)]"
        >
          <UserRound className="size-3.5" aria-hidden />
          Command Center
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--uf-border-faint)]" />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="gap-2 text-[12.5px] text-[var(--uf-critical)] focus:bg-[var(--uf-critical-dim)] focus:text-[var(--uf-critical)]"
        >
          <LogOut className="size-3.5" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
