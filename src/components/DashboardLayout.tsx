import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-lg font-bold text-foreground">Pembuat Gambar</h1>
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 container py-8 pt-24">{children}</main>
    </div>
  );
}
