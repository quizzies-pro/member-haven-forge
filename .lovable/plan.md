

# Plano — Redesign da Página de Aula + Navegação Inteligente por Módulo

## Resumo

Redesenhar completamente a página `/aula/:lessonId` seguindo o design da imagem de referência, com layout em duas colunas (conteúdo principal + sidebar de navegação vertical entre aulas), e implementar a lógica de "ir direto para a primeira aula não concluída" ao clicar num módulo.

## O que muda para o usuário

1. **Clicar num módulo leva direto para a aula certa** — primeira não concluída, ou primeira se nenhuma foi iniciada
2. **Nova página de aula** com layout profissional: player de vídeo, info da aula com estrelas e botão "Marcar como concluído", materiais de apoio, seção de dúvidas, e sidebar lateral com timeline vertical de aulas
3. **Sidebar lateral direita** com nós circulares conectados por linha pontilhada amarela, mostrando progresso visual (concluída/ativa/pendente) e setas de navegação

## Detalhes Técnicos

### 1. Navegação inteligente ao clicar no módulo (ModuleCard.tsx + Index.tsx)

- Ao clicar num card de módulo, buscar as aulas do módulo + aulas concluídas do aluno
- Encontrar a primeira aula não concluída e navegar para `/aula/{id}`
- Se todas concluídas, ir para a primeira aula
- Isso substitui a navegação atual para `/modulo/:id`

### 2. Redesign completo de `Lesson.tsx`

Layout em duas colunas:

**Coluna principal (~85%)**:
- **Breadcrumb**: Nome do módulo (bold) + "Aula anterior | Próxima aula" em cinza como links
- **Player de vídeo**: 16:9, largura total da coluna, cantos arredondados
- **Bloco de info**: Lado esquerdo com avatar do instrutor + título grande + descrição. Lado direito com estrelas amarelas (visual, sem funcionalidade de rating por enquanto) + botão "MARCAR COMO CONCLUÍDO" com borda fina branca
- **Material da aula**: Ícones PDF vermelhos + nomes dos arquivos
- **Tire suas dúvidas**: Input underline + botão "ENVIAR" (visual por enquanto, sem backend de comentários)

**Coluna lateral (~15%)**:
- Linha pontilhada vertical amarela conectando nós circulares
- Nó ativo = amarelo neon sólido, maior
- Nós concluídos = preenchidos em cor escura/verde-oliva
- Nós pendentes = círculo vazio com borda cinza
- Setas ∧ ∨ em amarelo para navegar entre aulas
- Clique em qualquer nó navega para aquela aula

### 3. Buscar dados adicionais

- Carregar info do módulo (título) para o breadcrumb
- Carregar todas as aulas concluídas do enrollment para marcar os nós da sidebar
- Carregar info do curso (instructor_name) para o avatar/nome do instrutor

### 4. Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/components/member/ModuleCard.tsx` | Alterar onClick para buscar primeira aula não concluída |
| `src/pages/Lesson.tsx` | Redesign completo com layout 2 colunas |
| `src/components/member/LessonSidebar.tsx` | **Novo** — componente da timeline vertical lateral |

### 5. Sem alterações no banco de dados

Nenhuma migration necessária. Todos os dados já existem nas tabelas `lessons`, `enrollment_lessons`, `course_modules`, `courses`.

