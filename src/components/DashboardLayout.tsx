import { ReactNode } from "react";
import { UserMenu } from "./UserMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap');

  .dash-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(255, 249, 240, 0.96);
    backdrop-filter: blur(8px);
    border-bottom: 3px solid #FFE0C8;
  }

  .dash-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dash-nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .dash-nav-logo-text {
    font-family: 'Baloo 2', cursive;
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(90deg, #FF5A1F, #FF4D8D, #9B59B6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <style>{navStyles}</style>

      <header className="dash-nav">
        <div className="dash-nav-inner">
          <a href="/" className="dash-nav-logo">
            <span style={{ fontSize: 28 }}>🎨</span>
            <span className="dash-nav-logo-text">PembuatGambar</span>
          </a>
          <UserMenu />
        </div>
      </header>

      {/* Samakan dengan layout lama: pt-24 = 96px, ditambah py-8 */}
      <main className="flex-1 container py-8 pt-24">{children}</main>
    </div>
  );
}
