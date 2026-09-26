import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import PackContent from "@/components/member/PackContent";
import type { Tables } from "@/integrations/supabase/types";

const collections = [
  { id: "collection-a", title: "Médicos" },
  { id: "collection-b", title: "Criadores" },
] as Tables<"pack_collections">[];
const items = [
  { id: "a", collection_id: "collection-a", title: "Consultório", description: "Arte para médicos", tags: [], format: "canva", cover_url: "https://example.com/cover.jpg", cover_ratio: "3:4", canva_template_url: "https://example.com/template" },
  { id: "b", collection_id: "collection-b", title: "Estúdio", tags: [], format: "canva", cover_url: null, cover_ratio: "1:1", canva_template_url: null },
  { id: "c", collection_id: null, title: "Avulso", tags: [], format: "canva", cover_url: null, cover_ratio: "16:9", canva_template_url: null },
] as Tables<"pack_items">[];

vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => {};
HTMLElement.prototype.releasePointerCapture = () => {};
HTMLElement.prototype.scrollIntoView = () => {};

describe("conteúdo dos Packs", () => {
  it("mostra todos os itens por padrão, sem cards de coleções, e filtra por coleção", () => {
    render(<PackContent collections={collections} items={items} format="canva" />);
    const rail = screen.getByLabelText("Itens do pack");
    expect(within(rail).getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("3 itens")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Médicos" })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Coleção" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("option", { name: "Médicos" }));
    expect(within(rail).getAllByRole("article")).toHaveLength(1);
    expect(within(rail).getByRole("heading", { name: "Consultório" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Coleção" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("option", { name: "Todos os itens" }));
    expect(within(rail).getAllByRole("article")).toHaveLength(3);
  });
  it("abre detalhes sem remover a ação de usar no Canva", () => {
    render(<PackContent collections={collections} items={items} format="canva" />);
    fireEvent.click(screen.getByRole("button", { name: "Ver detalhes de Consultório" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Arte para médicos");
    expect(within(screen.getByRole("dialog")).getByRole("link", { name: /Usar no Canva/ })).toHaveAttribute("href", "https://example.com/template");
  });
});