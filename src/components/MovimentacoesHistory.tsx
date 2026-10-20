import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Calendar,
  FileSpreadsheet,
  Download,
  Filter,
} from 'lucide-react';
import { Movimentacao } from '../types/inventory';

interface MovimentacoesHistoryProps {
  movimentacoes: Movimentacao[];
  onOpenNovaMovimentacao: () => void;
}

export const MovimentacoesHistory: React.FC<MovimentacoesHistoryProps> = ({
  movimentacoes,
  onOpenNovaMovimentacao,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'all' | 'ENTRADA' | 'SAIDA'>('all');

  const filteredMovs = useMemo(() => {
    return movimentacoes.filter((mov) => {
      const matchSearch =
        searchTerm === '' ||
        mov.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.artigoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.artigoCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.documentoReferencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.origemDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo = filterTipo === 'all' || mov.tipo === filterTipo;

      return matchSearch && matchTipo;
    });
  }, [movimentacoes, searchTerm, filterTipo]);

  const handleExportCSV = () => {
    const headers = [
      'Código Registro',
      'Data/Hora',
      'Tipo',
      'Código Artigo',
      'Artigo',
      'Quantidade',
      'Saldo Anterior',
      'Saldo Novo',
      'Documento',
      'Origem/Destino',
      'Responsável',
      'Observações',
    ];

    const rows = filteredMovs.map((m) => [
      m.codigo,
      new Date(m.dataHora).toLocaleString('pt-BR'),
      m.tipo,
      m.artigoCodigo,
      `"${m.artigoNome.replace(/"/g, '""')}"`,
      m.quantidade,
      m.saldoAnterior,
      m.saldoNovo,
      `"${m.documentoReferencia.replace(/"/g, '""')}"`,
      `"${m.origemDestino.replace(/"/g, '""')}"`,
      m.responsavel,
      `"${m.observacoes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SENAI_SP_Historico_Movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Controls */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E30613] uppercase tracking-wider mb-1">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Livro Fiscal e Físico de Almoxarifado</span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              Histórico Completo de Entradas e Saídas
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Auditoria permanente de movimentações físicas de materiais com saldo anterior, novo saldo e documento de rastreio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredMovs.length === 0}
              className="px-3.5 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-neutral-600" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onOpenNovaMovimentacao}
              className="px-4 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Nova Movimentação</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-neutral-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar movimentação por código, artigo, documento, destino ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E30613] bg-white"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              onClick={() => setFilterTipo('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterTipo === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todas ({movimentacoes.length})
            </button>
            <button
              onClick={() => setFilterTipo('ENTRADA')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterTipo === 'ENTRADA' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Entradas
            </button>
            <button
              onClick={() => setFilterTipo('SAIDA')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterTipo === 'SAIDA' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Saídas
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      {filteredMovs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-2xs">
          <ArrowLeftRight className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h4 className="font-bold text-neutral-900 text-base mb-1">
            Nenhuma Movimentação Registrada
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            Registre entradas ou saídas de materiais para alimentar a rastreabilidade do estoque.
          </p>
          <button
            onClick={onOpenNovaMovimentacao}
            className="px-4 py-2 bg-[#E30613] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Registrar Movimentação
          </button>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100/75 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Registro / Data</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-4">Artigo / Código</th>
                  <th className="py-3 px-3 text-right">Qtd</th>
                  <th className="py-3 px-3 text-right">Saldo Ant. → Novo</th>
                  <th className="py-3 px-3">Doc / Origem / Destino</th>
                  <th className="py-3 px-3">Responsável</th>
                  <th className="py-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredMovs.map((mov) => {
                  const isEntrada = mov.tipo === 'ENTRADA';
                  const dateStr = new Date(mov.dataHora).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={mov.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Registro e Data */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-neutral-900 text-[11px]">
                          {mov.codigo}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Tipo de Movimento */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded ${
                          isEntrada
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isEntrada ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                          )}
                          <span>{mov.tipo}</span>
                        </span>
                      </td>

                      {/* Artigo */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <div className="font-bold text-neutral-900 text-xs">
                          {mov.artigoNome}
                        </div>
                        <div className="font-mono text-[11px] text-neutral-500 mt-0.5">
                          {mov.artigoCodigo}
                        </div>
                      </td>

                      {/* Quantidade */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap font-mono tabular-nums">
                        <span className={`text-sm font-black ${
                          isEntrada ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {isEntrada ? '+' : '−'}
                          {mov.quantidade}
                        </span>
                      </td>

                      {/* Saldo Anterior e Novo */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap font-mono tabular-nums text-xs">
                        <span className="text-neutral-500">{mov.saldoAnterior}</span>
                        <span className="text-neutral-400 mx-1">→</span>
                        <strong className="text-neutral-900">{mov.saldoNovo}</strong>
                      </td>

                      {/* Doc / Origem / Destino */}
                      <td className="py-3 px-3 align-top max-w-xs">
                        <div className="font-semibold text-neutral-800 text-xs">
                          {mov.documentoReferencia}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {mov.origemDestino}
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="font-semibold text-neutral-900 text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {mov.responsavel}
                        </span>
                      </td>

                      {/* Observações */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <span className="text-neutral-600 text-[11px] leading-relaxed line-clamp-2 hover:line-clamp-none">
                          {mov.observacoes || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
