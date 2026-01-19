import { Link } from "react-router-dom";
import { Bell, MessageSquare, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showRegisterPatient?: boolean;
}

export function Header({ title, subtitle, showSearch = true, showRegisterPatient = false }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-card border-b">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, MRN, or symptoms..."
              className="w-80 pl-10 bg-muted/50 border-0"
            />
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
        </Button>

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </Button>

        {showRegisterPatient && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Register Patient
          </Button>
        )}
      </div>
    </header>
  );
}
