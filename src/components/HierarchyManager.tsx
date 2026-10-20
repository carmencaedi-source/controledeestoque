import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  Plus,
  ChevronRight,
  ChevronDown,
  Layers,
  Package,
  Sparkles,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Tipo, Grupo, Subgrupo, Artigo } from '../types/inventory';

interface HierarchyManagerProps {
  tipos: Tipo[];
  grupos: Grupo[];
  subgrupos: Subgrupo[];
  artigos: Artigo[];
  onAddTipo: (tipo: Omit<Tipo, 'id'>) => void;
  onAddGrupo: (grupo: Omit<Grupo, 'id'>) => void;
  onAddSubgrupo: (subgrupo: Omit<Subgrupo, 'id'>) => void;
  onOpenNovoArtigoWithHierarchy?: (tipoId: string, grupoId: string, subgrupoId: string) => void;
}

export const HierarchyManager: React.FC<HierarchyManagerProps> = ({
  tipos,
  grupos,
  subgrupos,
  artigos,
  onAddTipo,
  onAddGrupo,
  onAddSubgrupo,
  onOpenNovoArtigoWithHierarchy,
}) => {
  const [expandedTipos, setExpandedTipos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    tipos.forEach((t) => (init[t.id] = true));
    return init;
  });

  const [expandedGrupos, setExpandedGrupos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    grupos.forEach((g) => (init[g.id] = true));
    return init;
  });

  // Modal / Form state for adding hierarchy level
  const [modalType, setModalType] = useState<'none' | 'tipo' | 'grupo' | 'subgrupo'>('none');
  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [selectedParentTipoId, setSelectedParentTipoId] = useState<string>('');
  const [selectedParentGrupoId, setSelectedParentGrupoId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTipo = (tipoId: string) => {
    setExpandedTipos((prev) => ({ ...prev, [tipoId]: !prev[tipoId] }));
  };

  const toggleGrupo = (grupoId: string) => {
    setExpandedGrupos((prev) => ({ ...prev, [grupoId]: !prev[grupoId] }));
  };

  // Open modal with preselected parents
  const handleOpenAddTipo = () => {
    setModalType('tipo');
    setFormNome('');
    setFormDescricao('');
    setErrorMsg('');
  };

  const handleOpenAddGrupo = (parentTipoId?: string) => {
    setModalType('grupo');
    setFormNome('');
    setFormDescricao('');
    setSelectedParentTipoId(parentTipoId || (tipos[0]?.id || ''));
    setErrorMsg('');
  };

  const handleOpenAddSubgrupo = (parentTipoId?: string, parentGrupoId?: string) => {
    setModalType('subgrupo');
    setFormNome('');
    setFormDescricao('');
    const tId = parentTipoId || (tipos[0]?.id || '');
    setSelectedParentTipoId(tId);
    const validGrupos = grupos.filter((g) => g.tipoId === tId);
    setSelectedParentGrupoId(parentGrupoId || (validGrupos[0]?.id || ''));
    setErrorMsg('');
  };

  // Handle Form Submit with automatic sequential code generation
  const handleSubmitHierarchy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setErrorMsg('O nome é obrigatório.');
      return;
    }

    if (modalType === 'tipo') {
      const nextNum = tipos.length + 1;
      const codigo = `TIP-${String(nextNum).padStart(2, '0')}`;
      onAddTipo({
        codigo,
        nome: formNome.trim(),
        descricao: formDescricao.trim(),
      });
      setModalType('none');
    } else if (modalType === 'grupo') {
      const parentTipo = tipos.find((t) => t.id === selectedParentTipoId);
      if (!parentTipo) {
        setErrorMsg('Selecione um Tipo pai válido.');
        return;
      }
      const existingGruposForTipo = grupos.filter((g) => g.tipoId === selectedParentTipoId);
      const nextNum = existingGruposForTipo.length + 1;
      const codigo = `${parentTipo.codigo}.GRP-${String(nextNum).padStart(2, '0')}`;
      onAddGrupo({
        tipoId: parentTipo.id,
        codigo,
        nome: formNome.trim(),
        descricao: formDescricao.trim(),
      });
      setExpandedTipos((prev) => ({ ...prev, [parentTipo.id]: true }));
      setModalType('none');
    } else if (modalType === 'subgrupo') {
      const parentGrupo = grupos.find((g) => g.id === selectedParentGrupoId);
      if (!parentGrupo) {
        setErrorMsg('Selecione um Grupo pai válido.');
        return;
      }
      const existingSubgrupos = subgrupos.filter((s) => s.grupoId === selectedParentGrupoId);
      const nextNum = existingSubgrupos.length + 1;
      const codigo = `${parentGrupo.codigo}.SUB-${String(nextNum).padStart(2, '0')}`;
      onAddSubgrupo({
        tipoId: parentGrupo.tipoId,
        grupoId: parentGrupo.id,
        codigo,
        nome: formNome.trim(),
        descricao: formDescricao.trim(),
      });
      setExpandedGrupos((prev) => ({ ...prev, [parentGrupo.id]: true }));
      setModalType('none');
    }
  };

  // Computed preview code
  const previewCode = () => {
    if (modalType === 'tipo') {
      return `TIP-${String(tipos.length + 1).padStart(2, '0')}`;
    }
    if (modalType === 'grupo') {
      const parentTipo = tipos.find((t) => t.id === selectedParentTipoId);
      if (!parentTipo) return '---';
      const existing = grupos.filter((g) => g.tipoId === selectedParentTipoId);
      return `${parentTipo.codigo}.GRP-${String(existing.length + 1).padStart(2, '0')}`;
    }
    if (modalType === 'subgrupo') {
      const parentGrupo = grupos.find((g) => g.id === selectedParentGrupoId);
      if (!parentGrupo) return '---';
      const existing = subgrupos.filter((s) => s.grupoId === selectedParentGrupoId);
      return `${parentGrupo.codigo}.SUB-${String(existing.length + 1).padStart(2, '0')}`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Explanation & Action Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E30613] uppercase tracking-wider mb-1">
              <FolderTree className="w-4 h-4" />
              <span>Estrutura Cadastral Hierárquica SENAI-SP</span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              Classificação em 4 Níveis: Tipo → Grupo → Subgrupo → Artigo
            </h2>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              Cada nível possui geração automática e sequencial de código único padronizado. Os artigos herdam os códigos hierárquicos para rastreabilidade e auditoria de almoxarifado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddTipo}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E30613]" />
              <span>Adicionar Tipo (Nível 1)</span>
            </button>
            <button
              onClick={() => handleOpenAddGrupo()}
              disabled={tipos.length === 0}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                tipos.length === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <Plus className="w-4 h-4 text-[#E30613]" />
              <span>Adicionar Grupo (Nível 2)</span>
            </button>
            <button
              onClick={() => handleOpenAddSubgrupo()}
              disabled={grupos.length === 0}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                grupos.length === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <Plus className="w-4 h-4 text-[#E30613]" />
              <span>Adicionar Subgrupo (Nível 3)</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Hierarchy Scheme Illustration */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-neutral-100 px-3 py-1 rounded text-neutral-800 border border-neutral-200">
            <span className="text-neutral-400 text-[10px] block">NÍVEL 1</span>
            <strong>TIP-XX</strong> (Tipo)
          </div>
          <span className="text-neutral-400 font-sans">→</span>
          <div className="bg-neutral-100 px-3 py-1 rounded text-neutral-800 border border-neutral-200">
            <span className="text-neutral-400 text-[10px] block">NÍVEL 2</span>
            <strong>TIP-XX.GRP-YY</strong> (Grupo)
          </div>
          <span className="text-neutral-400 font-sans">→</span>
          <div className="bg-neutral-100 px-3 py-1 rounded text-neutral-800 border border-neutral-200">
            <span className="text-neutral-400 text-[10px] block">NÍVEL 3</span>
            <strong>TIP-XX.GRP-YY.SUB-ZZ</strong> (Subgrupo)
          </div>
          <span className="text-neutral-400 font-sans">→</span>
          <div className="bg-[#FDE8EA] px-3 py-1 rounded text-[#B8000B] border border-red-200">
            <span className="text-red-400 text-[10px] block">NÍVEL 4 (ITEM)</span>
            <strong>ART-TIPXX.GRPYY.SUBZZ-NNN</strong> (Artigo)
          </div>
        </div>
      </div>

      {/* Tree View Container */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>Árvore de Categorias Cadastradas ({tipos.length} Tipos · {grupos.length} Grupos · {subgrupos.length} Subgrupos)</span>
          </div>
          <div className="text-xs text-neutral-500">
            Clique para expandir ou contrair níveis
          </div>
        </div>

        {tipos.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h4 className="font-bold text-neutral-900 text-base mb-1">Nenhum Tipo Cadastrado</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              Crie a primeira categoria (Tipo) para organizar suas matérias-primas e ferramentas.
            </p>
            <button
              onClick={handleOpenAddTipo}
              className="px-4 py-2 bg-[#E30613] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Criar Tipo 01
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {tipos.map((tipo) => {
              const tipoGrupos = grupos.filter((g) => g.tipoId === tipo.id);
              const tipoArtigosCount = artigos.filter((a) => a.tipoId === tipo.id).length;
              const isExpanded = !!expandedTipos[tipo.id];

              return (
                <div key={tipo.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                  
                  {/* Tipo Bar */}
                  <div className="p-3 bg-neutral-100/80 hover:bg-neutral-200/50 flex items-center justify-between gap-3 transition-colors">
                    <div
                      onClick={() => toggleTipo(tipo.id)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      )}
                      <span className="font-mono text-xs font-extrabold bg-[#111111] text-white px-2 py-0.5 rounded">
                        {tipo.codigo}
                      </span>
                      <span className="font-bold text-neutral-900 text-sm">
                        {tipo.nome}
                      </span>
                      {tipo.descricao && (
                        <span className="hidden md:inline text-xs text-neutral-500 truncate max-w-md">
                          — {tipo.descricao}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono tabular-nums bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {tipoArtigosCount} artigos
                      </span>
                      <button
                        onClick={() => handleOpenAddGrupo(tipo.id)}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Adicionar Grupo a este Tipo"
                      >
                        <Plus className="w-3 h-3 text-[#E30613]" />
                        <span>Grupo</span>
                      </button>
                    </div>
                  </div>

                  {/* Grupos under Tipo */}
                  {isExpanded && (
                    <div className="p-3 pl-6 sm:pl-10 space-y-2 bg-white">
                      {tipoGrupos.length === 0 ? (
                        <div className="text-xs text-neutral-400 italic py-1">
                          Nenhum grupo cadastrado neste tipo. Clique em "+ Grupo" para adicionar.
                        </div>
                      ) : (
                        tipoGrupos.map((grupo) => {
                          const grupoSubgrupos = subgrupos.filter((s) => s.grupoId === grupo.id);
                          const isGrupoExpanded = !!expandedGrupos[grupo.id];
                          const grupoArtigosCount = artigos.filter((a) => a.grupoId === grupo.id).length;

                          return (
                            <div key={grupo.id} className="border border-neutral-200 rounded-md overflow-hidden">
                              
                              {/* Grupo Bar */}
                              <div className="p-2.5 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between gap-2 transition-colors">
                                <div
                                  onClick={() => toggleGrupo(grupo.id)}
                                  className="flex items-center gap-2 cursor-pointer flex-1"
                                >
                                  {isGrupoExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                  )}
                                  <span className="font-mono text-[11px] font-bold bg-neutral-200 text-neutral-900 px-1.5 py-0.5 rounded">
                                    {grupo.codigo}
                                  </span>
                                  <span className="font-semibold text-neutral-800 text-xs">
                                    {grupo.nome}
                                  </span>
                                  {grupo.descricao && (
                                    <span className="hidden lg:inline text-[11px] text-neutral-400 truncate max-w-xs">
                                      — {grupo.descricao}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                                    {grupoArtigosCount} artigos
                                  </span>
                                  <button
                                    onClick={() => handleOpenAddSubgrupo(tipo.id, grupo.id)}
                                    className="px-2 py-0.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                    title="Adicionar Subgrupo"
                                  >
                                    <Plus className="w-3 h-3 text-[#E30613]" />
                                    <span>Subgrupo</span>
                                  </button>
                                </div>
                              </div>

                              {/* Subgrupos under Grupo */}
                              {isGrupoExpanded && (
                                <div className="p-2.5 pl-6 sm:pl-8 space-y-2 bg-neutral-50/50">
                                  {grupoSubgrupos.length === 0 ? (
                                    <div className="text-[11px] text-neutral-400 italic py-1">
                                      Nenhum subgrupo cadastrado. Clique em "+ Subgrupo" para adicionar.
                                    </div>
                                  ) : (
                                    grupoSubgrupos.map((sub) => {
                                      const subArtigos = artigos.filter((a) => a.subgrupoId === sub.id);

                                      return (
                                        <div
                                          key={sub.id}
                                          className="bg-white border border-neutral-200 rounded p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-[11px] font-medium bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                                              {sub.codigo}
                                            </span>
                                            <span className="font-medium text-neutral-900 text-xs">
                                              {sub.nome}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 font-mono">
                                              ({subArtigos.length} itens)
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            {onOpenNovoArtigoWithHierarchy && (
                                              <button
                                                onClick={() => onOpenNovoArtigoWithHierarchy(tipo.id, grupo.id, sub.id)}
                                                className="px-2.5 py-1 bg-[#E30613] hover:bg-[#B8000B] text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                                title="Cadastrar novo artigo neste subgrupo"
                                              >
                                                <Plus className="w-3 h-3" />
                                                <span>Novo Artigo</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hierarchy Creation Modal */}
      {modalType !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full overflow-hidden">
            <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#E30613]" />
                <h3 className="font-bold text-sm">
                  {modalType === 'tipo' && 'Novo Tipo (Nível 1)'}
                  {modalType === 'grupo' && 'Novo Grupo (Nível 2)'}
                  {modalType === 'subgrupo' && 'Novo Subgrupo (Nível 3)'}
                </h3>
              </div>
              <button
                onClick={() => setModalType('none')}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHierarchy} className="p-5 space-y-4">
              
              {/* Generated Code Preview */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                    Código Gerado Automaticamente
                  </span>
                  <span className="font-mono font-black text-sm text-[#E30613]">
                    {previewCode()}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 text-right">
                  Sequencial Único
                </div>
              </div>

              {/* Parent Tipo Selector (if Grupo or Subgrupo) */}
              {(modalType === 'grupo' || modalType === 'subgrupo') && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Tipo Pai (Nível 1) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedParentTipoId}
                    onChange={(e) => {
                      setSelectedParentTipoId(e.target.value);
                      const validG = grupos.filter((g) => g.tipoId === e.target.value);
                      if (validG.length > 0) setSelectedParentGrupoId(validG[0].id);
                    }}
                    className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                  >
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.codigo} - {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Parent Grupo Selector (if Subgrupo) */}
              {modalType === 'subgrupo' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Grupo Pai (Nível 2) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedParentGrupoId}
                    onChange={(e) => setSelectedParentGrupoId(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                  >
                    {grupos
                      .filter((g) => g.tipoId === selectedParentTipoId)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.codigo} - {g.nome}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    modalType === 'tipo'
                      ? 'Ex: Matérias-Primas, Ferramental, EPIs'
                      : modalType === 'grupo'
                      ? 'Ex: Aços Laminados, Fresas CNC, Fixadores'
                      : 'Ex: Barras Redondas 1045, Fresas de Topo'
                  }
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Descrição / Finalidade Técnica
                </label>
                <textarea
                  rows={2}
                  placeholder="Finalidade de uso, especificações gerais ou normas..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType('none')}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Confirmar e Gerar Código
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
