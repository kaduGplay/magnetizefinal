# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)


## Deploy na Vercel

O frontend é estático (Vite/React). A autenticação, os dados e o PIX continuam nas Edge Functions do projeto Supabase existente; a Vercel hospeda o frontend e as mídias em `public/`.

1. Envie esta pasta para um repositório e importe-o na Vercel, com a raiz do projeto apontando para esta pasta. Alternativamente, execute `npx vercel` na raiz após configurar as variáveis no projeto Vercel.
2. Em **Settings → Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os mesmos valores do `.env` local, para Production e Preview. Use apenas a chave pública do projeto. Não envie o `.env` ao repositório nem use chaves secretas em variáveis `VITE_`.
3. O `vercel.json` define Vite, Node 22 (via `package.json`), instalação com `npm ci`, build com `npm run build` e saída `dist`. As rotas da aplicação usam `index.html`; mídias, fontes e assets mantêm suas URLs de arquivo.
4. Faça o deploy. Ao mudar variáveis de ambiente, gere um novo deploy: o Vite incorpora os valores durante o build.
5. No Supabase Auth, configure o domínio final como **Site URL** e adicione os endereços usados para retorno de autenticação à lista de Redirect URLs. Isso é necessário para links de confirmação e recuperação de conta. Os provedores Google e Apple não são exibidos na interface.
6. Confira a landing, acesso direto e atualização de `/dashboard`, `/auth` e `/checkout`, reprodução dos vídeos e login com e-mail. Valide o PIX somente com uma transação de teste autorizada.

Para validar localmente: `npm ci`, `npm test`, `npm run build` e `npm run preview`. Copie `.env.example` para `.env` e preencha os dois valores antes do build. As funções e os segredos do backend permanecem no Supabase; não são implantados pelo build da Vercel.

## Painel de análise `/analise`

O painel público mostra visitantes online (última atividade até 60 segundos), visitantes únicos nas últimas 2h e 4h e até 200 acessos recentes. Atualiza a cada 15 segundos; cada navegador visível envia atividade a cada 20 segundos. Várias abas do mesmo navegador usam o mesmo identificador. Não são pessoas identificadas nem contagens de todas as visualizações: cada linha mostra a última atividade de um navegador. A página de análise não entra na contagem.

Para ativar no projeto Supabase deste site:

1. Execute `supabase/sql/site_analytics.sql` no SQL Editor do projeto `lyrhdqogpkflgaszbrhp`. A tabela tem RLS e acesso direto restrito ao backend.
2. Publique a Edge Function `site-analytics` com verificação JWT desativada conforme `supabase/config.toml`. A função permite coleta e leitura pública de métricas anônimas, conforme solicitado; não retorna dados de contas, fotos, pagamentos ou IPs.
3. Configure `VITE_ANALYTICS_ENABLED=true` na Vercel em Production e faça um novo deploy. Até essa configuração, nenhuma coleta é enviada e o painel informa que ainda não foi ativado.
4. Abra o site em outro navegador, confira a atualização do painel e o desaparecimento do online cerca de 60 segundos após fechar a aba. As janelas de 2h e 4h começam a acumular dados após a ativação, sem recuperar visitas anteriores.

A função registra horários do servidor e normaliza os caminhos, removendo query strings e identificadores das subrotas. Registros inativos há mais de 24h são limpos periodicamente durante a coleta. Se o backend falhar, o painel informa a indisponibilidade em vez de mostrar números inventados. Este painel mede presença; não confirma gerações nem pagamentos.
