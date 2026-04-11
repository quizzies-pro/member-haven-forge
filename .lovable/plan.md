

## Plano: Área de Membros — Fase 1

### Visão Geral
Construir a área de membros do aluno com tema escuro premium, seguindo fielmente as referências visuais. O banco de dados **não será modificado** — apenas leitura das tabelas existentes.

### Design System
- **Tema escuro**: fundo preto/cinza escuro (#0a0a0a / #1a1a1a)
- **Acentos amarelo**: para links ativos e elementos de destaque (como na referência)
- **Cards de módulos**: estilo retrato com imagem de capa, badge de contagem de aulas e título
- **Tipografia**: moderna e clean, texto branco sobre fundo escuro

---

### Página 1 — Login / Cadastro
- Tela de login com email + senha usando **Supabase Auth**
- Opção de "Esqueci minha senha" com fluxo de reset
- Tela de cadastro para novos alunos
- Após login, verificar se o aluno existe na tabela `students` e redirecionar para a home do curso
- Página `/reset-password` para redefinição de senha
- Layout escuro com possibilidade de exibir o `login_cover_url` do curso como fundo

### Página 2 — Home do Curso
- **Header superior**: logo (da tabela `courses.logo_url`), barra de pesquisa, ícone de notificações, avatar do aluno com dropdown (Minha conta / Sair)
- **Banner hero**: imagem do curso (`banner_url`) em destaque, ocupando toda a largura
- **Seção "Conteúdo"**: carrossel horizontal de módulos do curso (tabela `course_modules`) com:
  - Imagem de capa do módulo (`cover_url`)
  - Badge com contagem de aulas (count de `lessons` por módulo)
  - Título do módulo
  - Setas de navegação lateral (< >)
- **Menu lateral (hamburger)**: abre sidebar com itens: Início, Conteúdo, Ranking, Minha Conta, Contato
  - Link ativo destacado em amarelo
  - Ícone para fechar o menu

### Página 3 — Minha Conta / Perfil
- Exibir dados do aluno (tabela `students`): nome, email, telefone, CPF, avatar
- Permitir edição dos dados pessoais (update na tabela `students` via RLS)
- Upload/troca de avatar
- Exibir informações da matrícula ativa (tabela `enrollments`)

---

### Estrutura de Rotas
- `/login` — Página de login/cadastro
- `/reset-password` — Redefinição de senha
- `/` — Home do curso (protegida, requer autenticação)
- `/minha-conta` — Perfil do aluno (protegida)

### Componentes Principais
1. **AuthLayout** — Layout para páginas de autenticação
2. **MemberLayout** — Layout com header + sidebar para páginas logadas
3. **MemberSidebar** — Menu lateral com navegação
4. **MemberHeader** — Header com logo, busca, notificações, avatar/dropdown
5. **CourseBanner** — Banner hero do curso
6. **ModuleCarousel** — Carrossel horizontal de cards de módulos
7. **ModuleCard** — Card individual de módulo
8. **ProfileForm** — Formulário de edição de perfil
9. **ProtectedRoute** — Componente que verifica autenticação

### Segurança
- Todas as rotas de membro protegidas via `ProtectedRoute`
- Dados acessados via RLS policies já existentes no banco
- Session gerenciada com `onAuthStateChange` do Supabase
- Nenhuma modificação no schema do banco de dados

