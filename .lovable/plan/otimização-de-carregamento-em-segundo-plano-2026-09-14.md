# Otimização de carregamento em segundo plano

## Objetivo
Deixar a primeira tela rápida e, logo após ela estabilizar, preparar dashboard, imagens, banners e vídeos para que as próximas telas abram sem espera perceptível.

## Implementação
- Manter somente o vídeo principal e a marca como prioridade imediata, evitando disputar internet com a primeira tela.
- Carregar os arquivos das próximas páginas em segundo plano assim que o navegador estiver livre.
- Criar uma fila progressiva e sem downloads duplicados: imagens e banner primeiro; vídeos depois, com baixa concorrência no celular.
- Respeitar economia de dados e conexões lentas, reduzindo a quantidade de downloads simultâneos para não travar o site.
- Incluir todos os vídeos e modelos usados na dashboard na preparação em segundo plano.
- Trocar o banner GIF pesado pela versão em vídeo já existente, preservando o visual e reduzindo o volume transferido.
- Ajustar atributos de carregamento e decodificação para evitar saltos, travamentos e trabalho desnecessário fora da tela.

## Validação
- Confirmar que a primeira tela continua aparecendo rapidamente em viewport de telefone.
- Verificar que dashboard, banner, imagens e vídeos são solicitados em segundo plano depois da primeira renderização.
- Confirmar ausência de downloads duplicados, erros de console e erros de compilação.
