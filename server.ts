import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { InventoryState, Movimentacao, Artigo } from './src/types/inventory.js';
import { getEmptyInventoryState, getVerificationData } from './src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'estoque-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database file if not exists with the 10 official verification items
let currentState: InventoryState;

function loadState(): InventoryState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as InventoryState;
    }
  } catch (err) {
    console.error('Erro ao ler DB_FILE, recriando com dados de verificação:', err);
  }
  // Default to verification dataset ready for immediate audit and test
  const defaultData = getVerificationData();
  saveState(defaultData);
  return defaultData;
}

function saveState(state: InventoryState): void {
  try {
    state.ultimaAtualizacao = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    currentState = state;
  } catch (err) {
    console.error('Erro ao salvar DB_FILE:', err);
  }
}

currentState = loadState();

app.use(express.json({ limit: '15mb' }));

// Health and persistence info
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    sistema: 'SISGE SENAI-SP',
    persistencia: 'Disco Local Servidor Node.js + Sincronização Nuvem GitHub / Google Drive',
    responsavelTecnico: currentState.responsavelTecnico || 'Carmen',
    itensCadastrados: currentState.artigos.length,
    movimentacoesTotal: currentState.movimentacoes.length,
    ultimaAtualizacao: currentState.ultimaAtualizacao,
  });
});

// GET current inventory state
app.get('/api/inventory', (_req: Request, res: Response) => {
  res.json(currentState);
});

// PUT / POST full inventory state
app.post('/api/inventory', (req: Request, res: Response) => {
  const newState = req.body as InventoryState;
  if (!newState || !Array.isArray(newState.artigos)) {
    return res.status(400).json({ error: 'Formato de estado de inventário inválido.' });
  }
  saveState(newState);
  return res.json({ success: true, state: currentState });
});

// RESET to clean empty state (Banco vazio)
app.post('/api/inventory/reset', (_req: Request, res: Response) => {
  const emptyState = getEmptyInventoryState();
  saveState(emptyState);
  res.json({ success: true, message: 'Banco de dados reinicializado totalmente vazio.', state: currentState });
});

// SEED the 10 official verification items with technical responsible "Carmen"
app.post('/api/inventory/seed-verification', (_req: Request, res: Response) => {
  const verificationData = getVerificationData();
  saveState(verificationData);
  res.json({
    success: true,
    message: '10 materiais de verificação do SENAI-SP carregados com sucesso com responsável técnico Carmen.',
    state: currentState,
  });
});

// Atomic movement (ENTRADA or SAIDA)
app.post('/api/movimentacao', (req: Request, res: Response) => {
  const {
    artigoId,
    tipo,
    quantidade,
    documentoReferencia,
    origemDestino,
    responsavel,
    observacoes,
  } = req.body;

  if (!artigoId || !tipo || !quantidade || quantidade <= 0) {
    return res.status(400).json({ error: 'Dados obrigatórios de movimentação faltando ou quantidade inválida.' });
  }

  const artigoIndex = currentState.artigos.findIndex((a) => a.id === artigoId);
  if (artigoIndex === -1) {
    return res.status(404).json({ error: 'Artigo não localizado no cadastro.' });
  }

  const artigo = currentState.artigos[artigoIndex];
  const saldoAnterior = artigo.estoqueAtual;
  let saldoNovo = saldoAnterior;

  if (tipo === 'ENTRADA') {
    saldoNovo = saldoAnterior + Number(quantidade);
  } else if (tipo === 'SAIDA') {
    if (saldoAnterior < quantidade) {
      return res.status(400).json({
        error: `Saldo insuficiente! Estoque atual é de ${saldoAnterior} ${artigo.unidade}, menor que a saída solicitada de ${quantidade} ${artigo.unidade}.`,
      });
    }
    saldoNovo = saldoAnterior - Number(quantidade);
  } else {
    return res.status(400).json({ error: 'Tipo de movimentação inválido. Use ENTRADA ou SAIDA.' });
  }

  // Update artigo stock
  artigo.estoqueAtual = saldoNovo;
  currentState.artigos[artigoIndex] = artigo;

  // Create movement entry
  const movSeq = String(currentState.movimentacoes.length + 1).padStart(4, '0');
  const novaMov: Movimentacao = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    codigo: `MOV-${new Date().getFullYear()}-${movSeq}`,
    tipo,
    artigoId: artigo.id,
    artigoCodigo: artigo.codigo,
    artigoNome: artigo.nome,
    quantidade: Number(quantidade),
    saldoAnterior,
    saldoNovo,
    dataHora: new Date().toISOString(),
    documentoReferencia: documentoReferencia || 'S/N',
    origemDestino: origemDestino || (tipo === 'ENTRADA' ? 'Almoxarifado' : 'Oficina'),
    responsavel: responsavel || currentState.responsavelTecnico || 'Carmen',
    observacoes: observacoes || '',
  };

  currentState.movimentacoes.unshift(novaMov);
  saveState(currentState);

  res.json({
    success: true,
    artigo,
    movimentacao: novaMov,
    state: currentState,
  });
});

// GitHub Persistence Sync Endpoint
app.post('/api/sync/github', async (req: Request, res: Response) => {
  const { action, token, gistId } = req.body; // action: 'push' | 'pull'

  if (!token) {
    return res.status(400).json({ error: 'Token de Acesso Pessoal (PAT) do GitHub é obrigatório para sincronização.' });
  }

  try {
    const filename = 'senai_sp_estoque_backup.json';

    if (action === 'push') {
      const payload = {
        description: 'SISGE SENAI-SP - Backup Oficial do Controle de Estoque',
        public: false,
        files: {
          [filename]: {
            content: JSON.stringify(currentState, null, 2),
          },
        },
      };

      const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
      const method = gistId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'SISGE-SENAI-SP-App',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Falha na API do GitHub: ${errorText}` });
      }

      const data = await response.json() as any;
      res.json({
        success: true,
        message: 'Inventário sincronizado com sucesso no GitHub Gist!',
        gistId: data.id,
        gistUrl: data.html_url,
        updatedAt: data.updated_at,
      });
    } else if (action === 'pull') {
      if (!gistId) {
        return res.status(400).json({ error: 'ID do Gist é obrigatório para puxar (pull) dados do GitHub.' });
      }

      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'SISGE-SENAI-SP-App',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Gist não encontrado no GitHub: ${errorText}` });
      }

      const gist = await response.json() as any;
      const fileData = gist.files[filename] || Object.values(gist.files)[0] as any;
      if (!fileData || !fileData.content) {
        return res.status(400).json({ error: 'Arquivo de backup não encontrado no Gist informado.' });
      }

      const pulledState = JSON.parse(fileData.content) as InventoryState;
      saveState(pulledState);

      res.json({
        success: true,
        message: 'Dados recuperados do GitHub com sucesso!',
        state: currentState,
      });
    } else {
      res.status(400).json({ error: 'Ação de sincronização inválida (use push ou pull).' });
    }
  } catch (err: any) {
    console.error('Erro na sincronização GitHub:', err);
    res.status(500).json({ error: err.message || 'Erro interno na comunicação com o GitHub.' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SISGE SENAI-SP] Servidor rodando na porta ${PORT} (${isProduction ? 'produção' : 'desenvolvimento'})`);
  });
}

startServer();
