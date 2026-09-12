# Plano — Entrada geral do Dive Club e áreas por produto

## Objetivo

Transformar a experiência atual em uma plataforma com dois níveis:

```text
Login do Dive Club
       ↓
Página inicial do Dive Club — todos os produtos
       ↓
Produto comprado — página própria com banner, módulos e aulas
```

O produto atual será tratado como **AI Society**, mas continuará usando os dados cadastrados no banco. Hoje, o único curso publicado está registrado com o título **“TTS Academy”**; a correção desse conteúdo no banco será feita separadamente e somente com autorização explícita.

## Experiência do aluno

### 1. Entrada do Dive Club
- Manter o acesso por email e senha, mas apresentar a tela como entrada do **Dive Club**, e não de um produto específico.
- Após entrar, levar o aluno para a nova página geral do clube.

### 2. Página inicial geral
- Exibir a identidade do Dive Club e uma grade responsiva com todos os produtos publicados.
- Destacar visualmente os produtos que o aluno possui e os que ainda não possui.
- Mostrar imagem, nome e uma indicação curta de acesso em cada produto.
- Produto comprado: ao clicar, abrir sua área exclusiva.
- Produto não comprado: ao clicar, abrir o `checkout_url` cadastrado.
- Se um produto sem acesso ainda não tiver link de compra, mostrar um estado indisponível, sem levar o aluno para uma página quebrada.
- Prever estados de carregamento, catálogo vazio e falha ao carregar.

### 3. Página específica do produto
- Mover a experiência atual da página `/` para uma rota própria, vinculada ao produto, por exemplo `/produto/:courseId`.
- Carregar banner, logo, módulos e aulas pelo identificador do produto selecionado, eliminando a escolha atual de apenas uma matrícula com `limit(1)`.
- Confirmar que o aluno possui matrícula ativa antes de mostrar o conteúdo.
- Sem matrícula ativa, voltar à página geral do Dive Club e impedir a abertura do conteúdo.
- Preservar o visual e as funcionalidades atuais da área de aulas do produto.

### 4. Navegação coerente
- O logo e o item “Início” levarão à página geral do Dive Club.
- Dentro de módulo ou aula, “Voltar” retornará à página do produto correto, não à vitrine geral.
- “Minha Conta” e “Sair” continuarão disponíveis.
- Os links diretos de produto, módulo e aula permanecerão protegidos por login e pelas permissões existentes.

## Dados e segurança

- Buscar todos os cursos publicados na tabela de produtos existente.
- Buscar somente as matrículas ativas do aluno conectado e cruzá-las com os produtos para definir “com acesso” e “sem acesso”.
- Usar o campo de checkout já existente para os produtos não adquiridos.
- As regras atuais já permitem ao aluno autenticado consultar produtos publicados e apenas as próprias matrículas.
- Nenhuma migration ou nova tabela é necessária para esta estrutura.
- Não alterar o título “TTS Academy” nem preencher o checkout no banco durante esta implementação; esses dados serão ajustados depois mediante autorização.

## Organização técnica

- Criar uma nova página para a vitrine geral do Dive Club.
- Transformar a página inicial atual em uma página de produto parametrizada.
- Criar um cartão reutilizável de produto com estados adquirido, disponível para compra e indisponível.
- Atualizar as rotas, redirecionamentos após login e recuperação de senha, cabeçalho e links de retorno.
- Ajustar a busca de progresso dos módulos para sempre usar a matrícula do produto correspondente.
- Manter o tema escuro premium e o amarelo neon já adotados.

## Validação

- Testar aluno com acesso: entra no Dive Club, vê o catálogo e abre o AI Society.
- Testar produto não adquirido: clique abre o checkout cadastrado.
- Testar produto sem checkout: permanece bloqueado e informa indisponibilidade.
- Testar tentativa de abrir diretamente um produto não adquirido.
- Testar retorno de módulo e aula ao produto correto.
- Conferir a apresentação em desktop e celular.
