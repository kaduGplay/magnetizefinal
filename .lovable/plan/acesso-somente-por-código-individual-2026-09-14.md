# Acesso somente por código individual

## Resultado
- Remover cadastro, e-mail, senha, Google e Apple das telas públicas.
- Exibir apenas um campo de código de acesso na entrada.
- Manter cada código ligado ao mesmo cliente para preservar créditos, plano e compras.
- Após um código válido, levar diretamente à dashboard; após sair, pedir o código novamente.

## Experiência
- Trocar o modal atual por uma tela simples de “Digite seu código de acesso”.
- No fim do funil da página inicial, abrir essa mesma tela em vez de criar conta.
- Atualizar “Minha conta” para mostrar e copiar o código mascarado, sem nome, e-mail ou perfil.
- Ajustar mensagens, caminhos e botões que ainda falam em cadastro ou login.

## Segurança e dados
- Guardar somente a versão protegida de cada código, nunca o código puro.
- Validar o código exclusivamente no backend, com proteção contra tentativas repetidas.
- Emitir uma sessão de acesso revogável para evitar confiar apenas em dados salvos no aparelho.
- Vincular a sessão ao cliente existente para manter créditos e pagamentos.
- Fechar leituras públicas de clientes, créditos, planos e pagamentos que hoje podem expor dados entre usuários.

## Compatibilidade
- Preservar os registros atuais de clientes e transações.
- Manter checkout, confirmação PIX, créditos e plano vitalício funcionando com a identidade vinculada ao código.
- Preparar a criação/ativação de códigos individuais sem reintroduzir formulário de perfil.

## Verificação
- Testar código inválido, código válido, recarregamento, saída, dashboard e checkout.
- Conferir funcionamento em telefone e desktop, além de erros de execução e compilação.
