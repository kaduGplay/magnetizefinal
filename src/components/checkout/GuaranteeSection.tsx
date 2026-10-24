import { Shield, CheckCircle } from "lucide-react";

const GuaranteeSection = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
          <Shield className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-300">Garantia Incondicional</h3>
          <p className="text-xs text-emerald-400/70">Sua satisfação ou seu dinheiro de volta</p>
        </div>
      </div>
      
      <p className="text-sm text-emerald-200/80 leading-relaxed mb-4">
        A <strong className="text-emerald-300">Magnetize IA</strong> oferece garantia incondicional em todos os seus planos. 
        Caso você gere seu vídeo e não fique satisfeito com o resultado, você pode solicitar o reembolso diretamente pelo seu perfil.
      </p>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-emerald-300/90">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Reembolso em até 7 dias</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-300/90">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Processo 100% automatizado</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-300/90">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Acesse pelo menu "Minha Conta"</span>
        </div>
      </div>
    </div>
  );
};

export default GuaranteeSection;
