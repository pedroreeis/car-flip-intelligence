'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, CheckCircle, Car, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import styles from '@/app/evaluation/new/wizard.module.css';
import pageStyles from '@/app/page.module.css';

export default function InventoryManagement({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [actualSalePrice, setActualSalePrice] = useState('');

  const fetchExpenses = async () => {
    const res = await fetch(`/api/evaluations/${resolvedParams.id}/expenses`);
    const json = await res.json();
    setExpenses(json);
  };

  useEffect(() => {
    fetch(`/api/evaluations/${resolvedParams.id}`)
      .then(res => res.json())
      .then(setData);
    
    fetchExpenses();
  }, [resolvedParams.id]);

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    try {
      await fetch(`/api/evaluations/${resolvedParams.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      setNewExpense({ description: '', amount: '' });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const submitClose = async () => {
    if (!actualSalePrice) return alert('Informe o preço de venda');
    try {
      const res = await fetch(`/api/evaluations/${resolvedParams.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualSalePrice })
      });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Erro ao registrar venda');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div style={{ color: '#fff', padding: '2rem' }}>Carregando dados do veículo...</div>;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCost = (data.askingPrice || 0) + totalExpenses;

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.header}>
           <h2><Car size={24}/> {data.vehicle?.brand} {data.vehicle?.model}</h2>
           <p>Gestão de Estoque e Preparação</p>
        </div>

        <div className={styles.stepContent}>
          <div className={pageStyles.kpiGrid} style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className={pageStyles.kpiCard}>
              <div className={pageStyles.kpiHeader}>
                <span className={pageStyles.kpiTitle}>Custo de Aquisição</span>
                <DollarSign size={18} color="var(--text-muted)" />
              </div>
              <div className={pageStyles.kpiValue}>R$ {(data.askingPrice || 0).toLocaleString()}</div>
            </div>
            
            <div className={pageStyles.kpiCard}>
              <div className={pageStyles.kpiHeader}>
                <span className={pageStyles.kpiTitle}>Total em Preparação</span>
                <AlertCircle size={18} color="#eab308" />
              </div>
              <div className={pageStyles.kpiValue} style={{ color: '#eab308' }}>R$ {totalExpenses.toLocaleString()}</div>
            </div>

            <div className={pageStyles.kpiCard} style={{ background: 'var(--primary-color)' }}>
              <div className={pageStyles.kpiHeader}>
                <span className={pageStyles.kpiTitle} style={{ color: '#fff' }}>Custo Total Acumulado</span>
                <TrendingUp size={18} color="#fff" />
              </div>
              <div className={pageStyles.kpiValue} style={{ color: '#fff' }}>R$ {totalCost.toLocaleString()}</div>
            </div>
          </div>
          
          <h3 style={{ margin: '0 0 1rem 0' }}>Histórico de Preparação</h3>
          
          {/* Tabela de Despesas */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
             {expenses.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma despesa registrada.</div>
             ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>Descrição</th>
                      <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', width: '150px' }}>Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp, i) => (
                      <tr key={i}>
                        <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>{exp.description}</td>
                        <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>{exp.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>

          {/* Form Nova Despesa */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div style={{ flex: 1 }}>
              <label>Nova Despesa / Reparo</label>
              <input 
                type="text" 
                className={styles.input} 
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="Ex: Polimento, Higienização, Troca de Óleo..."
              />
            </div>
            <div style={{ width: '200px' }}>
              <label>Custo (R$)</label>
              <input 
                type="number" 
                className={styles.input} 
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                placeholder="Valor"
              />
            </div>
            <button onClick={addExpense} className={styles.btnSecondary} style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <PlusCircle size={18}/> Adicionar
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '2rem 0' }} />

          {/* Sessão de Fechamento de Venda */}
          <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
             <h3 style={{ margin: '0 0 1rem 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
               <CheckCircle size={24}/> Registrar Venda Realizada
             </h3>
             <p style={{ fontSize: '0.95rem', color: '#14532d', marginBottom: '1.5rem', lineHeight: '1.5' }}>
               Parabéns! Registre o valor final da negociação. O sistema irá subtrair automaticamente o Custo de Aquisição (R$ {(data.askingPrice || 0).toLocaleString()}) e os Custos de Preparação (R$ {totalExpenses.toLocaleString()}) para contabilizar seu lucro líquido no Dashboard de Investimentos.
             </p>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
               <div style={{ flex: 1, maxWidth: '400px' }}>
                 <label style={{ color: '#166534', fontWeight: 'bold' }}>Valor de Fechamento da Venda (R$)</label>
                 <input 
                   type="number" 
                   className={styles.input} 
                   value={actualSalePrice}
                   onChange={e => setActualSalePrice(e.target.value)}
                   placeholder="Ex: 45000"
                   style={{ fontSize: '1.2rem', padding: '1rem' }}
                 />
               </div>
               <button onClick={submitClose} className={styles.btnSuccess} disabled={!actualSalePrice} style={{ height: '54px', padding: '0 2rem', fontSize: '1rem', fontWeight: 'bold' }}>
                 Consolidar e Encerrar Caso
               </button>
             </div>
          </div>

        </div>
        
        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          <Link href="/inventory" className={styles.btnSecondary}>Voltar ao Estoque</Link>
        </div>
      </div>
    </div>
  );
}
