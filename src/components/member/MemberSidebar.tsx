import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, User, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Início", icon: Home, to: "/" },
  { label: "Conteúdo", icon: BookOpen, to: "/conteudo" },
  { label: "Ranking", icon: Trophy, to: "/ranking" },
  { label: "Minha Conta", icon: User, to: "/minha-conta" },
  { label: "Contato", icon: MessageCircle, to: "/contato" },
];

const MemberSidebar = ({ open, onClose }: MemberSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="text-lg font-bold text-foreground">Menu</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default MemberSidebar;
