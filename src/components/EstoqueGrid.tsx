import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  MapPin,
  Tag,
  DollarSign,
  Package,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Artigo, Tipo, Grupo, Subgrupo } from '../types/inventory';

interface EstoqueGridProps {
  artigos: Artigo[];
  tipos: Tipo[];
  grupos: Grupo[];
  subgrupos: Subgrupo[];
  onOpenNovoArtigo: () => void;
  onOpenEntrada: (artigo: Artigo) => void;
  onOpenSaida: (artigo: Artigo) => void;
  onEditArtigo: (artigo: Artigo) => void;
  onDeleteArtigo: (artigoId: string) => void;
  onSeedVerification: () => void;
}

export const EstoqueGrid: React.FC<EstoqueGridProps> = ({
  artigos,
  tipos,
  grupos,
  subgrupos,
  onOpenNovoArtigo,
  onOpenEntrada,
  onOpenSaida,
  onEditArtigo,
  onDeleteArtigo,
  onSeedVerification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'normal' | 'baixo' | 'zerado'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'codigo' | 'nome' | 'estoque' | 'valor'>('codigo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // KPI Calculations
  const stats = useMemo(() => {
    let totalUnidades = 0;
    let valorTotal = 0;
    let itensCriticos = 0;
    let itensBaixos = 0;

    artigos.forEach((art) => {
      totalUnidades += art.estoqueAtual;
      valorTotal += art.estoqueAtual * (art.custoUnitario || 0);
      if (art.estoqueAtual === 0) {
        itensCriticos++;
      } else if (art.estoqueAtual <= art.estoqueMinimo) {
        itensBaixos++;
      }
    });

    return {
      totalArtigos: artigos.length,
      totalUnidades,
      valorTotal,
      itensCriticos,
      itensBaixos,
      alertaTotal: itensCriticos + itensBaixos,
    };
  }, [artigos]);

  // Filtered and Sorted Artigos
  const filteredArtigos = useMemo(() => {
    return artigos
      .filter((art) => {
        // Search term
        const matchSearch =
          searchTerm === '' ||
          art.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.tipoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.grupoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.localizacao.codigoCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.localizacao.setorAlmoxarifado.toLowerCase().includes(searchTerm.toLowerCase());

        // Tipo filter
        const matchTipo = selectedTipo === 'all' || art.tipoId === selectedTipo;

        // Status filter
        let matchStatus = true;
        if (selectedStatus === 'zerado') {
          matchStatus = art.estoqueAtual === 0;
        } else if (selectedStatus === 'baixo') {
          matchStatus = art.estoqueAtual > 0 && art.estoqueAtual <= art.estoqueMinimo;
        } else if (selectedStatus === 'normal') {
          matchStatus = art.estoqueAtual > art.estoqueMinimo;
        }

        return matchSearch && matchTipo && matchStatus;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'codigo') {
          compare = a.codigo.localeCompare(b.codigo);
        } else if (sortBy === 'nome') {
          compare = a.nome.localeCompare(b.nome);
        } else if (sortBy === 'estoque') {
          compare = a.estoqueAtual - b.estoqueAtual;
        } else if (sortBy === 'valor') {
          compare = a.estoqueAtual * a.custoUnitario - b.estoqueAtual * b.custoUnitario;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [artigos, searchTerm, selectedTipo, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (field: 'codigo' | 'nome' | 'estoque' | 'valor') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total de Artigos */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Artigos</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 font-mono tabular-nums">
              {stats.totalArtigos}
            </span>
            <span className="text-xs text-neutral-500">itens cadastrados</span>
          </div>
        </div>

        {/* KPI 2: Quantidade Física */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo em Estoque</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 font-mono tabular-nums">
              {stats.totalUnidades.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-neutral-500">unidades totais</span>
          </div>
        </div>

        {/* KPI 3: Valor Total */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Valor do Acervo</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 font-mono tabular-nums">
              R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* KPI 4: Alertas de Mínimo */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'baixo' ? 'all' : 'baixo')}
          className={`border rounded-xl p-4 shadow-2xs cursor-pointer transition-colors ${
            stats.alertaTotal > 0
              ? 'bg-red-50/50 border-red-200 hover:bg-red-50'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${stats.alertaTotal > 0 ? 'text-red-700' : ''}`}>
              Abaixo do Mínimo
            </span>
            <AlertTriangle className={`w-4 h-4 ${stats.alertaTotal > 0 ? 'text-[#E30613]' : 'text-neutral-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tabular-nums ${stats.alertaTotal > 0 ? 'text-[#E30613]' : 'text-neutral-900'}`}>
              {stats.alertaTotal}
            </span>
            <span className="text-xs text-neutral-500">
              ({stats.itensCriticos} zerados · {stats.itensBaixos} baixos)
            </span>
          </div>
        </div>

      </div>

      {/* Control Bar: Search, Filters, View Toggles */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, material, descrição, localização ou grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:border-transparent bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter: Tipo */}
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="text-xs font-medium border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E30613]"
            >
              <option value="all">Todos os Tipos ({tipos.length})</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo} - {t.nome}
                </option>
              ))}
            </select>

            {/* Filter: Status Segmented Controls */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedStatus('normal')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'normal' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setSelectedStatus('baixo')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'baixo' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Baixo
              </button>
              <button
                onClick={() => setSelectedStatus('zerado')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'zerado' ? 'bg-white text-red-600 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Zerado
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                }`}
              >
                Cards
              </button>
            </div>

            {/* Button: Novo Artigo */}
            <button
              onClick={onOpenNovoArtigo}
              className="px-3.5 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Artigo</span>
            </button>

          </div>

        </div>

        {/* Active Filters Bar / Results Count */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <div>
            <span>Exibindo </span>
            <strong className="text-neutral-900 font-mono tabular-nums">{filteredArtigos.length}</strong>
            <span> de </span>
            <strong className="text-neutral-900 font-mono tabular-nums">{artigos.length}</strong>
            <span> artigos cadastrados</span>
            {selectedTipo !== 'all' && <span className="ml-2 text-neutral-400">· Filtro por Tipo ativo</span>}
            {selectedStatus !== 'all' && <span className="ml-2 text-neutral-400">· Filtro por Status ativo</span>}
          </div>
          {(searchTerm || selectedTipo !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTipo('all');
                setSelectedStatus('all');
              }}
              className="text-[#E30613] hover:underline font-medium cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

      </div>

      {/* Main Content: Table or Cards View */}
      {filteredArtigos.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Package className="w-8 h-8" />
          </div>
          {artigos.length === 0 ? (
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                Banco de Dados de Estoque Vazio
              </h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                Nenhum material cadastrado ainda. Você pode iniciar o cadastro hierárquico do zero ou carregar o lote oficial de 10 materiais de verificação do SENAI-SP.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenNovoArtigo}
                  className="px-4 py-2.5 bg-[#E30613] hover:bg-[#B8000B] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Primeiro Artigo
                </button>
                <button
                  onClick={onSeedVerification}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#E30613]" />
                  Carregar 10 Itens de Verificação (Carmen)
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                Nenhum artigo encontrado para os filtros aplicados
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Tente alterar os termos de busca ou remover os filtros de tipo e status.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTipo('all');
                  setSelectedStatus('all');
                }}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-200 cursor-pointer"
              >
                Resetar Filtros
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'table' ? (
        
        /* High-Density Data Grid (Enterprise Industrial Standard) */
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100/75 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px] font-bold">
                  <th
                    onClick={() => toggleSort('codigo')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Código</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('nome')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Material / Especificação Técnica</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Hierarquia</th>
                  <th className="py-3 px-3">Localização Física</th>
                  <th
                    onClick={() => toggleSort('estoque')}
                    className="py-3 px-3 text-right cursor-pointer hover:bg-neutral-200/50 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Saldo Atual</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Est. Mín/Máx</th>
                  <th
                    onClick={() => toggleSort('valor')}
                    className="py-3 px-3 text-right cursor-pointer hover:bg-neutral-200/50 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Custo / Total</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Movimentar / Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredArtigos.map((art) => {
                  const isCritico = art.estoqueAtual === 0;
                  const isBaixo = art.estoqueAtual > 0 && art.estoqueAtual <= art.estoqueMinimo;
                  const valorTotalItem = art.estoqueAtual * (art.custoUnitario || 0);

                  return (
                    <tr
                      key={art.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isCritico ? 'bg-red-50/20' : isBaixo ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Código Hierárquico */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px] border border-neutral-200 inline-block">
                          {art.codigo}
                        </span>
                      </td>

                      {/* Nome e Descrição Detalhada */}
                      <td className="py-3 px-4 align-top max-w-md">
                        <div className="font-bold text-neutral-900 text-sm mb-1">
                          {art.nome}
                        </div>
                        <div className="text-neutral-600 text-xs leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                          {art.descricao}
                        </div>
                      </td>

                      {/* Hierarquia (Tipo / Grupo / Subgrupo) */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="text-neutral-900 font-semibold">{art.tipoNome}</div>
                        <div className="text-neutral-500 text-[11px]">{art.grupoNome}</div>
                        <div className="text-neutral-400 text-[10px]">{art.subgrupoNome}</div>
                      </td>

                      {/* Localização Física */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-start gap-1 text-neutral-800">
                          <MapPin className="w-3.5 h-3.5 text-[#E30613] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-neutral-900">{art.localizacao.setorAlmoxarifado}</div>
                            <div className="text-[11px] text-neutral-500">
                              {art.localizacao.corredorEstante} · {art.localizacao.prateleiraGaveta}
                            </div>
                            <div className="font-mono text-[10px] text-neutral-400 mt-0.5">
                              {art.localizacao.codigoCompleto}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Saldo Atual */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-sm tabular-nums text-neutral-900">
                          {art.estoqueAtual.toLocaleString('pt-BR')} <span className="text-xs font-normal text-neutral-500">{art.unidade}</span>
                        </div>
                        {isCritico && (
                          <div className="text-[11px] font-bold text-red-600 mt-0.5">
                            Estoque Zerado!
                          </div>
                        )}
                        {isBaixo && (
                          <div className="text-[11px] font-bold text-amber-600 mt-0.5">
                            Abaixo do Mínimo
                          </div>
                        )}
                        {!isCritico && !isBaixo && (
                          <div className="text-[10px] text-emerald-600 mt-0.5">
                            Estoque Regular
                          </div>
                        )}
                      </td>

                      {/* Estoque Mínimo e Máximo */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap text-neutral-600 font-mono text-[11px] tabular-nums">
                        <div>Mín: {art.estoqueMinimo} {art.unidade}</div>
                        <div>Máx: {art.estoqueMaximo} {art.unidade}</div>
                      </td>

                      {/* Custo Unitário e Total */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap font-mono tabular-nums">
                        <div className="text-neutral-900 font-semibold">
                          R$ {art.custoUnitario.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Total: R$ {valorTotalItem.toFixed(2)}
                        </div>
                      </td>

                      {/* Ações de Movimentação e Edição */}
                      <td className="py-3 px-4 align-top text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Entrada Button */}
                          <button
                            onClick={() => onOpenEntrada(art)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title={`Registrar ENTRADA de ${art.nome}`}
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>Entrada</span>
                          </button>

                          {/* Saída Button */}
                          <button
                            onClick={() => onOpenSaida(art)}
                            disabled={art.estoqueAtual === 0}
                            className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
                              art.estoqueAtual === 0
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                : 'bg-[#E30613] hover:bg-[#B8000B] text-white'
                            }`}
                            title={art.estoqueAtual === 0 ? 'Sem estoque para saída' : `Registrar SAÍDA de ${art.nome}`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Saída</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditArtigo(art)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Editar artigo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteArtigo(art.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Excluir artigo do cadastro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArtigos.map((art) => {
            const isCritico = art.estoqueAtual === 0;
            const isBaixo = art.estoqueAtual > 0 && art.estoqueAtual <= art.estoqueMinimo;
            const valorTotal = art.estoqueAtual * art.custoUnitario;

            return (
              <div
                key={art.id}
                className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-800">
                      {art.codigo}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isCritico
                        ? 'bg-red-100 text-red-700'
                        : isBaixo
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isCritico ? 'Sem Estoque' : isBaixo ? 'Estoque Baixo' : 'Estoque Regular'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-neutral-900 mb-1 leading-snug">
                    {art.nome}
                  </h4>
                  <p className="text-xs text-neutral-600 mb-3 line-clamp-3 leading-relaxed">
                    {art.descricao}
                  </p>

                  <div className="text-xs text-neutral-500 mb-3 space-y-1 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <div className="flex items-center gap-1 text-neutral-700 font-medium">
                      <MapPin className="w-3 h-3 text-[#E30613]" />
                      <span>{art.localizacao.setorAlmoxarifado}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {art.localizacao.corredorEstante} · {art.localizacao.prateleiraGaveta}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Código: {art.localizacao.codigoCompleto}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Saldo Atual</div>
                      <div className="font-mono font-bold text-lg text-neutral-900">
                        {art.estoqueAtual} <span className="text-xs font-normal text-neutral-500">{art.unidade}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Valor Total</div>
                      <div className="font-mono font-bold text-sm text-neutral-900">
                        R$ {valorTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEntrada(art)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Entrada</span>
                    </button>
                    <button
                      onClick={() => onOpenSaida(art)}
                      disabled={art.estoqueAtual === 0}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        art.estoqueAtual === 0
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-[#E30613] hover:bg-[#B8000B] text-white'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Saída</span>
                    </button>
                    <button
                      onClick={() => onEditArtigo(art)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteArtigo(art.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-neutral-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
