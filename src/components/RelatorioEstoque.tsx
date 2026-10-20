import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Package,
  Layers,
  DollarSign,
  HardHat,
  Filter,
} from 'lucide-react';
import { InventoryState, Artigo, Movimentacao } from '../types/inventory';

interface RelatorioEstoqueProps {
  state: InventoryState;
}

export const RelatorioEstoque: React.FC<RelatorioEstoqueProps> = ({ state }) => {
  const [includeMovements, setIncludeMovements] = useState(true);
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const { artigos, movimentacoes, responsavelTecnico, unidadeSenai } = state;

  const filteredArtigos = artigos.filter((art) => {
    return filterTipo === 'all' || art.tipoId === filterTipo;
  });

  // KPI calculations
  const totalUnidades = filteredArtigos.reduce((sum, a) => sum + a.estoqueAtual, 0);
  const valorTotal = filteredArtigos.reduce((sum, a) => sum + a.estoqueAtual * (a.custoUnitario || 0), 0);
  const itensCriticos = filteredArtigos.filter((a) => a.estoqueAtual === 0).length;
  const itensBaixos = filteredArtigos.filter((a) => a.estoqueAtual > 0 && a.estoqueAtual <= a.estoqueMinimo).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Artigo',
      'Descrição Técnica',
      'Tipo',
      'Grupo',
      'Subgrupo',
      'Unidade',
      'Localização Física',
      'Saldo Atual',
      'Estoque Mínimo',
      'Custo Unitário (R$)',
      'Valor Total (R$)',
      'Status',
    ];

    const rows = filteredArtigos.map((art) => {
      const status =
        art.estoqueAtual === 0 ? 'SEM ESTOQUE' : art.estoqueAtual <= art.estoqueMinimo ? 'ABAIXO DO MÍNIMO' : 'REGULAR';
      return [
        art.codigo,
        `"${art.nome.replace(/"/g, '""')}"`,
        `"${art.descricao.replace(/"/g, '""')}"`,
        `"${art.tipoNome.replace(/"/g, '""')}"`,
        `"${art.grupoNome.replace(/"/g, '""')}"`,
        `"${art.subgrupoNome.replace(/"/g, '""')}"`,
        art.unidade,
        `"${art.localizacao.codigoCompleto.replace(/"/g, '""')}"`,
        art.estoqueAtual,
        art.estoqueMinimo,
        art.custoUnitario.toFixed(2),
        (art.estoqueAtual * art.custoUnitario).toFixed(2),
        status,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SENAI_SP_Relatorio_Estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SENAI_SP_Estoque_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const horaAtual = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="space-y-6">
      
      {/* Control Actions Bar (Hidden when printing) */}
      <div className="no-print bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#E30613] uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Documento Técnico Oficial de Controle Patrimonial</span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">
            Relatório de Posição de Estoque &amp; Rastreabilidade Física
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Emissão em layout oficial SENAI-SP com quantitativos, localização física, histórico e termo de responsabilidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Include Movements Toggle */}
          <label className="flex items-center gap-2 text-xs text-neutral-700 bg-neutral-100 px-3 py-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={includeMovements}
              onChange={(e) => setIncludeMovements(e.target.checked)}
              className="accent-[#E30613]"
            />
            <span>Incluir Histórico de Movimentações</span>
          </label>

          {/* Filter by Tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white"
          >
            <option value="all">Todos os Tipos ({state.tipos.length})</option>
            {state.tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.codigo} - {t.nome}
              </option>
            ))}
          </select>

          {/* CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-neutral-600" />
            <span>CSV</span>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-neutral-600" />
            <span>JSON Backup</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Body (A4 Printable Layout) */}
      <div className="print-container bg-white border border-neutral-300 rounded-xl p-8 shadow-sm text-neutral-900 font-sans">
        
        {/* Institutional Header */}
        <div className="border-b-2 border-[#E30613] pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#111111] text-white font-black text-xl flex items-center justify-center rounded-lg border-2 border-[#E30613]">
                SENAI
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-neutral-900 leading-tight">
                  SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL — SENAI-SP
                </h1>
                <p className="text-xs font-semibold text-[#E30613] uppercase tracking-wide">
                  SISGE — Sistema Integrado de Gestão e Controle de Estoques
                </p>
                <p className="text-xs text-neutral-500">
                  {unidadeSenai} · Divisão de Suprimentos Industriais e Pedagógicos
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-neutral-500">DOCUMENTO OFICIAL DE AUDITORIA</div>
              <div className="font-mono font-bold text-neutral-900">
                REL-ESTOQUE-{new Date().getFullYear()}-{String(artigos.length).padStart(3, '0')}
              </div>
              <div className="text-neutral-500">
                Data: <strong className="text-neutral-800">{dataAtual}</strong> às <strong className="text-neutral-800">{horaAtual}</strong>
              </div>
              <div className="text-neutral-500">
                Responsável Técnico: <strong className="text-neutral-900">{responsavelTecnico}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total de Artigos</span>
            <span className="font-mono font-bold text-lg text-neutral-900 tabular-nums">
              {filteredArtigos.length}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Saldo em Unidades</span>
            <span className="font-mono font-bold text-lg text-neutral-900 tabular-nums">
              {totalUnidades.toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Valor Patrimonial Total</span>
            <span className="font-mono font-bold text-lg text-[#E30613] tabular-nums">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Itens em Alerta de Mínimo</span>
            <span className="font-mono font-bold text-lg text-neutral-900 tabular-nums">
              {itensCriticos + itensBaixos} ({itensCriticos} zerados)
            </span>
          </div>
        </div>

        {/* Section 1: Posição Atual de Estoque */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-200 pb-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E30613]" />
              <span>1. Posição Atual de Estoque Detalhada ({filteredArtigos.length} itens)</span>
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              Classificação Hierárquica: Tipo / Grupo / Subgrupo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-300">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Material e Especificação Técnica Detalhada</th>
                  <th className="py-2.5 px-3">Hierarquia</th>
                  <th className="py-2.5 px-3">Localização Física</th>
                  <th className="py-2.5 px-2 text-center">Unid</th>
                  <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                  <th className="py-2.5 px-2 text-right">Est. Mín</th>
                  <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredArtigos.map((art, idx) => {
                  const valorItem = art.estoqueAtual * (art.custoUnitario || 0);
                  const isCritico = art.estoqueAtual === 0;
                  const isBaixo = art.estoqueAtual > 0 && art.estoqueAtual <= art.estoqueMinimo;

                  return (
                    <tr key={art.id} className="hover:bg-neutral-50">
                      {/* Código */}
                      <td className="py-2 px-3 align-top font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {art.codigo}
                      </td>

                      {/* Nome e Descrição Detalhada */}
                      <td className="py-2 px-3 align-top max-w-sm">
                        <div className="font-bold text-neutral-900 text-xs mb-0.5">
                          {idx + 1}. {art.nome}
                        </div>
                        <div className="text-neutral-600 text-[10px] leading-relaxed">
                          {art.descricao}
                        </div>
                      </td>

                      {/* Hierarquia */}
                      <td className="py-2 px-3 align-top whitespace-nowrap text-[10px]">
                        <div className="font-semibold text-neutral-800">{art.tipoNome}</div>
                        <div className="text-neutral-500">{art.grupoNome}</div>
                        <div className="text-neutral-400">{art.subgrupoNome}</div>
                      </td>

                      {/* Localização Física */}
                      <td className="py-2 px-3 align-top text-[10px]">
                        <div className="font-semibold text-neutral-800">{art.localizacao.setorAlmoxarifado}</div>
                        <div className="text-neutral-500">{art.localizacao.corredorEstante} · {art.localizacao.prateleiraGaveta}</div>
                        <div className="font-mono text-neutral-400">{art.localizacao.codigoCompleto}</div>
                      </td>

                      {/* Unidade */}
                      <td className="py-2 px-2 align-top text-center font-mono font-semibold">
                        {art.unidade}
                      </td>

                      {/* Saldo Atual */}
                      <td className="py-2 px-3 align-top text-right font-mono font-bold text-xs tabular-nums">
                        {art.estoqueAtual}
                      </td>

                      {/* Mínimo */}
                      <td className="py-2 px-2 align-top text-right font-mono text-neutral-500 tabular-nums">
                        {art.estoqueMinimo}
                      </td>

                      {/* Custo Unitário */}
                      <td className="py-2 px-3 align-top text-right font-mono text-neutral-700 tabular-nums">
                        R$ {art.custoUnitario.toFixed(2)}
                      </td>

                      {/* Valor Total */}
                      <td className="py-2 px-3 align-top text-right font-mono font-bold text-neutral-900 tabular-nums">
                        R$ {valorItem.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-2 align-top text-center whitespace-nowrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isCritico
                            ? 'bg-red-100 text-red-800'
                            : isBaixo
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isCritico ? 'ZERADO' : isBaixo ? 'BAIXO' : 'REGULAR'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Histórico de Movimentações (Optional in print view) */}
        {includeMovements && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-200 pb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E30613]" />
                <span>2. Histórico Consolidado de Movimentações Físicas ({movimentacoes.length} registros)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-300">
                    <th className="py-2 px-2">Registro</th>
                    <th className="py-2 px-2">Data/Hora</th>
                    <th className="py-2 px-2">Tipo</th>
                    <th className="py-2 px-3">Artigo / Código</th>
                    <th className="py-2 px-2 text-right">Qtd</th>
                    <th className="py-2 px-2 text-right">Saldo Ant. → Novo</th>
                    <th className="py-2 px-3">Documento Fiscal / Destino</th>
                    <th className="py-2 px-2">Responsável</th>
                    <th className="py-2 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td className="py-1.5 px-2 font-mono font-bold text-neutral-900">
                        {mov.codigo}
                      </td>
                      <td className="py-1.5 px-2 text-neutral-600 whitespace-nowrap">
                        {new Date(mov.dataHora).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-1.5 px-2 font-bold">
                        <span className={mov.tipo === 'ENTRADA' ? 'text-emerald-700' : 'text-red-700'}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-1.5 px-3">
                        <span className="font-semibold text-neutral-900">{mov.artigoNome}</span>
                        <span className="text-neutral-500 font-mono text-[9px] block">{mov.artigoCodigo}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold tabular-nums">
                        {mov.tipo === 'ENTRADA' ? `+${mov.quantidade}` : `-${mov.quantidade}`}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-neutral-600">
                        {mov.saldoAnterior} → {mov.saldoNovo}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="font-semibold">{mov.documentoReferencia}</div>
                        <div className="text-neutral-500 text-[9px]">{mov.origemDestino}</div>
                      </td>
                      <td className="py-1.5 px-2 font-semibold text-neutral-800">
                        {mov.responsavel}
                      </td>
                      <td className="py-1.5 px-3 text-neutral-600 max-w-xs">
                        {mov.observacoes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Termo de Homologação e Assinatura Técnica */}
        <div className="mt-12 pt-6 border-t-2 border-neutral-300">
          <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            3. Termo de Conferência e Responsabilidade Técnica
          </div>
          <p className="text-[11px] text-neutral-600 leading-relaxed mb-8">
            Declaro para os devidos fins de controle patrimonial e prestação de contas do SENAI-SP que a contagem física dos materiais relacionados neste relatório confere integralmente com os saldos apurados no SISGE, respeitadas as localizações de armazenamento e os critérios técnicos de inspeção.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
            <div>
              <div className="border-b border-neutral-900 w-64 mb-1"></div>
              <div className="text-xs font-bold text-neutral-900 uppercase">
                {responsavelTecnico}
              </div>
              <div className="text-[11px] text-neutral-600">
                Responsável Técnico pelo Controle de Estoques &amp; Almoxarifado
              </div>
              <div className="text-[10px] text-neutral-500">
                {unidadeSenai}
              </div>
            </div>

            <div className="text-right text-[10px] text-neutral-400 space-y-1">
              <div>Autenticação Digital SISGE SENAI-SP: <span className="font-mono">SENAI-AUTH-{Date.now().toString(16).toUpperCase()}</span></div>
              <div>Auditoria Conforme Normas Internas de Gestão de Materiais e Logística SENAI</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
