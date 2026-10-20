import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, ArrowDownRight, ArrowUpRight, X, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { Artigo, TipoMovimentacao } from '../types/inventory';

interface MovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    artigoId: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    documentoReferencia: string;
    origemDestino: string;
    responsavel: string;
    observacoes: string;
  }) => Promise<void>;
  artigos: Artigo[];
  selectedArtigo?: Artigo | null;
  initialTipo?: TipoMovimentacao;
  responsavelTecnico: string;
}

export const MovimentacaoModal: React.FC<MovimentacaoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  artigos,
  selectedArtigo,
  initialTipo = 'ENTRADA',
  responsavelTecnico,
}) => {
  const [artigoId, setArtigoId] = useState<string>('');
  const [tipo, setTipo] = useState<TipoMovimentacao>(initialTipo);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [documentoReferencia, setDocumentoReferencia] = useState('');
  const [origemDestino, setOrigemDestino] = useState('');
  const [responsavel, setResponsavel] = useState(responsavelTecnico);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedArtigo) {
      setArtigoId(selectedArtigo.id);
    } else if (artigos.length > 0 && !artigoId) {
      setArtigoId(artigos[0].id);
    }
    setTipo(initialTipo);
    setQuantidade(1);
    setResponsavel(responsavelTecnico);
    setDocumentoReferencia(initialTipo === 'ENTRADA' ? 'NF-e ' : 'RM-SENAI-');
    setOrigemDestino(initialTipo === 'ENTRADA' ? 'Recebimento Fiscal SENAI' : 'Oficina de Mecânica de Precisão');
    setObservacoes('');
    setErrorMsg('');
  }, [selectedArtigo, initialTipo, artigos, responsavelTecnico, isOpen]);

  const activeArtigo = useMemo(() => {
    return artigos.find((a) => a.id === artigoId);
  }, [artigos, artigoId]);

  // Projected Balance calculation
  const saldoAtual = activeArtigo ? activeArtigo.estoqueAtual : 0;
  const novoSaldo = useMemo(() => {
    if (!activeArtigo) return 0;
    const qtd = Number(quantidade) || 0;
    return tipo === 'ENTRADA' ? saldoAtual + qtd : saldoAtual - qtd;
  }, [activeArtigo, saldoAtual, tipo, quantidade]);

  const isInvalidSaida = tipo === 'SAIDA' && quantidade > saldoAtual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artigoId) {
      setErrorMsg('Selecione um artigo para movimentar.');
      return;
    }
    if (!quantidade || quantidade <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }
    if (isInvalidSaida) {
      setErrorMsg(`Saldo insuficiente! Estoque atual é de apenas ${saldoAtual} ${activeArtigo?.unidade}.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onSubmit({
        artigoId,
        tipo,
        quantidade: Number(quantidade),
        documentoReferencia: documentoReferencia.trim() || 'S/N',
        origemDestino: origemDestino.trim() || (tipo === 'ENTRADA' ? 'Almoxarifado' : 'Oficina'),
        responsavel: responsavel.trim() || responsavelTecnico,
        observacoes: observacoes.trim(),
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Erro ao registrar movimentação.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-lg w-full overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              tipo === 'ENTRADA' ? 'bg-emerald-600' : 'bg-[#E30613]'
            }`}>
              {tipo === 'ENTRADA' ? (
                <ArrowDownRight className="w-5 h-5 text-white" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Registrar Movimentação de Estoque
              </h3>
              <p className="text-[11px] text-neutral-400">
                Lançamento oficial no livro fiscal e físico de almoxarifado
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Segmented Tipo Selector (ENTRADA vs SAÍDA) */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setTipo('ENTRADA');
                setOrigemDestino('Fornecedor / Almoxarifado Central SENAI');
              }}
              className={`py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                tipo === 'ENTRADA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>ENTRADA (Recebimento)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipo('SAIDA');
                setOrigemDestino('Oficina de Mecânica de Precisão');
              }}
              className={`py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                tipo === 'SAIDA'
                  ? 'bg-[#E30613] text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>SAÍDA (Requisição)</span>
            </button>
          </div>

          {/* Material Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Material / Artigo <span className="text-red-500">*</span>
            </label>
            <select
              value={artigoId}
              onChange={(e) => setArtigoId(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-[#E30613]"
              required
            >
              {artigos.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.codigo} — {art.nome} (Atual: {art.estoqueAtual} {art.unidade})
                </option>
              ))}
            </select>
          </div>

          {/* Active Artigo Location & Projected Balance Card */}
          {activeArtigo && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Localização de Armazenamento:</span>
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E30613]" />
                  {activeArtigo.localizacao.codigoCompleto}
                </span>
              </div>

              {/* Balance projection math */}
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Saldo Anterior</span>
                  <span className="font-mono text-sm font-bold text-neutral-700">
                    {saldoAtual} {activeArtigo.unidade}
                  </span>
                </div>
                <div className="text-lg font-bold text-neutral-400">
                  {tipo === 'ENTRADA' ? '+' : '−'}
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Quantidade</span>
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    {quantidade || 0} {activeArtigo.unidade}
                  </span>
                </div>
                <div className="text-lg font-bold text-neutral-400">=</div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Saldo Projetado</span>
                  <span className={`font-mono text-base font-black tabular-nums ${
                    novoSaldo < 0 ? 'text-red-600' : 'text-neutral-900'
                  }`}>
                    {novoSaldo} {activeArtigo.unidade}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Quantidade a Movimentar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full text-base font-bold font-mono border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
            />
          </div>

          {/* Document and Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Documento de Referência
              </label>
              <input
                type="text"
                placeholder={tipo === 'ENTRADA' ? 'NF-e 004821 / Pedido' : 'RM-2026-084 / OS'}
                value={documentoReferencia}
                onChange={(e) => setDocumentoReferencia(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                {tipo === 'ENTRADA' ? 'Origem / Fornecedor' : 'Destino / Oficina Requisitante'}
              </label>
              <input
                type="text"
                placeholder={tipo === 'ENTRADA' ? 'Ex: Gerdau, Metalúrgica ABC' : 'Ex: Oficina Mecânica 01, Lab Robótica'}
                value={origemDestino}
                onChange={(e) => setOrigemDestino(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
              />
            </div>
          </div>

          {/* Responsible and Notes */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Responsável pelo Lançamento
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Observações / Justificativa Didática ou Operacional
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Aula prática de fresamento CNC Turma T-2026, reposição de estoque..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#E30613]"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isInvalidSaida}
              className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer ${
                tipo === 'ENTRADA'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#E30613] hover:bg-[#B8000B]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Registrando...' : tipo === 'ENTRADA' ? 'Confirmar Entrada' : 'Confirmar Saída'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
