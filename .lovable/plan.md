

## Plano: Integrar dados reais do TTS Academy

O curso **TTS Academy** já está no banco com logo, banner, cover e 13 módulos publicados. O código atual já busca dados dinamicamente via enrollment, mas a tela de Login ainda usa conteúdo genérico. Vamos ajustar para puxar a identidade visual do curso.

### Alterações

**1. Página de Login — exibir branding do TTS Academy**
- Buscar o curso publicado (query pública: `courses` onde `status = published`) ao carregar a página de login
- Usar `login_cover_url` ou `cover_url` como imagem de fundo do lado esquerdo (atualmente é um gradiente genérico)
- Exibir o `logo_url` do curso acima do formulário de login
- Exibir o título do curso ("TTS Academy") no lugar do texto genérico "Área de Membros"

**2. Página Index (Home) — já funcional**
- O código já busca enrollment > course > modules corretamente
- Já exibe banner, logo no header e carrossel de módulos
- Nenhuma alteração necessária na lógica, apenas pequenos refinamentos visuais se necessário

**3. Página MyAccount — já funcional**
- Já lê e atualiza dados do student via RLS
- Nenhuma alteração necessária

**4. Refinamento visual geral**
- Garantir que o `login_cover_url` seja preenchido no banco (atualmente é `null`) — como não podemos modificar o banco, usaremos `cover_url` ou `banner_url` como fallback
- Ajustar o card de login para ficar mais alinhado com o tema escuro premium

### Detalhes Técnicos
- A query na página de Login usará: `supabase.from("courses").select("title, logo_url, login_cover_url, cover_url, banner_url").eq("status", "published").limit(1).single()`
- O RLS já permite `SELECT` em `courses` para `authenticated` com `status = published`, mas na tela de login o usuário ainda não está autenticado — precisamos verificar se a policy permite acesso anônimo. Se não, usaremos as URLs do curso diretamente como constantes ou criaremos uma abordagem que funcione sem auth.
- Fallback chain para cover: `login_cover_url` > `banner_url` > `cover_url`

### Arquivos modificados
- `src/pages/Login.tsx` — buscar e exibir branding do curso

