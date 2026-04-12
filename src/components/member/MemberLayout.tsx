import { useState } from "react";
import MemberHeader from "./MemberHeader";
import MemberSidebar from "./MemberSidebar";

interface MemberLayoutProps {
  children: React.ReactNode;
  logoUrl?: string | null;
}

const MemberLayout = ({ children, logoUrl }: MemberLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MemberHeader logoUrl={logoUrl} onToggleSidebar={() => setSidebarOpen(true)} />
      <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-[60px]">{children}</main>
    </div>
  );
};

export default MemberLayout;
