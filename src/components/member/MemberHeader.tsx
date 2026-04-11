import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Search, Bell, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoByb from "@/assets/logo-byb.png";

interface MemberHeaderProps {
  logoUrl?: string | null;
  onToggleSidebar: () => void;
}

const MemberHeader = ({ logoUrl, onToggleSidebar }: MemberHeaderProps) => {
  const { student, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = student?.name
    ? student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <img src={logoByb} alt="By'b" className="h-10 object-contain rounded-lg" />
        <button onClick={onToggleSidebar} className="text-foreground hover:text-primary transition-colors">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-[hsl(0,0%,10%)] rounded-full px-4 py-2 gap-2 w-64">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Search size={20} />
        </button>

        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all">
              <Avatar className="h-10 w-10">
                <AvatarImage src={student?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem
              onClick={() => navigate("/minha-conta")}
              className="cursor-pointer text-foreground hover:bg-secondary"
            >
              <User size={16} className="mr-2" />
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-destructive hover:bg-secondary"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default MemberHeader;
