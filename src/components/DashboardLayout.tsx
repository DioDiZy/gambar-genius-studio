import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { UserMenu } from "./UserMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <Navbar showAuth={false} inline />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
