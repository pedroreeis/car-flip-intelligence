'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, DollarSign, CheckCircle, Plus } from 'lucide-react';
import styles from '../../page.module.css';

export default function InventoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCost, setNewTaskCost] = useState('');

  // Sale Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [actualSalePrice, setActualSalePrice] = useState('');
  const [actualCosts, setActualCosts] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchWithAuth(`/api/evaluations/${id}`)
        .then(res => res.json())
        .then(data => {
          setEvaluation(data);
        });
    }
  }, [user, loading, id, router]);

  if (loading || !user || !evaluation) return <div className={styles.loading}>Carregando Detalhes...</div>;

  const handleStageChange = async (newStage: string) => {
    setEvaluation({ ...evaluation, inventoryStage: newStage });
    await fetchWithAuth(`/api/evaluations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryStage: newStage })
    });
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const updatedTasks = evaluation.tasks.map((t: any) => 
      t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
    );
    setEvaluation({ ...evaluation, tasks: updatedTasks });
    
    await fetchWithAuth(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !currentStatus })
    });
  };

  const handleAddTask = async () => {
    if (!newTaskTitle) return;
    
    setIsAddingTask(false);
    
    const res = await fetchWithAuth(`/api/evaluations/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, costEstimate: newTaskCost })
    });
    
    if (res.ok) {
      const addedTask = await res.json();
      setEvaluation({ ...evaluation, tasks: [...evaluation.tasks, addedTask] });
      setNewTaskTitle('');
      setNewTaskCost('');
    }
  };

  const handleGenerateAd = () => {
    const text = `Vende-se ${evaluation.vehicle?.brand} ${evaluation.vehicle?.model} ${evaluation.vehicle?.year}\n\n` +
      `Excelente estado de conservação.\n` +
      `Valor: R$ ${evaluation.estimatedSalePrice?.toLocaleString('pt-BR')}\n\n` +
      `Entre em contato para mais detalhes!`;
    navigator.clipboard.writeText(text);
    alert('Texto do anúncio copiado para a área de transferência!');
  };

  const handleSell = async () => {
    setIsSelling(true);
    try {
      const res = await fetchWithAuth(`/api/evaluations/${id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualSalePrice: parseFloat(actualSalePrice) || 0,
          actualCosts: parseFloat(actualCosts) || 0,
        })
      });
      if (res.ok) {
        alert('Venda registrada com sucesso! Parabéns pelo negócio.');
        router.push('/');
      } else {
        alert('Erro ao registrar venda.');
      }
    } finally {
      setIsSelling(false);
    }
  };

  const STAGES = ['PURCHASED', 'IN_REPAIR', 'IN_DETAILING', 'READY_FOR_SALE', 'ADVERTISED'];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/inventory">Gestão de Estoque</Link> &gt; <span>{evaluation.vehicle?.model}</span>
      </div>

      <div className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <h1>{evaluation.vehicle?.brand} {evaluation.vehicle?.model} - {evaluation.vehicle?.year}</h1>
          <p>Visão detalhada de preparação e custos operacionais.</p>
        </div>
      </div>

      <main className={styles.mainLayout} style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className={styles.feedColumn}>
          <div className={styles.sectionHeader}>
            <h2>Tarefas de Preparação (Pipeline)</h2>
            <button className={styles.heroButton} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setIsAddingTask(!isAddingTask)}>
              <Plus size={16} style={{ marginRight: '0.5rem' }}/> Nova Tarefa
            </button>
          </div>
          
          {isAddingTask && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <input type="text" placeholder="Descrição da tarefa" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="number" placeholder="Custo (R$)" value={newTaskCost} onChange={e => setNewTaskCost(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button onClick={handleAddTask} style={{ padding: '0.5rem 1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {evaluation.tasks?.map((task: any) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={() => handleToggleTask(task.id, task.isCompleted)}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-color)', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>{task.title}</h4>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  R$ {task.costEstimate?.toLocaleString()}
                </div>
              </div>
            ))}
            {!evaluation.tasks?.length && !isAddingTask && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma tarefa cadastrada.</div>
            )}
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.metricsPanel}>
            <h3>Mudar Estágio (Kanban)</h3>
            <select 
              value={evaluation.inventoryStage || 'PURCHASED'} 
              onChange={(e) => handleStageChange(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', marginTop: '1rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
            >
              <option value="PURCHASED">Comprado</option>
              <option value="IN_REPAIR">Oficina / Reparo</option>
              <option value="IN_DETAILING">Estética</option>
              <option value="READY_FOR_SALE">Pronto p/ Venda</option>
              <option value="ADVERTISED">Anunciado</option>
            </select>
          </div>

          <div className={styles.metricsPanel} style={{ marginTop: '2rem' }}>
            <h3>Resumo Financeiro</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Custo Inicial</span>
                <strong>R$ {evaluation.askingPrice?.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Custo Prep. Previsto</span>
                <strong>R$ {evaluation.tasks?.reduce((acc: number, t: any) => acc + (t.costEstimate||0), 0).toLocaleString() || 0}</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Venda Projetada</span>
                <span>R$ {evaluation.estimatedSalePrice?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '2rem' }}>
              <button 
                onClick={handleGenerateAd}
                style={{ width: '100%', padding: '1rem', background: 'var(--surface-color)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Copiar Texto do Anúncio
              </button>
              
              <button 
                onClick={() => {
                  setActualSalePrice(evaluation.estimatedSalePrice?.toString() || '');
                  setActualCosts(evaluation.tasks?.reduce((acc: number, t: any) => acc + (t.costEstimate||0), 0).toString() || '0');
                  setIsSellModalOpen(true);
                }}
                style={{ width: '100%', padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)' }}
              >
                💰 Registrar Venda
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sale Modal */}
      {isSellModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: 'var(--text-color)' }}>Fechar Negócio</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Confirme os valores reais para fechar esta avaliação.</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Valor Real de Venda (R$)</label>
              <input 
                type="number" 
                value={actualSalePrice} 
                onChange={(e) => setActualSalePrice(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Custos Extras / Preparação (R$)</label>
              <input 
                type="number" 
                value={actualCosts} 
                onChange={(e) => setActualCosts(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>*Sugestão baseada nas tarefas acima.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsSellModalOpen(false)}
                style={{ flex: 1, padding: '0.8rem', background: 'var(--surface-color)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-color)' }}
                disabled={isSelling}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSell}
                style={{ flex: 1, padding: '0.8rem', background: 'var(--success)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}
                disabled={isSelling}
              >
                {isSelling ? 'Salvando...' : 'Confirmar Venda'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
