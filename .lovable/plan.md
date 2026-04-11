

## Plano: Fase 2 — Redesign visual premium + Páginas de conteúdo

### Visão Geral
Redesenhar toda a área de membros seguindo a identidade visual "By'b" (preto puro, amarelo neon, estética editorial), adicionar navegação por módulos/aulas, player de vídeo Vimeo, e páginas de Ranking e Contato. Dados reais do banco (13 módulos, 13 aulas com vídeos Vimeo).

### Dados do banco confirmados
- **Curso**: TTS Academy, com banner e logo reais
- **13 módulos** publicados, cada um com cover_url real
- **13 aulas** publicadas, todas com `video_url: https://vimeo.com/1170086778`
- **Tabelas de progresso**: `enrollment_lessons`, `enrollment_modules` (RLS permite SELECT para aluno)
- **Materiais**: `lesson_materials` (RLS permite SELECT para aluno inscrito)

---

### 1. Tema e CSS Global (`src/index.css`)
- Background puro `#000000` em vez de `#0a0a0a`
- Primary accent: amarelo neon `#C8F000` (substituir o amarelo dourado atual)
- Adicionar classes utilitárias para glow neon (box-shadow amarelo), gradientes de card
- Font: manter Inter (já no projeto), peso 700-800 para headings

### 2. Navbar (`MemberHeader.tsx`)
- Fundo preto puro, sem border
- Logo "By'b" em branco bold (já vem do `logo_url` do curso)
- Search bar: pill shape, fundo `#1a1a1a`, placeholder "Pesquisar"
- Bell com badge dot vermelho/laranja
- Avatar circular ~40px
- Altura ~60px

### 3. Hero Banner (`CourseBanner.tsx`)
- Full-width, ~45vh de altura
- Imagem do `banner_url` do curso como fundo
- Logo do curso centralizado sobre o banner (usar `cover_url` que é a logo "#tts academy")
- Gradiente escuro na parte inferior fade para preto
- Sem botões — puramente visual/branding

### 4. Carrossel de Módulos (`ModuleCarousel.tsx` + `ModuleCard.tsx`)
- Título "Conteúdo" branco bold ~28px, left-aligned
- Cards ~200x300px (retrato), rounded-12px
- Cover do módulo como imagem full-bleed
- Badge top-left: pill "X Aulas" semi-transparente
- Gradiente bottom overlay (transparente → preto)
- Texto bottom-left: nome do módulo, branco bold, 2 linhas max
- Play button amarelo neon no primeiro/hover card
- Hover: scale(1.03) + glow border amarelo
- Setas `‹` `›` amarelo neon, ~40px, sem background
- ~5-6 cards visíveis, gap 16px
- **Click no card** → navega para `/modulo/:moduleId`

### 5. Nova Página: Módulo (`/modulo/:moduleId`)
- **Arquivo**: `src/pages/Module.tsx`
- Header com nome do módulo e botão voltar
- Lista de aulas do módulo (busca `lessons` por `module_id`)
- Cada aula mostra: thumbnail (ou placeholder), título, duração
- Indicador de aula concluída (check verde) via `enrollment_lessons`
- Click na aula → navega para `/aula/:lessonId`

### 6. Nova Página: Aula (`/aula/:lessonId`)
- **Arquivo**: `src/pages/Lesson.tsx`
- Player de vídeo Vimeo embedado (iframe `https://player.vimeo.com/video/{id}`)
- Título da aula abaixo do player
- Conteúdo HTML (`content_html`) renderizado
- Lista de materiais da aula (`lesson_materials`) com links de download
- Botão "Marcar como concluída" → insert em `enrollment_lessons` (precisa RLS INSERT — verificar)
- Navegação prev/next entre aulas do mesmo módulo

### 7. Página Ranking (`/ranking`)
- **Arquivo**: `src/pages/Ranking.tsx`
- Placeholder inicial: lista de alunos com mais aulas concluídas
- Query: count de `enrollment_lessons` por enrollment → student
- Exibir avatar, nome, e total de aulas concluídas

### 8. Página Contato (`/contato`)
- **Arquivo**: `src/pages/Contact.tsx`
- Informações de contato / formulário simples
- Links para WhatsApp/email/redes sociais

### 9. Rotas (`App.tsx`)
Adicionar:
- `/modulo/:moduleId` → `<Module />`
- `/aula/:lessonId` → `<Lesson />`
- `/ranking` → `<Ranking />`
- `/contato` → `<Contact />`
Todas protegidas via `<ProtectedRoute>`

### 10. RLS — Marcar aula como concluída
- Verificar se `enrollment_lessons` tem policy INSERT para alunos
- Se não, criar migration adicionando policy: `INSERT WHERE enrollment_id pertence ao aluno`
- Mesmo para `enrollment_modules`

---

### Arquivos criados/modificados
| Arquivo | Ação |
|---------|------|
| `src/index.css` | Redesign tokens: preto puro, amarelo neon, glow utilities |
| `src/components/member/MemberHeader.tsx` | Redesign navbar: pill search, badge, estilo By'b |
| `src/components/member/CourseBanner.tsx` | Banner 45vh + logo centralizada + gradiente |
| `src/components/member/ModuleCarousel.tsx` | Netflix-style carousel com setas amarelas |
| `src/components/member/ModuleCard.tsx` | Card retrato 200x300, badge, gradiente, hover glow |
| `src/pages/Module.tsx` | **Novo** — lista de aulas do módulo |
| `src/pages/Lesson.tsx` | **Novo** — player Vimeo + conteúdo + materiais |
| `src/pages/Ranking.tsx` | **Novo** — ranking de alunos |
| `src/pages/Contact.tsx` | **Novo** — página de contato |
| `src/App.tsx` | Adicionar 4 novas rotas |
| `src/pages/Index.tsx` | Passar `cover_url` do curso para banner |
| Migration SQL | INSERT policy em `enrollment_lessons` e `enrollment_modules` |

