# Roadmap

- [x] Retomar o template escolhido depois de criar conta ou entrar; retorno autenticado após redirecionamento conferido, sem iniciar geração automaticamente.
- [x] Facilitar retomada do PIX pendente sem alterar a janela de dois minutos; cópia confirmada antes do aviso de sucesso e tentativas de pagamento sem sobreposição.
- [x] Testar com sessão real foto → planos → PIX → sair → retomar pagamento → copiar código, sem visualizar vídeos.

- [x] Reutilizar PIX pendente do mesmo valor por dois minutos desde a geração; prazo, valores diferentes e estado pago testados; retorno autenticado ao checkout confirmou mesmo código e transação no serviço ativo.
- [x] Explicar a compra necessária para gerar e oferecer ilimitado por R$ 9,90 ao sair dos planos; saída pelo X, recusa e compra conferidas com sessão autenticada no celular.
- [x] Restaurar ação de gerar ao voltar à foto selecionada; teste e fluxo autenticado conferidos.
- [x] Abrir os planos diretamente após confirmar a foto, sem aviso intermediário.
- [x] Simplificar a escolha dos planos destacando preço e quantidade; testes aprovados e fluxo autenticado foto → planos → pagamento conferido no celular e computador, sem visualizar os vídeos.

- [x] Autoplay + loop em TODOS os vídeos (landing page e dashboard), sem botões de pausa/controles — componente AutoplayVideo com retentativas; verificado no navegador
- [x] Removidas integrações: Loops, Utmify (scripts do index.html + webhook + chamadas nas funções de pagamento), Google/Apple OAuth (botões e código de login social) — secrets LOOPS_API_KEY, UTMIFY_API_TOKEN, GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET apagados
- [x] META_CONVERSIONS_API_TOKEN, VOIDPAY_PUBLIC_KEY e VOIDPAY_SECRET_KEY atualizados pelo usuário
- [x] ACCESS_CODE_PEPPER mantido (chave interna do sistema de login, não é credencial de terceiro)
- [x] Migrations Drizzle limpas e set vazio rescaffoldado (DB já tem as 7 tabelas)
