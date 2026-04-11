import MemberLayout from "@/components/member/MemberLayout";
import { MessageCircle, Mail, Instagram } from "lucide-react";

const contactLinks = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    description: "Fale conosco pelo WhatsApp",
    href: "https://wa.me/5500000000000",
    color: "text-green-400",
  },
  {
    icon: Mail,
    label: "E-mail",
    description: "Envie um e-mail para nossa equipe",
    href: "mailto:contato@byb.com.br",
    color: "text-blue-400",
  },
  {
    icon: Instagram,
    label: "Instagram",
    description: "Siga-nos no Instagram",
    href: "https://instagram.com/byb",
    color: "text-pink-400",
  },
];

const Contact = () => {
  return (
    <MemberLayout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-[60px] py-10">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Contato</h1>
        <p className="text-muted-foreground mb-10">Precisa de ajuda? Entre em contato conosco.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card hover:bg-secondary/50 transition-colors text-center group"
            >
              <div className={`h-14 w-14 rounded-full bg-secondary flex items-center justify-center ${link.color} group-hover:neon-glow-sm transition-all`}>
                <link.icon size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{link.label}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
};

export default Contact;
