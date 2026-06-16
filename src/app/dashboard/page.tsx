'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, DollarSign, Clock, Activity } from 'lucide-react';
import styles from '../page.module.css';

export default function Dashboard() {
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchWithAuth('/api/evaluations')
        .then(res => res.json())
        .then(data => {
           if(Array.isArray(data)) setEvaluations(data);
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className={styles.loading}>Carregando Dashboard...</div>;

  const activeOps = evaluations.filter(e => e.status !== 'SOLD' && e.status !== 'REJECTED');
  const inStockOps = evaluations.filter(e => e.status === 'IN_STOCK');
  const soldOps = evaluations.filter(e => e.status === 'SOLD');

  const capitalAlocado = inStockOps.reduce((acc, curr) => acc + (curr.totalInvestment || 0), 0);
  
  const avgRoi = soldOps.length > 0 
    ? soldOps.reduce((acc, curr) => acc + (curr.closedCase?.actualRoi || 0), 0) / soldOps.length
    : 0;

  const lucroProjetado = activeOps.reduce((acc, curr) => acc + (curr.estimatedProfit || 0), 0);

  const agingMedio = soldOps.length > 0
    ? soldOps.reduce((acc, curr) => {
        const start = new Date(curr.createdAt).getTime();
        const end = curr.closedCase?.createdAt ? new Date(curr.closedCase.createdAt).getTime() : new Date(curr.updatedAt).getTime();
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        return acc + (days > 0 ? days : 1);
      }, 0) / soldOps.length
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--primary-color)' }}>Início</Link> &gt; <span>Dashboard Analítico</span>
      </div>

      <div className={styles.heroHeader} style={{ marginBottom: '2rem' }}>
        <div className={styles.heroContent}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-color)' }}>Visão Executiva</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas de alta performance para controle e rentabilidade do seu estoque.</p>
        </div>
      </div>

      <main className={styles.mainLayout} style={{ gridTemplateColumns: '1fr' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div className={styles.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(8, 172, 252, 0.1)', borderRadius: '50%', color: 'var(--primary-color)' }}>
                <DollarSign size={24} />
              </div>
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Capital Alocado</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>R$ {capitalAlocado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Em {inStockOps.length} veículos ativos</div>
          </div>

          <div className={styles.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(52, 199, 89, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>ROI Médio Realizado</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{avgRoi.toFixed(1)}%</div>
            <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Nas últimas {soldOps.length} vendas</div>
          </div>

          <div className={styles.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(232, 164, 8, 0.1)', borderRadius: '50%', color: 'var(--secondary-color)' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Lucro Projetado</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>R$ {lucroProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Em {activeOps.length} oportunidades no pipeline</div>
          </div>

          <div className={styles.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(142, 142, 147, 0.1)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Aging Médio (Giro)</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{agingMedio.toFixed(0)} dias</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Média de tempo da compra à venda</div>
          </div>

        </div>

        <div className={styles.feedColumn}>
          <div className={styles.sectionHeader}>
            <h2 style={{ color: 'var(--text-color)' }}>Histórico de Operações Recentes</h2>
          </div>
          <div className={styles.panelSolid} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            {soldOps.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma venda registrada ainda.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Veículo</th>
                    <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Data da Venda</th>
                    <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Lucro</th>
                    <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {soldOps.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 'bold', color: 'var(--text-color)' }}>{ev.vehicle?.brand} {ev.vehicle?.model}</td>
                      <td style={{ padding: '1rem 0', color: 'var(--text-color)' }}>
                        {ev.closedCase?.createdAt ? new Date(ev.closedCase.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td style={{ padding: '1rem 0', color: 'var(--success)', fontWeight: 'bold' }}>R$ {ev.closedCase?.actualProfit?.toLocaleString()}</td>
                      <td style={{ padding: '1rem 0', fontWeight: 'bold', color: 'var(--text-color)' }}>{ev.closedCase?.actualRoi?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
