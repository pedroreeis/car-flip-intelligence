'use client';
import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { PrintableReport } from '@/components/PrintableReport';
import { PlusCircle, CheckCircle, Car, DollarSign, TrendingUp, AlertCircle, FileText, Copy, Printer } from 'lucide-react';
import styles from '@/app/evaluation/new/wizard.module.css';
import pageStyles from '@/app/page.module.css';

export default function InventoryManagement({ params }: { params: Promise<{ id: string }> }) {
  const { fetchWithAuth } = useAuth();

  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [kbExpenses, setKbExpenses] = useState<any[]>([]);
  
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [actualSalePrice, setActualSalePrice] = useState('');
  
  const [adCopy, setAdCopy] = useState('');
  const [generatingAd, setGeneratingAd] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laudo_CFI_${data?.vehicle?.brand}_${data?.vehicle?.model}`,
  });

  const fetchExpenses = async () => {
    const res = await fetchWithAuth(`/api/evaluations/${resolvedParams.id}/expenses`);
    const json = await res.json();
    setExpenses(json);
  };

  const fetchKb = async () => {
    const res = await fetchWithAuth('/api/kb?category=EXPENSE_TYPE');
    const json = await res.json();
    if (Array.isArray(json)) setKbExpenses(json);
  };

  useEffect(() => {
    fetchWithAuth(`/api/evaluations/${resolvedParams.id}`)
      .then(res => res.json())
      .then(setData);
    
    fetchExpenses();
    fetchKb();
  }, [resolvedParams.id]);

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    try {
      await fetchWithAuth(`/api/evaluations/${resolvedParams.id}/expenses`, {
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
      const res = await fetchWithAuth(`/api/evaluations/${resolvedParams.id}/close`, {
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

  const generateAdCopy = async () => {
    setGeneratingAd(true);
    try {
      const res = await fetchWithAuth(`/api/evaluations/${resolvedParams.id}/ad-copy`);
      const data = await res.json();
      if (data.copy) {
        setAdCopy(data.copy);
      }
    } catch (error) {
      console.error('Error generating ad copy', error);
    }
    setGeneratingAd(false);
  };

  if (!data) return <div style={{ color: '#fff', padding: '2rem' }}>Carregando dados do veículo...</div>;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCost = (data.askingPrice || 0) + totalExpenses;

  return (
    <div className={styles.container}>
      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} data={data} />
      </div>

      <div className={styles.wizardCard}>
        <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
             <h2><Car size={24}/> {data.vehicle?.brand} {data.vehicle?.model}</h2>
             <p>Gestão de Estoque e Preparação</p>
           </div>
           <button onClick={() => handlePrint()} className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Printer size={18} /> Exportar Laudo (PDF)
           </button>
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

          {data.images && data.images.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Fotos do Veículo</h3>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {data.images.map((url: string, index: number) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Foto ${index + 1}`} 
                    style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  />
                ))}
              </div>
            </div>
          )}
          
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
                list="kb-expenses"
                className={styles.input} 
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="Ex: Polimento, Higienização, Troca de Óleo..."
              />
              <datalist id="kb-expenses">
                {kbExpenses.map(kb => (
                  <option key={kb.id} value={kb.value} />
                ))}
              </datalist>
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

          {/* Sessão de Marketing e Anúncios */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
             <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
               <FileText size={24}/> Marketing & Anúncios
             </h3>
             <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
               Utilize os dados do laudo técnico (estrutura, mecânica e documentação) para gerar automaticamente um texto publicitário persuasivo (Copy) no padrão OLX / Webmotors.
             </p>
             
             {!adCopy ? (
               <button onClick={generateAdCopy} disabled={generatingAd} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 {generatingAd ? 'Gerando Copy...' : 'Gerar Copy Profissional'}
               </button>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <textarea 
                   value={adCopy}
                   onChange={(e) => setAdCopy(e.target.value)}
                   style={{ width: '100%', height: '200px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.5', resize: 'vertical' }}
                 />
                 <button 
                   onClick={() => navigator.clipboard.writeText(adCopy)}
                   className={styles.btnSecondary} 
                   style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                 >
                   <Copy size={16} /> Copiar para Área de Transferência
                 </button>
               </div>
             )}
          </div>

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
