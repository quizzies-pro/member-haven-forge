import { Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import diveClubLogo from "@/assets/dive-club-logo-white.png.asset.json";

const footerGroups = [
  {
    title: "Plataforma",
    links: [
      { label: "Início", href: "/" },
      { label: "Seus produtos", href: "/#catalogo" },
      { label: "Minha conta", href: "/minha-conta" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Central de ajuda", href: "#" },
      { label: "Suporte", href: "#" },
      { label: "Perguntas frequentes", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Política de privacidade", href: "#" },
      { label: "Política de cookies", href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", icon: Instagram },
  { label: "YouTube", icon: Youtube },
  { label: "LinkedIn", icon: Linkedin },
];

const MemberFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-[60px] lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr] lg:gap-20">
          <div className="max-w-sm">
            <Link to="/" aria-label="Ir para o início">
              <img src={diveClubLogo.url} alt="Dive Club" className="h-5 w-auto object-contain" />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Conhecimento, comunidade e ferramentas para construir ativos digitais com inteligência artificial.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Links do rodapé" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-medium text-foreground">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dive Club. Todos os direitos reservados.</p>
          <p>Feito para quem constrói o futuro digital.</p>
        </div>
      </div>
    </footer>
  );
};

export default MemberFooter;