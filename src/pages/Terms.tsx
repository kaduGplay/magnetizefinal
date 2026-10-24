import { useEffect } from "react";
import { Link } from "react-router-dom";

const Terms = () => {
  useEffect(() => {
    document.title = "Termos de Serviço | Magnetize";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Termos de Serviço da Magnetize: regras de uso, planos, créditos e responsabilidades.");
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-5 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Voltar para a Magnetize
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Termos de Serviço</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 27 de agosto de 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Aceitação</h2>
          <p className="text-muted-foreground">
            Ao criar ou acessar sua conta na Magnetize (magnetize.site), você concorda com estes Termos de
            Serviço e com a nossa Política de Privacidade. Se não concordar, não utilize a plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Elegibilidade</h2>
          <p className="text-muted-foreground">
            O serviço é destinado exclusivamente a pessoas maiores de 18 anos. Ao usar a plataforma, você
            declara ter idade legal e capacidade civil para contratar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. O serviço</h2>
          <p className="text-muted-foreground">
            A Magnetize gera imagens e vídeos a partir de modelos de inteligência artificial e do conteúdo
            enviado pelo usuário. Os resultados são gerados automaticamente e podem variar em qualidade e
            fidelidade.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Código e segurança</h2>
          <p className="text-muted-foreground">
            Você é responsável pelo seu código e por toda atividade realizada com ele. Não
            compartilhe seu acesso. Podemos suspender códigos com indícios de fraude ou uso abusivo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Uso aceitável</h2>
          <p className="text-muted-foreground">É proibido usar a plataforma para:</p>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Enviar imagens de menores de idade, em qualquer contexto;</li>
            <li>Enviar imagens de terceiros sem consentimento expresso dessas pessoas;</li>
            <li>Criar conteúdo ilegal, difamatório, de assédio, ódio ou que viole direitos de terceiros;</li>
            <li>Burlar limites técnicos, revender acesso ou automatizar o serviço sem autorização.</li>
          </ul>
          <p className="text-muted-foreground">
            O descumprimento pode levar ao encerramento imediato do acesso, sem reembolso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Responsabilidade pelo conteúdo</h2>
          <p className="text-muted-foreground">
            Você é o único responsável pelo conteúdo que envia e pelo uso que faz dos resultados gerados,
            inclusive por obter as autorizações necessárias e respeitar a legislação aplicável.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Planos, créditos e pagamentos</h2>
          <p className="text-muted-foreground">
            O acesso pode ser adquirido por pacotes de créditos ou por plano de acesso vitalício. Cada
            geração consome créditos conforme indicado na plataforma. Créditos não são transferíveis nem
            conversíveis em dinheiro. Pagamentos são processados por parceiros externos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Reembolso</h2>
          <p className="text-muted-foreground">
            Por se tratar de produto digital de entrega imediata, você pode solicitar o cancelamento em até
            7 dias da compra, conforme o Código de Defesa do Consumidor, desde que os créditos adquiridos não
            tenham sido utilizados. Créditos já consumidos não são reembolsáveis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Propriedade intelectual</h2>
          <p className="text-muted-foreground">
            A marca, o software e os elementos visuais da plataforma pertencem à Magnetize. Você mantém os
            direitos sobre o conteúdo que envia e recebe uma licença de uso pessoal sobre os resultados
            gerados, respeitados estes Termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Disponibilidade e limitação</h2>
          <p className="text-muted-foreground">
            O serviço é fornecido "como está". Podemos alterar, suspender ou descontinuar recursos.
            Na medida permitida por lei, não respondemos por danos indiretos, lucros cessantes ou perda de
            dados decorrentes do uso da plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Encerramento</h2>
          <p className="text-muted-foreground">
            Você pode encerrar seu acesso a qualquer momento. Podemos encerrá-lo ou suspendê-lo em caso
            de violação destes Termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Lei aplicável e contato</h2>
          <p className="text-muted-foreground">
            Estes Termos são regidos pelas leis brasileiras. Contato:{" "}
            <span className="text-foreground">suporte@magnetize.site</span>
          </p>
        </section>

        <footer className="pt-4 text-sm text-muted-foreground">
          Veja também a{" "}
          <Link to="/politic" className="text-primary hover:underline">
            Política de Privacidade
          </Link>
          .
        </footer>
      </div>
    </main>
  );
};

export default Terms;
