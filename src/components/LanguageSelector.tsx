
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-flex">{t("app.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("english")}>
          <div className="flex items-center gap-2">
            {language === "english" && <span className="text-primary">✓</span>}
            <span>{t("app.english")}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("indonesian")}>
          <div className="flex items-center gap-2">
            {language === "indonesian" && <span className="text-primary">✓</span>}
            <span>{t("app.indonesian")}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
