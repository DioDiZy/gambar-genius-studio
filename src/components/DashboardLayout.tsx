
import { ReactNode } from "react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
