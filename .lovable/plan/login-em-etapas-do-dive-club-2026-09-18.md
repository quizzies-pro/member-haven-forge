# Login em etapas do Dive Club

## Objetivo
Transformar a entrada atual em uma experiência centralizada, inspirada na referência enviada, usando a imagem azul do Dive Club em tela cheia e conduzindo o aluno em duas etapas:

```text
E-mail → confirmação de cadastro → senha → área de membros
```

## Experiência da tela
- Usar a imagem `Imagem_de_fundo_dive.png` como fundo integral, mantendo-a legível e bem enquadrada em computador e celular.
- Posicionar a logo branca do Dive Club e o formulário no centro, sem painel claro e sem reaproveitar a foto atual.
- Manter a identidade escura com detalhes azuis, tipografia Outfit nos títulos e Figtree nos demais textos.
- Aplicar uma camada escura discreta atrás da área central para preservar o contraste sem esconder o fundo.
- Usar transição curta e suave entre as etapas, respeitando a preferência do dispositivo por movimento reduzido.

## Fluxo de entrada
1. **Etapa de e-mail**
   - Mostrar apenas o campo de e-mail e o botão **Continuar**.
   - Validar formato e tamanho antes da consulta.
   - Consultar de forma controlada se o e-mail pertence a um aluno cadastrado.
   - Se não existir, permanecer nessa etapa e mostrar **“E-mail não cadastrado. Entre em contato com o suporte.”**

2. **Etapa de senha**
   - Mostrar o e-mail confirmado, campo de senha, opção de exibir/ocultar e botão **Entrar**.
   - Permitir voltar e corrigir o e-mail.
   - Em senha incorreta, exibir uma mensagem clara sem apagar o e-mail.
   - Após autenticar, levar o aluno à página geral de produtos.

3. **Recuperação de senha**
   - Manter **Esqueceu sua senha?** na etapa da senha.
   - Reutilizar o e-mail já confirmado e preservar o fluxo público de redefinição existente.

4. **Cadastro e perfil**
   - Remover a criação pública de conta desta tela, pois e-mails desconhecidos devem somente receber o aviso solicitado.
   - Manter os perfis atuais dos alunos, incluindo nome, foto e demais dados da conta.

## Validação segura do e-mail
A lista de alunos hoje é protegida e não pode ser consultada publicamente pelo navegador. Para confirmar a existência do e-mail sem abrir essa lista:
- criar uma função protegida no Supabase que receba apenas um e-mail normalizado e devolva somente `existe/não existe`;
- não retornar nome, identificador, matrícula ou qualquer outro dado do aluno;
- validar o conteúdo também no servidor e não registrar o endereço informado;
- preservar todas as regras atuais da tabela de alunos.

Essa confirmação explícita revela se um endereço possui conta, exatamente como solicitado. Será aplicada de forma mínima, mas continua sendo uma informação observável por quem testar endereços conhecidos.

## Alterações previstas
- Página de login e seus estados de carregamento, erro e navegação entre etapas.
- Inclusão da imagem enviada como arquivo otimizado do aplicativo.
- Pequenos estilos específicos da nova composição, usando os padrões visuais atuais.
- Uma função segura no Supabase para a confirmação do e-mail; nenhuma tabela nova e nenhuma mudança nos dados dos alunos.

## Validação final
- Testar e-mail inválido, não cadastrado e cadastrado.
- Testar senha incorreta, senha correta, voltar para editar e-mail e recuperação de senha.
- Conferir o enquadramento visual em computador e celular.
- Confirmar que não há cadastro público na nova tela e que os perfis existentes continuam funcionando.
