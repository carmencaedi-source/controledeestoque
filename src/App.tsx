import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchInventoryState,
  saveInventoryState,
  registerMovimentacao,
  resetDatabaseEmpty,
  seedVerificationData,
} from './services/api';
import { InventoryState, Artigo, Tipo, Grupo, Subgrupo, TipoMovimentacao } from './types/inventory';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EstoqueGrid } from './components/EstoqueGrid';
import { HierarchyManager } from './components/HierarchyManager';
import { MovimentacoesHistory } from './components/MovimentacoesHistory';
import { RelatorioEstoque } from './components/RelatorioEstoque';
import { LocalizacaoView } from './components/LocalizacaoView';
import { ArtigoFormModal } from './components/ArtigoFormModal';
import { MovimentacaoModal } from './components/MovimentacaoModal';
import { PersistenciaModal } from './components/PersistenciaModal';
import { CheckCircle2, AlertCircle, Sparkles, Building2 } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<InventoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'estoque' | 'hierarquia' | 'movimentacoes' | 'localizacoes' | 'relatorio'>('estoque');

  // Modals
  const [isNovoArtigoOpen, setIsNovoArtigoOpen] = useState(false);
  const [editingArtigo, setEditingArtigo] = useState<Artigo | null>(null);
  const [defaultHierarchy, setDefaultHierarchy] = useState<{ tipoId?: string; grupoId?: string; subgrupoId?: string }>({});

  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);
  const [selectedArtigoMov, setSelectedArtigoMov] = useState<Artigo | null>(null);
  const [movimentacaoTipo, setMovimentacaoTipo] = useState<TipoMovimentacao>('ENTRADA');

  const [isPersistenciaOpen, setIsPersistenciaOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchInventoryState();
        setState(data);
      } catch (err) {
        console.error('Falha ao carregar estado do inventário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle Save Artigo (Create or Edit)
  const handleSaveArtigo = async (artigoData: Omit<Artigo, 'id'>, initialStock?: number) => {
    if (!state) return;

    if (editingArtigo) {
      // Update existing
      const updatedArtigos = state.artigos.map((a) =>
        a.id === editingArtigo.id ? { ...artigoData, id: editingArtigo.id } : a
      );
      const newState: InventoryState = {
        ...state,
        artigos: updatedArtigos,
      };
      const saved = await saveInventoryState(newState);
      setState(saved);
      showToast(`Artigo "${artigoData.nome}" atualizado com sucesso!`);
    } else {
      // Create new
      const newId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newArtigo: Artigo = {
        ...artigoData,
        id: newId,
      };

      const newArtigos = [newArtigo, ...state.artigos];
      let newMovs = [...state.movimentacoes];

      // If initial stock > 0, generate initial Entrada log
      if (initialStock && initialStock > 0) {
        const movSeq = String(state.movimentacoes.length + 1).padStart(4, '0');
        newMovs = [
          {
            id: `mov-init-${Date.now()}`,
            codigo: `MOV-${new Date().getFullYear()}-${movSeq}`,
            tipo: 'ENTRADA',
            artigoId: newId,
            artigoCodigo: newArtigo.codigo,
            artigoNome: newArtigo.nome,
            quantidade: initialStock,
            saldoAnterior: 0,
            saldoNovo: initialStock,
            dataHora: new Date().toISOString(),
            documentoReferencia: 'Lote Inicial de Cadastro',
            origemDestino: newArtigo.localizacao.setorAlmoxarifado,
            responsavel: state.responsavelTecnico || 'Carmen',
            observacoes: `Carga inicial de implantação física do artigo. Responsável: ${state.responsavelTecnico || 'Carmen'}`,
          },
          ...newMovs,
        ];
      }

      const newState: InventoryState = {
        ...state,
        artigos: newArtigos,
        movimentacoes: newMovs,
      };

      const saved = await saveInventoryState(newState);
      setState(saved);
      showToast(`Novo artigo "${newArtigo.nome}" cadastrado com código ${newArtigo.codigo}!`);
    }

    setEditingArtigo(null);
    setDefaultHierarchy({});
  };

  // Handle Delete Artigo
  const handleDeleteArtigo = async (artigoId: string) => {
    if (!state) return;
    const target = state.artigos.find((a) => a.id === artigoId);
    if (!target) return;

    if (window.confirm(`Confirma a exclusão do artigo "${target.nome}" (${target.codigo})?`)) {
      const updatedArtigos = state.artigos.filter((a) => a.id !== artigoId);
      const newState: InventoryState = {
        ...state,
        artigos: updatedArtigos,
      };
      const saved = await saveInventoryState(newState);
      setState(saved);
      showToast(`Artigo "${target.nome}" excluído do cadastro.`, 'success');
    }
  };

  // Hierarchy Handlers
  const handleAddTipo = async (tipoData: Omit<Tipo, 'id'>) => {
    if (!state) return;
    const newTipo: Tipo = {
      ...tipoData,
      id: `tipo-${Date.now()}`,
    };
    const newState: InventoryState = {
      ...state,
      tipos: [...state.tipos, newTipo],
    };
    const saved = await saveInventoryState(newState);
    setState(saved);
    showToast(`Tipo "${newTipo.nome}" (${newTipo.codigo}) criado com sucesso!`);
  };

  const handleAddGrupo = async (grupoData: Omit<Grupo, 'id'>) => {
    if (!state) return;
    const newGrupo: Grupo = {
      ...grupoData,
      id: `grp-${Date.now()}`,
    };
    const newState: InventoryState = {
      ...state,
      grupos: [...state.grupos, newGrupo],
    };
    const saved = await saveInventoryState(newState);
    setState(saved);
    showToast(`Grupo "${newGrupo.nome}" (${newGrupo.codigo}) criado com sucesso!`);
  };

  const handleAddSubgrupo = async (subgrupoData: Omit<Subgrupo, 'id'>) => {
    if (!state) return;
    const newSub: Subgrupo = {
      ...subgrupoData,
      id: `sub-${Date.now()}`,
    };
    const newState: InventoryState = {
      ...state,
      subgrupos: [...state.subgrupos, newSub],
    };
    const saved = await saveInventoryState(newState);
    setState(saved);
    showToast(`Subgrupo "${newSub.nome}" (${newSub.codigo}) criado com sucesso!`);
  };

  // Movimentação Handler (Entrada / Saída)
  const handleMovimentacaoSubmit = async (payload: {
    artigoId: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    documentoReferencia: string;
    origemDestino: string;
    responsavel: string;
    observacoes: string;
  }) => {
    try {
      const res = await registerMovimentacao(payload);
      if (res.state) {
        setState(res.state);
      }
      showToast(
        `${payload.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} de ${payload.quantidade} ${res.artigo?.unidade || 'un'} registrada com sucesso para "${res.artigo?.nome}"!`
      );
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar movimentação.', 'error');
      throw err;
    }
  };

  // Reset to Empty
  const handleResetEmpty = async () => {
    const emptyState = await resetDatabaseEmpty();
    setState(emptyState);
    showToast('Banco de dados de estoques reinicializado totalmente vazio.');
  };

  // Seed 10 Verification Materials
  const handleSeedVerification = async () => {
    const verifiedData = await seedVerificationData();
    setState(verifiedData);
    showToast('10 materiais oficiais de verificação carregados com sucesso (Responsável: Carmen)!');
  };

  // Import State from JSON
  const handleImportState = async (imported: InventoryState) => {
    const saved = await saveInventoryState(imported);
    setState(saved);
    showToast('Estado do inventário importado e salvo com sucesso!');
  };

  // Open Movimentação with preselected material
  const handleOpenEntrada = (artigo: Artigo) => {
    setSelectedArtigoMov(artigo);
    setMovimentacaoTipo('ENTRADA');
    setIsMovimentacaoOpen(true);
  };

  const handleOpenSaida = (artigo: Artigo) => {
    setSelectedArtigoMov(artigo);
    setMovimentacaoTipo('SAIDA');
    setIsMovimentacaoOpen(true);
  };

  const handleEditArtigo = (artigo: Artigo) => {
    setEditingArtigo(artigo);
    setIsNovoArtigoOpen(true);
  };

  const handleOpenNovoArtigoWithHierarchy = (tipoId: string, grupoId: string, subgrupoId: string) => {
    setEditingArtigo(null);
    setDefaultHierarchy({ tipoId, grupoId, subgrupoId });
    setIsNovoArtigoOpen(true);
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md border border-neutral-200 text-center space-y-3">
          <div className="w-12 h-12 bg-[#111111] text-[#E30613] rounded-lg flex items-center justify-center font-bold text-lg mx-auto animate-pulse border-2 border-[#E30613]">
            SENAI
          </div>
          <h2 className="font-black text-neutral-900 text-base">SISGE SENAI-SP</h2>
          <p className="text-xs text-neutral-500">Inicializando sistema de controle de estoques e persistência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900">
      
      {/* Toast Feedback Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-700'
                : 'bg-red-600 text-white border-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNovoArtigo={() => {
          setEditingArtigo(null);
          setDefaultHierarchy({});
          setIsNovoArtigoOpen(true);
        }}
        onOpenNovaMovimentacao={() => {
          setSelectedArtigoMov(null);
          setMovimentacaoTipo('ENTRADA');
          setIsMovimentacaoOpen(true);
        }}
        onOpenPersistencia={() => setIsPersistenciaOpen(true)}
        itensCount={state.artigos.length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Institutional Welcome Card (when on estoque tab) */}
        {activeTab === 'estoque' && (
          <div className="relative overflow-hidden rounded-2xl bg-neutral-950 text-white mb-6 border border-neutral-800 shadow-sm">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img
                src="/src/assets/images/senai_industrial_warehouse_1792526662893.jpg"
                alt="Almoxarifado Industrial SENAI-SP"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E30613] text-white text-[11px] font-bold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Unidade Roberto Simonsen · SENAI São Paulo</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Controle Integrado de Almoxarifado
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Gestão em 4 níveis hierárquicos (<strong className="text-white">Tipo → Grupo → Subgrupo → Artigo</strong>), rastreamento físico de gaveteiros e histórico auditável de entradas e saídas.
                </p>
                <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400 font-medium">
                  <span>Responsável Técnico: <strong className="text-neutral-200">{state.responsavelTecnico}</strong></span>
                  <span>·</span>
                  <span>Persistência: <strong className="text-neutral-200">GitHub / Cloud Drive</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsPersistenciaOpen(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/15"
                >
                  Persistência &amp; Sincronização
                </button>
                <button
                  onClick={() => {
                    setSelectedArtigoMov(null);
                    setMovimentacaoTipo('ENTRADA');
                    setIsMovimentacaoOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#E30613] hover:bg-[#B8000B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Registrar Movimentação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Estoque Grid */}
        {activeTab === 'estoque' && (
          <EstoqueGrid
            artigos={state.artigos}
            tipos={state.tipos}
            grupos={state.grupos}
            subgrupos={state.subgrupos}
            onOpenNovoArtigo={() => {
              setEditingArtigo(null);
              setDefaultHierarchy({});
              setIsNovoArtigoOpen(true);
            }}
            onOpenEntrada={handleOpenEntrada}
            onOpenSaida={handleOpenSaida}
            onEditArtigo={handleEditArtigo}
            onDeleteArtigo={handleDeleteArtigo}
            onSeedVerification={handleSeedVerification}
          />
        )}

        {/* Tab 2: Cadastro Hierárquico */}
        {activeTab === 'hierarquia' && (
          <HierarchyManager
            tipos={state.tipos}
            grupos={state.grupos}
            subgrupos={state.subgrupos}
            artigos={state.artigos}
            onAddTipo={handleAddTipo}
            onAddGrupo={handleAddGrupo}
            onAddSubgrupo={handleAddSubgrupo}
            onOpenNovoArtigoWithHierarchy={handleOpenNovoArtigoWithHierarchy}
          />
        )}

        {/* Tab 3: Movimentações */}
        {activeTab === 'movimentacoes' && (
          <MovimentacoesHistory
            movimentacoes={state.movimentacoes}
            onOpenNovaMovimentacao={() => {
              setSelectedArtigoMov(null);
              setMovimentacaoTipo('ENTRADA');
              setIsMovimentacaoOpen(true);
            }}
          />
        )}

        {/* Tab 4: Localizações de Armazenamento */}
        {activeTab === 'localizacoes' && (
          <LocalizacaoView
            artigos={state.artigos}
            onOpenEntrada={handleOpenEntrada}
            onOpenSaida={handleOpenSaida}
          />
        )}

        {/* Tab 5: Relatório Oficial */}
        {activeTab === 'relatorio' && (
          <RelatorioEstoque state={state} />
        )}

      </main>

      {/* Institutional Footer */}
      <Footer
        responsavelTecnico={state.responsavelTecnico}
        unidadeSenai={state.unidadeSenai}
        totalItens={state.artigos.length}
        totalMovimentacoes={state.movimentacoes.length}
      />

      {/* Modal: Novo / Editar Artigo */}
      <ArtigoFormModal
        isOpen={isNovoArtigoOpen}
        onClose={() => {
          setIsNovoArtigoOpen(false);
          setEditingArtigo(null);
          setDefaultHierarchy({});
        }}
        onSave={handleSaveArtigo}
        tipos={state.tipos}
        grupos={state.grupos}
        subgrupos={state.subgrupos}
        artigos={state.artigos}
        editingArtigo={editingArtigo}
        defaultHierarchy={defaultHierarchy}
        responsavelTecnico={state.responsavelTecnico}
      />

      {/* Modal: Registrar Movimentação */}
      <MovimentacaoModal
        isOpen={isMovimentacaoOpen}
        onClose={() => {
          setIsMovimentacaoOpen(false);
          setSelectedArtigoMov(null);
        }}
        onSubmit={handleMovimentacaoSubmit}
        artigos={state.artigos}
        selectedArtigo={selectedArtigoMov}
        initialTipo={movimentacaoTipo}
        responsavelTecnico={state.responsavelTecnico}
      />

      {/* Modal: Persistência & Manutenção */}
      <PersistenciaModal
        isOpen={isPersistenciaOpen}
        onClose={() => setIsPersistenciaOpen(false)}
        currentState={state}
        onResetEmpty={handleResetEmpty}
        onSeedVerification={handleSeedVerification}
        onImportState={handleImportState}
      />

    </div>
  );
}
