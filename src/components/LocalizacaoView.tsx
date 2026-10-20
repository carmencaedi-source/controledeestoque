import React, { useState, useMemo } from 'react';
import { MapPin, Box, ArrowRight, Package, Layers, AlertTriangle } from 'lucide-react';
import { Artigo } from '../types/inventory';

interface LocalizacaoViewProps {
  artigos: Artigo[];
  onOpenEntrada: (artigo: Artigo) => void;
  onOpenSaida: (artigo: Artigo) => void;
}

export const LocalizacaoView: React.FC<LocalizacaoViewProps> = ({
  artigos,
  onOpenEntrada,
  onOpenSaida,
}) => {
  // Group articles by Setor/Almoxarifado
  const setoresMap = useMemo(() => {
    const map = new Map<string, Artigo[]>();
    artigos.forEach((art) => {
      const setor = art.localizacao.setorAlmoxarifado || 'Sem Setor Definido';
      if (!map.has(setor)) {
        map.set(setor, []);
      }
      map.get(setor)!.push(art);
    });
    return map;
  }, [artigos]);

  const setoresList = useMemo(() => Array.from(setoresMap.keys()), [setoresMap]);

  const [selectedSetor, setSelectedSetor] = useState<string>(() => {
    return setoresList[0] || '';
  });

  const activeArtigos = useMemo(() => {
    if (!selectedSetor) return [];
    return setoresMap.get(selectedSetor) || [];
  }, [setoresMap, selectedSetor]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E30613] uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" />
          <span>Gestão Espacial e Endereçamento de Almoxarifado</span>
        </div>
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">
          Mapeamento Físico de Armazenamento
        </h2>
        <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
          Navegue pelas áreas físicas do SENAI-SP (galpões, armários blindados, estufas térmicas e salas climatizadas) para localizar peças, gaveteiros e posições de estantes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Setores List (Sidebar) */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs space-y-1 p-3">
          <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
            <span>Setores / Almoxarifados</span>
            <span className="font-mono text-neutral-400">{setoresList.length} áreas</span>
          </div>

          <div className="space-y-1 mt-2">
            {setoresList.map((setor) => {
              const count = setoresMap.get(setor)?.length || 0;
              const isSelected = selectedSetor === setor;

              return (
                <button
                  key={setor}
                  onClick={() => setSelectedSetor(setor)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#E30613]' : 'text-neutral-400'}`} />
                    <span className="font-semibold">{setor}</span>
                  </div>
                  <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                    isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {count} itens
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Setor Details and Articles in that location */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Área Selecionada</span>
                <h3 className="text-base font-black text-neutral-900">{selectedSetor}</h3>
              </div>
              <span className="text-xs font-semibold text-neutral-500 font-mono">
                {activeArtigos.length} artigos armazenados
              </span>
            </div>

            {activeArtigos.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                Nenhum artigo localizado neste setor.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {activeArtigos.map((art) => {
                  const isCritico = art.estoqueAtual === 0;
                  const isBaixo = art.estoqueAtual > 0 && art.estoqueAtual <= art.estoqueMinimo;

                  return (
                    <div
                      key={art.id}
                      className="border border-neutral-200 rounded-lg p-3 hover:border-neutral-300 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-800">
                            {art.codigo}
                          </span>
                          <span className="font-bold text-neutral-900 text-xs">
                            {art.nome}
                          </span>
                        </div>

                        {/* Physical shelf / bin */}
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <Box className="w-3.5 h-3.5 text-[#E30613]" />
                          <span className="font-medium text-neutral-800">
                            {art.localizacao.corredorEstante} · {art.localizacao.prateleiraGaveta}
                          </span>
                          <span className="text-neutral-400 text-[10px] font-mono">
                            [{art.localizacao.codigoCompleto}]
                          </span>
                        </div>
                      </div>

                      {/* Stock and quick actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-neutral-900">
                            {art.estoqueAtual} {art.unidade}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Mín: {art.estoqueMinimo}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenEntrada(art)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded cursor-pointer"
                          >
                            + Entrada
                          </button>
                          <button
                            onClick={() => onOpenSaida(art)}
                            disabled={art.estoqueAtual === 0}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                              art.estoqueAtual === 0
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                : 'bg-[#E30613] hover:bg-[#B8000B] text-white'
                            }`}
                          >
                            − Saída
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
