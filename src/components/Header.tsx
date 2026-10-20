import React from 'react';
import { Package, Plus, ArrowLeftRight, FileText, FolderTree, MapPin, Cloud, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'estoque' | 'hierarquia' | 'movimentacoes' | 'localizacoes' | 'relatorio';
  setActiveTab: (tab: 'estoque' | 'hierarquia' | 'movimentacoes' | 'localizacoes' | 'relatorio') => void;
  onOpenNovoArtigo: () => void;
  onOpenNovaMovimentacao: () => void;
  onOpenPersistencia: () => void;
  itensCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNovoArtigo,
  onOpenNovaMovimentacao,
  onOpenPersistencia,
  itensCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Banner Ribbon */}
      <div className="bg-[#E30613] text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider">SENAI-SP</span>
          <span className="opacity-75">·</span>
          <span className="opacity-95">Serviço Nacional de Aprendizagem Industrial</span>
          <span className="opacity-75">·</span>
          <span className="hidden sm:inline opacity-90">Divisão de Operações &amp; Suprimentos</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPersistencia}
            className="flex items-center gap-1.5 text-xs bg-black/20 hover:bg-black/35 px-2.5 py-0.5 rounded transition-colors cursor-pointer"
            title="Configurar persistência em nuvem (GitHub / Google Drive)"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Persistência em Nuvem</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar - 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark / Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center rounded-lg shadow-sm font-bold text-lg border-2 border-[#E30613]">
              <Package className="w-5 h-5 text-[#E30613]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#111111]">
                  SISGE <span className="text-[#E30613]">SENAI-SP</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium leading-none">
                Sistema Integrado de Controle de Estoques
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('estoque')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'estoque'
                  ? 'bg-neutral-100 text-[#E30613]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Estoque Atual ({itensCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('hierarquia')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'hierarquia'
                  ? 'bg-neutral-100 text-[#E30613]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Hierarquia (Tipo/Grupo)</span>
            </button>

            <button
              onClick={() => setActiveTab('movimentacoes')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'movimentacoes'
                  ? 'bg-neutral-100 text-[#E30613]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Movimentações</span>
            </button>

            <button
              onClick={() => setActiveTab('localizacoes')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'localizacoes'
                  ? 'bg-neutral-100 text-[#E30613]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Localizações</span>
            </button>

            <button
              onClick={() => setActiveTab('relatorio')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'relatorio'
                  ? 'bg-neutral-100 text-[#E30613]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatório Técnico</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Well highlighted SENAI Red & Dark buttons) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNovaMovimentacao}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Registrar Entrada ou Saída de material"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#E30613]" />
              <span className="hidden sm:inline">Movimentar</span>
            </button>

            <button
              onClick={onOpenNovoArtigo}
              className="px-4 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cadastrar novo artigo hierárquico"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Artigo</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-neutral-100">
          <button
            onClick={() => setActiveTab('estoque')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'estoque' ? 'bg-[#E30613] text-white' : 'text-neutral-700 bg-neutral-100'
            }`}
          >
            Estoque ({itensCount})
          </button>
          <button
            onClick={() => setActiveTab('hierarquia')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'hierarquia' ? 'bg-[#E30613] text-white' : 'text-neutral-700 bg-neutral-100'
            }`}
          >
            Hierarquia
          </button>
          <button
            onClick={() => setActiveTab('movimentacoes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'movimentacoes' ? 'bg-[#E30613] text-white' : 'text-neutral-700 bg-neutral-100'
            }`}
          >
            Movimentações
          </button>
          <button
            onClick={() => setActiveTab('localizacoes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'localizacoes' ? 'bg-[#E30613] text-white' : 'text-neutral-700 bg-neutral-100'
            }`}
          >
            Localizações
          </button>
          <button
            onClick={() => setActiveTab('relatorio')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'relatorio' ? 'bg-[#E30613] text-white' : 'text-neutral-700 bg-neutral-100'
            }`}
          >
            Relatório Oficial
          </button>
        </div>

      </div>
    </header>
  );
};
