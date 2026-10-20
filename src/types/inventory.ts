export interface Tipo {
  id: string;
  codigo: string; // Ex: T01
  nome: string;
  descricao?: string;
}

export interface Grupo {
  id: string;
  tipoId: string;
  codigo: string; // Ex: T01.G01
  nome: string;
  descricao?: string;
}

export interface Subgrupo {
  id: string;
  grupoId: string;
  tipoId: string;
  codigo: string; // Ex: T01.G01.S01
  nome: string;
  descricao?: string;
}

export interface LocalizacaoArmazenamento {
  setorAlmoxarifado: string; // Ex: Almoxarifado Central, Lab Automação
  corredorEstante: string;   // Ex: Corredor A, Estante 03
  prateleiraGaveta: string;  // Ex: Prateleira 2, Gaveta B-14
  codigoCompleto: string;    // Ex: ALM-CTR / EST-03 / GAV-B14
}

export type UnidadeMedida = 'UN' | 'PC' | 'KG' | 'M' | 'L' | 'CX' | 'RL' | 'PAR' | 'JG';

export interface Artigo {
  id: string;
  codigo: string; // Código hierárquico único gerado ex: ART-T01G01S01-001
  nome: string;
  descricao: string;
  tipoId: string;
  tipoCodigo: string;
  tipoNome: string;
  grupoId: string;
  grupoCodigo: string;
  grupoNome: string;
  subgrupoId: string;
  subgrupoCodigo: string;
  subgrupoNome: string;
  unidade: UnidadeMedida;
  localizacao: LocalizacaoArmazenamento;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  custoUnitario: number;
  dataCadastro: string;
  responsavelCadastro: string;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export interface Movimentacao {
  id: string;
  codigo: string; // Ex: MOV-2026-001
  tipo: TipoMovimentacao;
  artigoId: string;
  artigoCodigo: string;
  artigoNome: string;
  quantidade: number;
  saldoAnterior: number;
  saldoNovo: number;
  dataHora: string;
  documentoReferencia: string; // NF, Pedido de Compra, Requisição de Aula
  origemDestino: string;      // Fornecedor ou Oficina de Destino
  responsavel: string;
  observacoes: string;
}

export interface InventoryState {
  tipos: Tipo[];
  grupos: Grupo[];
  subgrupos: Subgrupo[];
  artigos: Artigo[];
  movimentacoes: Movimentacao[];
  ultimaAtualizacao: string;
  versao: string;
  responsavelTecnico: string;
  unidadeSenai: string;
}

export interface GitHubSyncConfig {
  enabled: boolean;
  token?: string;
  gistId?: string;
  lastSyncedAt?: string;
}
