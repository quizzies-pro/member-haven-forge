import { useState } from "react";
import MemberHeader from "./MemberHeader";
import MemberSidebar from "./MemberSidebar";

interface MemberLayoutProps {
  children: React.ReactNode;
  logoUrl?: string | null;
  fullBleed?: boolean;
}

const MemberLayout = ({ children, logoUrl, fullBleed }: MemberLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MemberHeader logoUrl={logoUrl} onToggleSidebar={() => setSidebarOpen(true)} />
      <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={fullBleed ? "" : "pt-[60px]"}>{children}</main>
    </div>
  );
};

export default MemberLayout;
