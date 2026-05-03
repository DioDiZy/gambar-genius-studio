import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { CustomButton } from "@/components/ui/custom-button";
import { UserMenu } from "@/components/UserMenu";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  showAuth?: boolean;
}

export function Navbar({ showAuth = true }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="container flex items-center justify-between py-4">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Fitur
            </Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Harga
            </Link>
          </nav>

          {showAuth && (
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <CustomButton variant="gradient">Dashboard</CustomButton>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <CustomButton variant="outline">Masuk Yuk</CustomButton>
                  </Link>
                  <Link to="/signup">
                    <CustomButton variant="gradient">Daftar</CustomButton>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Buka menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden py-4 px-6 border-t">
          <nav className="flex flex-col gap-4 mb-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Beranda
            </Link>
            <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Fitur
            </Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Harga
            </Link>
          </nav>

          {showAuth && (
            <div className="flex flex-col gap-4">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <CustomButton variant="gradient" className="w-full">Dashboard</CustomButton>
                </Link>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                    <CustomButton variant="outline" className="w-full">Masuk Yuk</CustomButton>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <CustomButton variant="gradient" className="w-full">Daftar</CustomButton>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
