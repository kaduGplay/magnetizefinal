# Funil inicial após o envio da foto

## Objetivo
Ao enviar uma foto na página inicial, a pessoa confirma a imagem, escolhe se quer criar uma foto ou um vídeo, vê somente os modelos daquela opção e segue por todo o funil até o acesso.

## Alterações
- Manter a confirmação da foto e da maioridade imediatamente após o envio.
- Abrir a escolha entre **Imagem** e **Vídeo** depois da confirmação.
- Exibir os modelos correspondentes à opção selecionada, preservando a foto confirmada no topo.
- Ao tocar em um modelo, seguir por **carregamento → prévia protegida/borrada → criação de conta ou entrada → dashboard**.
- Registrar escolha, carregamento e resultado como etapas separadas no acompanhamento do funil.
- Evitar pedir a mesma foto novamente durante esse fluxo.

## Detalhes técnicos
- Conectar o seletor de modelos já existente ao fluxo inicial da landing.
- Guardar temporariamente a foto e o modelo escolhidos apenas no estado da tela.
- Usar a mídia do modelo escolhido na prévia protegida e indicar corretamente se o resultado é imagem ou vídeo.
- Preservar o fluxo atual da dashboard e as regras existentes de consentimento, autenticação e compras.

## Validação
- Testar no tamanho de celular: upload, confirmação, troca entre Imagem/Vídeo, seleção de modelo, carregamento, prévia e abertura do acesso.
- Conferir que a foto e os modelos não ficam cortados e que não há erros na página.
