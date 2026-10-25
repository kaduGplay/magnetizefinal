import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowLeft, Clock3, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyticsEnabled, analyticsRequest, type AnalyticsSnapshot } from "@/lib/siteAnalytics";

const time = (value: string) => new Date(value).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function Analysis() {
  const [hours, setHours] = useState<2 | 4>(2);
  const snapshot = useQuery<AnalyticsSnapshot>({
    queryKey: ["site-analytics", hours],
    enabled: analyticsEnabled,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    retry: false,
    queryFn: async ({ signal }) => {
      return analyticsRequest({ action: "snapshot", hours }, undefined, signal);
    },
  });
  const data = snapshot.error ? undefined : snapshot.data;
  const cards = [
    { label: "Online agora", value: data?.online, detail: "Atividade nos últimos 60 segundos", icon: Activity, live: true },
    { label: "Últimas 2 horas", value: data?.last2Hours, detail: "Visitantes únicos no período", icon: Users, live: false },
    { label: "Últimas 4 horas", value: data?.last4Hours, detail: "Visitantes únicos no período", icon: Clock3, live: false },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Magnetize</Link>
          <span className="flex items-center gap-2 text-xs text-muted-foreground"><Activity size={15} /> Tráfego ao vivo</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-7 px-5 py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Magnetize / Análise</p><h1 className="text-3xl font-bold tracking-tight">Atividade do site</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe quem está online e os acessos recentes.</p></div>
          {analyticsEnabled && <Button variant="outline" onClick={() => void snapshot.refetch()} disabled={snapshot.isFetching}><RefreshCw size={15} className={snapshot.isFetching ? "animate-spin" : ""} />Atualizar</Button>}
        </div>
        {!analyticsEnabled ? (
          <div role="status" className="rounded-2xl border border-border bg-card p-8"><h2 className="text-lg font-semibold">Coleta ainda não ativada</h2><p className="mt-2 text-sm text-muted-foreground">Os dados aparecerão após a ativação da análise. Nenhum histórico anterior será estimado.</p></div>
        ) : <>
          {snapshot.error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">{snapshot.error.message}</div>}
          <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, detail, icon: Icon, live }) => <section key={label} className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><h2 className="text-sm text-muted-foreground">{label}</h2><Icon size={19} className={live ? "text-emerald-400" : "text-primary"} /></div><p className="my-4 text-4xl font-bold tabular-nums">{value === undefined ? "—" : value.toLocaleString("pt-BR")}</p><p className="text-xs text-muted-foreground">{detail}</p></section>)}</div>
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-5"><div><h2 className="font-semibold">Últimos acessos</h2><p className="mt-1 text-xs text-muted-foreground">Até 200 visitantes, ordenados pela última atividade.</p></div><div className="flex gap-2">{([2, 4] as const).map((window) => <Button key={window} size="sm" variant={hours === window ? "default" : "outline"} aria-pressed={hours === window} onClick={() => setHours(window)}>Últimas {window}h</Button>)}</div></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/30 text-xs text-muted-foreground"><tr><th className="px-5 py-3">Visitante</th><th className="px-5 py-3">Última página</th><th className="px-5 py-3">Última atividade</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{data?.visitors.map((visitor) => {
              const online = Date.parse(data.generatedAt) - Date.parse(visitor.lastSeen) <= 60_000;
              return <tr key={visitor.id} className="border-t border-border"><td className="px-5 py-4 font-mono text-xs">{visitor.id.slice(0, 8)}</td><td className="px-5 py-4">{visitor.path}</td><td className="whitespace-nowrap px-5 py-4 tabular-nums">{time(visitor.lastSeen)}</td><td className="px-5 py-4"><span className={online ? "text-emerald-400" : "text-muted-foreground"}>{online ? "Online" : "Recente"}</span></td></tr>;
            })}</tbody></table></div>
            {!data ? <p role="status" className="p-8 text-center text-sm text-muted-foreground">{snapshot.isFetching ? "Buscando atividade…" : "Sem dados disponíveis."}</p> : data.visitors.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhum visitante registrado neste período.</p>}
          </section>
          <p className="text-xs leading-relaxed text-muted-foreground">Atualização automática a cada 15 segundos{data && ` · Última atualização ${time(data.generatedAt)}`} · Horário de Brasília.<br />Cada navegador conta como um visitante; várias abas não duplicam a contagem. A coleta registra somente atividade e página, sem fotos, nomes ou dados de pagamento.</p>
        </>}
      </main>
    </div>
  );
}
