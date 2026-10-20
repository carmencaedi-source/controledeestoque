import { InventoryState, Movimentacao, Artigo } from '../types/inventory';
import { getVerificationData, getEmptyInventoryState } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'senai_sp_estoque_cache_v1';

export async function fetchInventoryState(): Promise<InventoryState> {
  try {
    const res = await fetch('/api/inventory');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backend indisponível, recorrendo ao cache local:', err);
  }

  // Fallback to localStorage
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  // Default initial fallback
  const initial = getVerificationData();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export async function saveInventoryState(state: InventoryState): Promise<InventoryState> {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.ok) {
      const data = await res.json();
      return data.state || state;
    }
  } catch (err) {
    console.warn('Erro ao salvar no servidor, mantido em cache local:', err);
  }
  return state;
}

export async function registerMovimentacao(payload: {
  artigoId: string;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  documentoReferencia: string;
  origemDestino: string;
  responsavel: string;
  observacoes: string;
}): Promise<{ artigo: Artigo; movimentacao: Movimentacao; state: InventoryState }> {
  try {
    const res = await fetch('/api/movimentacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erro ${res.status} ao registrar movimentação.`);
    }

    const data = await res.json();
    if (data.state) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
    }
    return data;
  } catch (err: any) {
    console.warn('Movimentação local com fallback de rede:', err.message);
    throw err;
  }
}

export async function resetDatabaseEmpty(): Promise<InventoryState> {
  try {
    const res = await fetch('/api/inventory/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
      return data.state;
    }
  } catch (err) {
    console.warn('Reset local:', err);
  }
  const empty = getEmptyInventoryState();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(empty));
  return empty;
}

export async function seedVerificationData(): Promise<InventoryState> {
  try {
    const res = await fetch('/api/inventory/seed-verification', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
      return data.state;
    }
  } catch (err) {
    console.warn('Seed local:', err);
  }
  const verified = getVerificationData();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(verified));
  return verified;
}

export async function syncGitHub(payload: {
  action: 'push' | 'pull';
  token: string;
  gistId?: string;
}): Promise<{ success: boolean; message: string; gistId?: string; gistUrl?: string; state?: InventoryState }> {
  const res = await fetch('/api/sync/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro na sincronização com GitHub');
  }

  const data = await res.json();
  if (data.state) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
  }
  return data;
}
