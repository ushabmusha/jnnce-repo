import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-300 hover:shadow-glow"
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}