import { useEffect } from "react";
import { Link } from "react-router-dom";

const Privacy = () => {
  useEffect(() => {
    document.title = "Política de Privacidade | Magnetize";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Política de Privacidade da Magnetize: como coletamos, usamos e protegemos seus dados.");
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-5 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Voltar para a Magnetize
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 27 de agosto de 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Quem somos</h2>
          <p className="text-muted-foreground">
            A Magnetize (magnetize.site) é uma plataforma de geração de imagens e vídeos por inteligência
            artificial. Esta política explica quais dados coletamos, por que coletamos e como você pode
            controlá-los.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Dados que coletamos</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Acesso:</strong> armazenamos somente o identificador interno,
              o resumo criptográfico do código individual e os dados necessários de sessão. Não solicitamos
              nome, e-mail ou perfil social para acessar a plataforma.
            </li>
            <li>
              <strong className="text-foreground">Conteúdo enviado:</strong> imagens que você envia para
              gerar resultados, usadas exclusivamente para produzir a sua geração.
            </li>
            <li>
              <strong className="text-foreground">Pagamentos:</strong> dados de transação processados por
              provedores de pagamento. Não armazenamos dados completos de cartão.
            </li>
            <li>
              <strong className="text-foreground">Uso e dispositivo:</strong> páginas visitadas, eventos de
              uso, tipo de dispositivo e navegador, para segurança e melhoria do produto.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Como usamos os dados</h2>
          <p className="text-muted-foreground">
            Usamos os dados necessários para autenticar seu código, processar gerações, gerenciar créditos e
            planos, prevenir fraudes e melhorar a plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Compartilhamento</h2>
          <p className="text-muted-foreground">
            Compartilhamos dados apenas com fornecedores necessários para operar o serviço (hospedagem,
            banco de dados, processamento de IA, pagamentos e análise de uso) e quando exigido por
            lei. Não vendemos seus dados pessoais.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Retenção e exclusão</h2>
          <p className="text-muted-foreground">
            Mantemos os dados necessários enquanto seu acesso estiver ativo. Você pode solicitar a exclusão do acesso e
            dos dados associados a qualquer momento pelo e-mail de suporte; a remoção é feita em até 30 dias,
            exceto quando a retenção for exigida por obrigação legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Seus direitos</h2>
          <p className="text-muted-foreground">
            Conforme a LGPD, você pode solicitar acesso, correção, portabilidade, anonimização ou exclusão
            dos seus dados, além de revogar consentimentos. Para exercer esses direitos, entre em contato
            com nosso suporte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Segurança</h2>
          <p className="text-muted-foreground">
            Usamos criptografia em trânsito, controles de acesso e políticas de segurança em nível de banco
            de dados para proteger seus dados. Nenhum sistema é totalmente imune, mas trabalhamos
            continuamente para reduzir riscos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Menores de idade</h2>
          <p className="text-muted-foreground">
            A plataforma é destinada exclusivamente a pessoas maiores de 18 anos. Não coletamos dados de
            menores de idade intencionalmente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Alterações</h2>
          <p className="text-muted-foreground">
            Podemos atualizar esta política. Mudanças relevantes serão comunicadas nesta página com nova
            data de atualização.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Contato</h2>
          <p className="text-muted-foreground">
            Dúvidas sobre privacidade: <span className="text-foreground">suporte@magnetize.site</span>
          </p>
        </section>

        <footer className="pt-4 text-sm text-muted-foreground">
          Veja também os{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Termos de Serviço
          </Link>
          .
        </footer>
      </div>
    </main>
  );
};

export default Privacy;
