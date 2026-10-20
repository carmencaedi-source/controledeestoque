import React from 'react';
import { ShieldCheck, HardHat, Database } from 'lucide-react';

interface FooterProps {
  responsavelTecnico: string;
  unidadeSenai: string;
  totalItens: number;
  totalMovimentacoes: number;
}

export const Footer: React.FC<FooterProps> = ({
  responsavelTecnico,
  unidadeSenai,
  totalItens,
  totalMovimentacoes,
}) => {
  return (
    <footer className="mt-16 bg-[#111111] text-white border-t-4 border-[#E30613]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Institutional & App Identity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-black tracking-tight text-white">
                SISGE <span className="text-[#E30613]">SENAI-SP</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sistema Integrado de Gestão de Estoque e Almoxarifado Industrial. Desenvolvido para controle de insumos, matérias-primas e ferramentas dos cursos técnicos e laboratórios do SENAI São Paulo.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#E30613]"></span>
              <span>{unidadeSenai}</span>
            </div>
          </div>

          {/* Column 2: Responsável Técnico (Mandatory requirement) */}
          <div className="border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-8">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-[#E30613]" />
              Responsabilidade Técnica
            </h4>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <div className="text-sm font-bold text-white mb-0.5">
                {responsavelTecnico}
              </div>
              <div className="text-xs text-neutral-400 font-medium">
                Responsável Técnica pelo Controle de Estoques &amp; Almoxarifado
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                Homologação técnica e auditoria de movimentações industriais SENAI-SP
              </div>
            </div>
          </div>

          {/* Column 3: Persistence & Database Structure */}
          <div className="border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-8">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#E30613]" />
              Estrutura &amp; Persistência
            </h4>
            <ul className="text-xs text-neutral-400 space-y-1.5 font-mono">
              <li className="flex justify-between">
                <span>Persistência Ativa:</span>
                <span className="text-neutral-200">Local JSON + Nuvem</span>
              </li>
              <li className="flex justify-between">
                <span>Artigos Ativos:</span>
                <span className="text-neutral-200 tabular-nums">{totalItens} cadastrados</span>
              </li>
              <li className="flex justify-between">
                <span>Registros de Movimentação:</span>
                <span className="text-neutral-200 tabular-nums">{totalMovimentacoes} logs</span>
              </li>
              <li className="flex justify-between">
                <span>Codificação Hierárquica:</span>
                <span className="text-neutral-200">Tipo → Grupo → Sub → Art</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal line */}
        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
          <div>
            © {new Date().getFullYear()} SENAI-SP · Serviço Nacional de Aprendizagem Industrial. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Padrão Corporativo de Gestão de Materiais Industriais</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
