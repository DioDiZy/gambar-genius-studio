
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface CustomButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  gradientBorder?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "gradient";
}

export function CustomButton({ 
  className, 
  gradientBorder = false, 
  variant = "default", 
  ...props 
}: CustomButtonProps) {
  if (variant === "gradient") {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          "bg-gradient-to-r from-brand-purple to-brand-pink text-white px-6 py-3 rounded-lg hover:opacity-90",
          className
        )}
        {...props}
      />
    );
  }

  if (gradientBorder) {
    return (
      <div className="relative p-[1px] overflow-hidden rounded-md bg-gradient-to-r from-brand-purple to-brand-pink">
        <Button
          className={cn("relative z-10", className)}
          variant={variant}
          {...props}
        />
      </div>
    );
  }

  return <Button className={className} variant={variant} {...props} />;
}
