'use client';
import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Plus, Trash2 } from 'lucide-react';
import styles from '@/app/evaluation/new/wizard.module.css';

export default function KnowledgeBaseManagement() {
  const { fetchWithAuth } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ category: 'BRAND', value: '', context: '' });

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetchWithAuth('/api/kb');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newItem.value) return;
    await fetchWithAuth('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    setNewItem({ ...newItem, value: '', context: '' });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este termo?')) return;
    await fetchWithAuth(`/api/kb?id=${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fff', borderRadius: '8px' }}>
        <Link href="/tools" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
          &larr; Voltar para Ferramentas
        </Link>
      </div>

      <div className={styles.wizardCard}>
        <div className={styles.header}>
           <h2><Database size={24}/> Base de Conhecimento</h2>
           <p>Gerencie termos para preenchimento automático (Marcas, Modelos, Tipos de Despesa)</p>
        </div>

        <div className={styles.stepContent}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <label>Categoria</label>
              <select 
                className={styles.input} 
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
              >
                <option value="BRAND">Marca (Ex: Volkswagen)</option>
                <option value="MODEL">Modelo (Ex: Golf GTI)</option>
                <option value="EXPENSE_TYPE">Tipo de Despesa (Ex: Polimento)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Novo Termo</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Digite o termo padronizado"
                value={newItem.value}
                onChange={e => setNewItem({...newItem, value: e.target.value})}
              />
            </div>
            {newItem.category === 'MODEL' && (
              <div style={{ flex: 1 }}>
                <label>Contexto (Marca)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ex: Volkswagen"
                  value={newItem.context}
                  onChange={e => setNewItem({...newItem, context: e.target.value})}
                />
              </div>
            )}
            <button onClick={handleAdd} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
              <Plus size={18} /> Adicionar
            </button>
          </div>

          {loading ? (
            <div>Carregando termos...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>Categoria</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>Contexto</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>Termo Padronizado</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>Uso</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', width: '80px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum termo cadastrado na base de conhecimento.
                    </td>
                  </tr>
                )}
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{item.context || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.value}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.usageCount}x</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                        title="Remover"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
