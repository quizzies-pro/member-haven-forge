import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PackPresentation, { PackAbout } from "@/components/member/PackPresentation";
import type { Tables } from "@/integrations/supabase/types";

vi.mock("@/components/member/WaitlistAction", () => ({ default: () => <div>Lista de espera</div> }));

const pack = {
  id: "pack-a", title: "Pack Criativo", product_type: "pack", short_description: "Crie com liberdade",
  full_description: "Coleções para você.", available_for_sale: true, checkout_url: "https://example.com/checkout",
  presentation_button_enabled: false, presentation_button_text: null, presentation_button_url: null,
  hero_16_9_url: null, hero_4_3_url: null, banner_url: null, cover_16_9_url: null, cover_url: null,
} as Tables<"courses">;
const videos = [
  { id: "a", title: "Primeiro vídeo", description: "Conheça o pack", video_url: "https://youtu.be/abcdefghijk" },
  { id: "b", title: "Segundo vídeo", description: "Outro assunto", video_url: "https://vimeo.com/1234" },
] as Tables<"pack_videos">[];

const show = (hasAccess: boolean) => render(<MemoryRouter><PackPresentation course={pack} hasAccess={hasAccess} videos={hasAccess ? videos : []} /></MemoryRouter>);

describe("apresentação dos Packs", () => {
  it("mostra compra mas não conteúdo protegido sem acesso", () => {
    show(false);
    expect(screen.getByRole("heading", { name: "Pack Criativo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Comprar pack/ })).toHaveAttribute("href", "https://example.com/checkout");
    expect(screen.queryByText("Primeiro vídeo")).not.toBeInTheDocument();
    expect(screen.queryByRole("iframe")).not.toBeInTheDocument();
  });
  it("alterna vídeos publicados para o aluno com acesso", () => {
    show(true);
    expect(screen.getByTitle("Primeiro vídeo")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abcdefghijk");
    fireEvent.click(screen.getByRole("button", { name: "Reproduzir Segundo vídeo" }));
    expect(screen.getByTitle("Segundo vídeo")).toHaveAttribute("src", "https://player.vimeo.com/video/1234");
    expect(screen.getByRole("button", { name: "Reproduzir Segundo vídeo" })).toHaveAttribute("aria-current", "true");
  });
  it("não incorpora endereços de vídeo não confiáveis", () => {
    render(<MemoryRouter><PackPresentation course={pack} hasAccess videos={[{ ...videos[0], video_url: "https://invalid.example/video" }]} /></MemoryRouter>);
    expect(screen.getByText("Vídeo indisponível")).toBeInTheDocument();
    expect(screen.queryByTitle("Primeiro vídeo")).not.toBeInTheDocument();
  });
  it("mantém a descrição longa fora do topo e a expande em Saiba mais", () => {
    render(<MemoryRouter><PackPresentation course={pack} hasAccess={false} videos={[]} /><PackAbout description={pack.full_description || ""} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Pack Criativo" })).toBeInTheDocument();
    expect(screen.getByText("Crie com liberdade")).toBeInTheDocument();
    expect(screen.queryByText("Coleções para você.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Saiba mais sobre o pack" }));
    expect(screen.getByText("Coleções para você.")).toBeVisible();
  });
});