import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Package, Layers, MapPin, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { Artigo, Tipo, Grupo, Subgrupo, UnidadeMedida } from '../types/inventory';

interface ArtigoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artigoData: Omit<Artigo, 'id'>, initialStock?: number) => void;
  tipos: Tipo[];
  grupos: Grupo[];
  subgrupos: Subgrupo[];
  artigos: Artigo[];
  editingArtigo?: Artigo | null;
  defaultHierarchy?: { tipoId?: string; grupoId?: string; subgrupoId?: string };
  responsavelTecnico: string;
}

export const ArtigoFormModal: React.FC<ArtigoFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tipos,
  grupos,
  subgrupos,
  artigos,
  editingArtigo,
  defaultHierarchy,
  responsavelTecnico,
}) => {
  // Form fields
  const [selectedTipoId, setSelectedTipoId] = useState<string>('');
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>('');
  const [selectedSubgrupoId, setSelectedSubgrupoId] = useState<string>('');
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('UN');
  const [custoUnitario, setCustoUnitario] = useState<number>(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(5);
  const [estoqueMaximo, setEstoqueMaximo] = useState<number>(50);
  const [estoqueInicial, setEstoqueInicial] = useState<number>(10);
  
  // Localização
  const [setorAlmoxarifado, setSetorAlmoxarifado] = useState('Almoxarifado Central SENAI');
  const [corredorEstante, setCorredorEstante] = useState('Estante 01');
  const [prateleiraGaveta, setPrateleiraGaveta] = useState('Prateleira A - Gaveta 01');

  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize on open or change
  useEffect(() => {
    if (editingArtigo) {
      setSelectedTipoId(editingArtigo.tipoId);
      setSelectedGrupoId(editingArtigo.grupoId);
      setSelectedSubgrupoId(editingArtigo.subgrupoId);
      setNome(editingArtigo.nome);
      setDescricao(editingArtigo.descricao);
      setUnidade(editingArtigo.unidade);
      setCustoUnitario(editingArtigo.custoUnitario);
      setEstoqueMinimo(editingArtigo.estoqueMinimo);
      setEstoqueMaximo(editingArtigo.estoqueMaximo);
      setEstoqueInicial(editingArtigo.estoqueAtual);
      setSetorAlmoxarifado(editingArtigo.localizacao.setorAlmoxarifado);
      setCorredorEstante(editingArtigo.localizacao.corredorEstante);
      setPrateleiraGaveta(editingArtigo.localizacao.prateleiraGaveta);
    } else {
      // New Artigo default setup
      const initialTipo = defaultHierarchy?.tipoId || tipos[0]?.id || '';
      setSelectedTipoId(initialTipo);

      const validGrupos = grupos.filter((g) => g.tipoId === initialTipo);
      const initialGrupo = defaultHierarchy?.grupoId || validGrupos[0]?.id || '';
      setSelectedGrupoId(initialGrupo);

      const validSubs = subgrupos.filter((s) => s.grupoId === initialGrupo);
      const initialSub = defaultHierarchy?.subgrupoId || validSubs[0]?.id || '';
      setSelectedSubgrupoId(initialSub);

      setNome('');
      setDescricao(`Especificação técnica detalhada do material. Responsável: ${responsavelTecnico}`);
      setUnidade('UN');
      setCustoUnitario(50);
      setEstoqueMinimo(5);
      setEstoqueMaximo(50);
      setEstoqueInicial(10);
      setSetorAlmoxarifado('Almoxarifado Central SENAI');
      setCorredorEstante('Estante 01');
      setPrateleiraGaveta('Prateleira A - Gaveta 01');
    }
    setErrorMsg('');
  }, [editingArtigo, defaultHierarchy, tipos, grupos, subgrupos, responsavelTecnico, isOpen]);

  // Dependent Groups based on Tipo
  const availableGrupos = useMemo(() => {
    return grupos.filter((g) => g.tipoId === selectedTipoId);
  }, [grupos, selectedTipoId]);

  // Dependent Subgroups based on Grupo
  const availableSubgrupos = useMemo(() => {
    return subgrupos.filter((s) => s.grupoId === selectedGrupoId);
  }, [subgrupos, selectedGrupoId]);

  // Handle Tipo change: update dependent grupo and subgrupo
  const handleTipoChange = (tipoId: string) => {
    setSelectedTipoId(tipoId);
    const gList = grupos.filter((g) => g.tipoId === tipoId);
    const newGId = gList[0]?.id || '';
    setSelectedGrupoId(newGId);
    const sList = subgrupos.filter((s) => s.grupoId === newGId);
    setSelectedSubgrupoId(sList[0]?.id || '');
  };

  // Handle Grupo change: update dependent subgrupo
  const handleGrupoChange = (grupoId: string) => {
    setSelectedGrupoId(grupoId);
    const sList = subgrupos.filter((s) => s.grupoId === grupoId);
    setSelectedSubgrupoId(sList[0]?.id || '');
  };

  // Automatic Unique Code Generation for Artigo (e.g. ART-T01.G01.S01-001)
  const generatedCodigo = useMemo(() => {
    if (editingArtigo) {
      return editingArtigo.codigo;
    }
    const currentSub = subgrupos.find((s) => s.id === selectedSubgrupoId);
    if (!currentSub) {
      return 'ART-GERAL-001';
    }
    const countInSub = artigos.filter((a) => a.subgrupoId === selectedSubgrupoId).length;
    const nextSeq = String(countInSub + 1).padStart(3, '0');
    // Sanitize dots or keep clean structure
    return `ART-${currentSub.codigo}-${nextSeq}`;
  }, [editingArtigo, selectedSubgrupoId, subgrupos, artigos]);

  // Generated Location Code
  const generatedLocationCode = useMemo(() => {
    const sPrefix = setorAlmoxarifado.substring(0, 3).toUpperCase();
    const cPrefix = corredorEstante.substring(0, 3).toUpperCase();
    const pPrefix = prateleiraGaveta.substring(0, 3).toUpperCase();
    return `${sPrefix} / ${cPrefix} / ${pPrefix}`;
  }, [setorAlmoxarifado, corredorEstante, prateleiraGaveta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg('O nome do material é obrigatório.');
      return;
    }
    if (!selectedTipoId || !selectedGrupoId || !selectedSubgrupoId) {
      setErrorMsg('A hierarquia completa (Tipo, Grupo e Subgrupo) é obrigatória.');
      return;
    }

    const tObj = tipos.find((t) => t.id === selectedTipoId);
    const gObj = grupos.find((g) => g.id === selectedGrupoId);
    const sObj = subgrupos.find((s) => s.id === selectedSubgrupoId);

    if (!tObj || !gObj || !sObj) {
      setErrorMsg('Erro na resolução da hierarquia selecionada.');
      return;
    }

    const artigoPayload: Omit<Artigo, 'id'> = {
      codigo: generatedCodigo,
      nome: nome.trim(),
      descricao: descricao.trim(),
      tipoId: tObj.id,
      tipoCodigo: tObj.codigo,
      tipoNome: tObj.nome,
      grupoId: gObj.id,
      grupoCodigo: gObj.codigo,
      grupoNome: gObj.nome,
      subgrupoId: sObj.id,
      subgrupoCodigo: sObj.codigo,
      subgrupoNome: sObj.nome,
      unidade,
      localizacao: {
        setorAlmoxarifado: setorAlmoxarifado.trim(),
        corredorEstante: corredorEstante.trim(),
        prateleiraGaveta: prateleiraGaveta.trim(),
        codigoCompleto: `${setorAlmoxarifado.trim()} / ${corredorEstante.trim()} / ${prateleiraGaveta.trim()}`,
      },
      estoqueAtual: editingArtigo ? editingArtigo.estoqueAtual : Number(estoqueInicial) || 0,
      estoqueMinimo: Number(estoqueMinimo) || 0,
      estoqueMaximo: Number(estoqueMaximo) || 100,
      custoUnitario: Number(custoUnitario) || 0,
      dataCadastro: editingArtigo ? editingArtigo.dataCadastro : new Date().toISOString(),
      responsavelCadastro: editingArtigo ? editingArtigo.responsavelCadastro : responsavelTecnico,
    };

    onSave(artigoPayload, editingArtigo ? undefined : Number(estoqueInicial));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-2xl w-full my-8 overflow-hidden">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#E30613] flex items-center justify-center font-bold">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                {editingArtigo ? 'Editar Artigo' : 'Cadastro de Novo Artigo / Material'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Padrão SISGE SENAI-SP com Geração Automática de Código
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Automatic Code Preview Banner */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                Código Único Hierárquico Gerado
              </span>
              <span className="font-mono font-black text-base text-[#E30613]">
                {generatedCodigo}
              </span>
            </div>
            <div className="text-right text-[11px] text-neutral-500">
              <span className="font-semibold text-neutral-800">Tipo → Grupo → Subgrupo → Seq</span>
            </div>
          </div>

          {/* Hierarchical Classification (Tipo -> Grupo -> Subgrupo) */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E30613]" />
              <span>Hierarquia Obrigatória (Níveis 1, 2 e 3)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tipo */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  1. Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTipoId}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                  required
                >
                  <option value="">Selecione o Tipo...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} - {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  2. Grupo <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGrupoId}
                  onChange={(e) => handleGrupoChange(e.target.value)}
                  disabled={availableGrupos.length === 0}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613] disabled:bg-neutral-100"
                  required
                >
                  <option value="">Selecione o Grupo...</option>
                  {availableGrupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.codigo} - {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subgrupo */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  3. Subgrupo <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubgrupoId}
                  onChange={(e) => setSelectedSubgrupoId(e.target.value)}
                  disabled={availableSubgrupos.length === 0}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613] disabled:bg-neutral-100"
                  required
                >
                  <option value="">Selecione o Subgrupo...</option>
                  {availableSubgrupos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} - {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nome e Descrição Detalhada */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Nome do Material / Artigo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Fresa Metal Duro 4 Cortes Ø 10mm, Barra Aço SAE 1045..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-sm font-semibold border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Descrição Técnica Completa &amp; Especificações <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Bitola, tratamento térmico, classe de pressão, norma técnica, certificado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613] leading-relaxed"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Dica: Inclua as dimensões, normas (ABNT, DIN, ISO) e o nome do responsável ao final conforme os padrões de auditoria.
            </p>
          </div>

          {/* Quantidades e Custos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}
                className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
              >
                <option value="UN">UN (Unidade)</option>
                <option value="PC">PC (Peça)</option>
                <option value="KG">KG (Quilograma)</option>
                <option value="M">M (Metro)</option>
                <option value="L">L (Litro)</option>
                <option value="CX">CX (Caixa)</option>
                <option value="RL">RL (Rolo)</option>
                <option value="PAR">PAR (Par)</option>
                <option value="JG">JG (Jogo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Custo Unitário (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={custoUnitario}
                onChange={(e) => setCustoUnitario(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
              />
            </div>

            {!editingArtigo ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Estoque Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={estoqueInicial}
                  onChange={(e) => setEstoqueInicial(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Estoque Máximo
                </label>
                <input
                  type="number"
                  min="1"
                  value={estoqueMaximo}
                  onChange={(e) => setEstoqueMaximo(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
              </div>
            )}
          </div>

          {/* Localização de Armazenamento (Mandatory requirement) */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E30613]" />
                <span>Localização Física no Almoxarifado</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-500 font-normal">
                Tag: {generatedLocationCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Setor / Almoxarifado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoxarifado Central, Lab 04"
                  value={setorAlmoxarifado}
                  onChange={(e) => setSetorAlmoxarifado(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Corredor / Estante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corredor A, Estante 03"
                  value={corredorEstante}
                  onChange={(e) => setCorredorEstante(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Prateleira / Gaveta / Bin
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prateleira 02 - Gaveta 14"
                  value={prateleiraGaveta}
                  onChange={(e) => setPrateleiraGaveta(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Responsável Técnico: <strong className="text-neutral-700">{responsavelTecnico}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#E30613] hover:bg-[#B8000B] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                {editingArtigo ? 'Salvar Alterações' : 'Cadastrar Artigo'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
