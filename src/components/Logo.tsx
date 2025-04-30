
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/dashboard" className={`font-heading font-bold ${sizeClasses[size]} gradient-text ${className}`}>
      PembuatGambar
    </Link>
  );
}
