import React, { useState } from 'react';
import {
  Cloud,
  X,
  Github,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FolderGit2,
} from 'lucide-react';
import { InventoryState } from '../types/inventory';
import { syncGitHub } from '../services/api';

interface PersistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: InventoryState;
  onResetEmpty: () => Promise<void>;
  onSeedVerification: () => Promise<void>;
  onImportState: (state: InventoryState) => void;
}

export const PersistenciaModal: React.FC<PersistenciaModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onResetEmpty,
  onSeedVerification,
  onImportState,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'gdrive' | 'justificativa' | 'manutencao'>('justificativa');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('senai_github_pat') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('senai_github_gist_id') || '');
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; error?: string; gistUrl?: string }>({
    loading: false,
  });

  if (!isOpen) return null;

  const handleGitHubPush = async () => {
    if (!githubToken.trim()) {
      setSyncStatus({ loading: false, error: 'Insira um Token de Acesso Pessoal (PAT) do GitHub.' });
      return;
    }

    try {
      setSyncStatus({ loading: true });
      localStorage.setItem('senai_github_pat', githubToken.trim());
      const res = await syncGitHub({
        action: 'push',
        token: githubToken.trim(),
        gistId: gistId.trim() || undefined,
      });

      if (res.gistId) {
        setGistId(res.gistId);
        localStorage.setItem('senai_github_gist_id', res.gistId);
      }

      setSyncStatus({
        loading: false,
        message: 'Backup enviado com sucesso para o GitHub Gist!',
        gistUrl: res.gistUrl,
      });
    } catch (err: any) {
      setSyncStatus({ loading: false, error: err.message || 'Falha ao sincronizar com GitHub.' });
    }
  };

  const handleGitHubPull = async () => {
    if (!githubToken.trim() || !gistId.trim()) {
      setSyncStatus({ loading: false, error: 'Token do GitHub e ID do Gist são necessários para restaurar dados.' });
      return;
    }

    try {
      setSyncStatus({ loading: true });
      const res = await syncGitHub({
        action: 'pull',
        token: githubToken.trim(),
        gistId: gistId.trim(),
      });

      if (res.state) {
        onImportState(res.state);
      }

      setSyncStatus({
        loading: false,
        message: 'Inventário restaurado com sucesso a partir do GitHub Gist!',
      });
    } catch (err: any) {
      setSyncStatus({ loading: false, error: err.message || 'Falha ao recuperar dados do GitHub.' });
    }
  };

  // Google Drive File Export & Import
  const handleDownloadGDriveJSON = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SENAI_SP_Estoque_Backup_GDrive_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.artigos && Array.isArray(parsed.artigos)) {
          onImportState(parsed);
          setSyncStatus({ loading: false, message: 'Arquivo importado com sucesso no SISGE!' });
        } else {
          setSyncStatus({ loading: false, error: 'Estrutura de arquivo inválida.' });
        }
      } catch (err: any) {
        setSyncStatus({ loading: false, error: 'Erro ao processar JSON: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-2xl w-full my-6 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#111111] text-white p-5 flex items-center justify-between border-b-2 border-[#E30613]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E30613] flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Persistência de Dados em Nuvem &amp; Manutenção
              </h3>
              <p className="text-xs text-neutral-400">
                SISGE SENAI-SP · Estratégia de Armazenamento e Continuidade
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('justificativa')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'justificativa'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Justificativa Técnica (GitHub vs Drive)
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            Sincronização GitHub
          </button>
          <button
            onClick={() => setActiveTab('gdrive')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gdrive'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Google Drive &amp; Arquivo
          </button>
          <button
            onClick={() => setActiveTab('manutencao')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manutencao'
                ? 'border-[#E30613] text-[#E30613]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Banco Vazio / Verificação
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: Justificativa Técnica */}
          {activeTab === 'justificativa' && (
            <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="font-bold text-sm text-neutral-900 mb-2 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#E30613]" />
                  Por que a persistência via GitHub foi a escolha primária?
                </h4>
                <p className="mb-3">
                  Para uma aplicação industrial e didática de controle de estoques no padrão SENAI-SP, a persistência com a <strong>GitHub API (Gists / Repositories)</strong> em conjunto com o backend Node.js (arquivo <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-900">data/estoque-db.json</code>) foi escolhida frente à Google Drive API pelos seguintes motivos técnicos:
                </p>
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900 block mb-0.5">1. Versionamento Estruturado e Auditoria de Mudanças (Git Diffs)</strong>
                    <span>Diferente do Google Drive, que apenas sobrescreve arquivos binários ou exige APIs adicionais de histórico, o GitHub gera commits com diffs atômicos linha a linha de cada movimentação de estoque. Isso viabiliza auditorias completas de almoxarifado.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900 block mb-0.5">2. Resiliência de Autenticação em Ambientes Restritos</strong>
                    <span>O Google Drive exige fluxo OAuth 2.0 com janelas pop-up e consentimento de domínio que frequentemente sofrem bloqueio de cookies terceiros em iframes de teste. O GitHub REST API opera via Personal Access Token (PAT) ou Gist seguro, permitindo sincronização direta machine-to-machine.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900 block mb-0.5">3. Integração com Pipelines CI/CD e ERPs Industriais</strong>
                    <span>O estoque em formato JSON versionado no GitHub conecta-se diretamente a automações com GitHub Actions, Webhooks de chão de fábrica e sistemas acadêmicos do SENAI.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900 block mb-0.5">4. Suporte Ambidestro</strong>
                    <span>A aplicação oferece tanto a sincronização online via GitHub quanto a exportação/importação direta de arquivos formatados para guarda no Google Drive e a persistência em disco local do servidor.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px] pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Os dados atuais persistem no disco do servidor e sobrevivem a fechamentos de aba e reloads.</span>
              </div>
            </div>
          )}

          {/* TAB 2: Sincronização GitHub */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600">
                Sincronize o estado do estoque com um <strong>GitHub Gist Privado</strong> para manter uma cópia de segurança na nuvem acessível de qualquer dispositivo.
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Requer permissão de escopo "gist". O token é mantido estritamente seguro no navegador.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ID do Gist (Opcional - gerado automaticamente no primeiro envio)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 8f9a2b3c4d5e6f7a..."
                  value={gistId}
                  onChange={(e) => setGistId(e.target.value)}
                  className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#E30613]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGitHubPush}
                  disabled={syncStatus.loading}
                  className="px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-[#E30613]" />
                  <span>Enviar Backup (Push)</span>
                </button>
                <button
                  type="button"
                  onClick={handleGitHubPull}
                  disabled={syncStatus.loading || !gistId}
                  className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-neutral-600" />
                  <span>Restaurar do Gist (Pull)</span>
                </button>
              </div>

              {syncStatus.loading && (
                <div className="text-xs text-neutral-600 flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E30613]" />
                  <span>Conectando à API do GitHub...</span>
                </div>
              )}

              {syncStatus.message && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{syncStatus.message}</span>
                  </div>
                  {syncStatus.gistUrl && (
                    <div className="font-mono text-[11px] truncate">
                      URL: <a href={syncStatus.gistUrl} target="_blank" rel="noreferrer" className="underline">{syncStatus.gistUrl}</a>
                    </div>
                  )}
                </div>
              )}

              {syncStatus.error && (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{syncStatus.error}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Google Drive & Arquivo */}
          {activeTab === 'gdrive' && (
            <div className="space-y-4 text-xs text-neutral-700">
              <p>
                Você pode salvar o arquivo JSON diretamente no seu <strong>Google Drive</strong> ou sincronizar com o diretório local do computador:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#E30613]" />
                    <span>Download para Google Drive</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Gera um snapshot completo com data e hora para arquivamento no Google Drive da unidade SENAI.
                  </p>
                  <button
                    onClick={handleDownloadGDriveJSON}
                    className="w-full py-2 bg-[#E30613] hover:bg-[#B8000B] text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    Baixar Arquivo JSON
                  </button>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#111111]" />
                    <span>Restaurar do Google Drive</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Carregue um arquivo JSON salvo anteriormente para restaurar o acervo de materiais.
                  </p>
                  <label className="w-full py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5">
                    <span>Selecionar Arquivo JSON</span>
                    <input type="file" accept=".json" onChange={handleUploadJSON} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Manutenção de Banco (Vazio vs Verificação) */}
          {activeTab === 'manutencao' && (
            <div className="space-y-4 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <h4 className="font-bold text-sm text-neutral-900">
                  Gerenciamento da Base de Dados
                </h4>
                <p className="text-[11px] text-neutral-600">
                  Conforme a especificação, a aplicação suporta início com o banco de dados totalmente vazio e carga dos 10 materiais oficiais de verificação técnica.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reset to Empty */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                  <div className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-neutral-600" />
                    <span>Zerar Banco de Dados (Vazio)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Remove todos os artigos e movimentações, deixando o sistema totalmente limpo para novos testes a partir do zero.
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm('Confirma reinicializar o banco de dados totalmente vazio?')) {
                        await onResetEmpty();
                        onClose();
                      }
                    }}
                    className="w-full py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-800 font-bold rounded-lg text-xs border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Zerar Banco (Ficar Vazio)
                  </button>
                </div>

                {/* Seed 10 Verification Materials */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                  <div className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E30613]" />
                    <span>Carregar 10 Itens de Verificação</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Popula o banco com os 10 materiais industriais certificados pelo responsável técnico Carmen (ABNT 1045, Fresa CNC, CLP, etc.).
                  </p>
                  <button
                    onClick={async () => {
                      await onSeedVerification();
                      onClose();
                    }}
                    className="w-full py-2 bg-[#E30613] hover:bg-[#B8000B] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Carregar 10 Itens Oficiais
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-mono text-[11px]">
            Servidor Local: data/estoque-db.json ({currentState.artigos.length} itens)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white font-semibold rounded-lg cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
