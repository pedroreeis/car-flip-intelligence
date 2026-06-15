'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import styles from '../page.module.css';

export default function SalesReport() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Fetch only closed cases/sales
      fetch('/api/evaluations')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSales(data.filter(ev => ev.status === 'SOLD'));
          }
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className={styles.loading}>Carregando Relatório...</div>;

  const totalInvestment = sales.reduce((acc, curr) => acc + (curr.totalInvestment || 0) + (curr.closedCase?.actualCosts || 0), 0);
  const totalProfit = sales.reduce((acc, curr) => acc + (curr.closedCase?.actualProfit || 0), 0);
  const avgRoi = sales.length > 0 ? sales.reduce((acc, curr) => acc + (curr.closedCase?.actualRoi || 0), 0) / sales.length : 0;

  return (
    <div className={styles.container}>
      <main className={styles.mainLayout} style={{ gridTemplateColumns: '1fr', maxWidth: '1400px' }}>
        <div className={styles.feedColumn}>
          
          <div className={styles.sectionHeader}>
            <h2>Relatório Completo de Vendas ({sales.length} Negócios)</h2>
            <Link href="/" className={styles.heroButton}>Voltar ao Início</Link>
          </div>

          <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
             <div className={styles.kpiCard}>
               <div className={styles.kpiHeader}>
                 <span className={styles.kpiTitle}>Total Investido Histórico</span>
                 <DollarSign size={18} color="var(--text-muted)" />
               </div>
               <div className={styles.kpiValue}>
                 R$ {totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
               </div>
             </div>
             <div className={styles.kpiCard}>
               <div className={styles.kpiHeader}>
                 <span className={styles.kpiTitle}>Lucro Líquido Retirado</span>
                 <TrendingUp size={18} color="var(--success)" />
               </div>
               <div className={styles.kpiValue}>
                 R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
               </div>
             </div>
             <div className={styles.kpiCard}>
               <div className={styles.kpiHeader}>
                 <span className={styles.kpiTitle}>ROI Médio Consolidado</span>
                 <TrendingUp size={18} color="var(--primary-color)" />
               </div>
               <div className={styles.kpiValue}>
                 {avgRoi.toFixed(1)}%
               </div>
             </div>
          </div>
          
          <div className={styles.salesList} style={{ marginTop: '2rem' }}>
            <div className={`${styles.saleRow} ${styles.saleHeader}`}>
              <div>Veículo</div>
              <div>Investimento Base + Custos</div>
              <div>Venda Realizada</div>
              <div>Lucro / ROI</div>
              <div>Status</div>
            </div>
            
            {sales.length === 0 ? (
               <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>Nenhuma venda registrada no histórico.</div>
            ) : (
              sales.map(ev => (
                <div key={ev.id} className={styles.saleRow}>
                  <div className={styles.saleTitle}>
                    <CheckCircle size={16} color="var(--success)"/>
                    <div>
                      {ev.vehicle?.brand} {ev.vehicle?.model}
                      <div className={styles.saleDate}>{ev.closedCase?.createdAt ? new Date(ev.closedCase.createdAt).toLocaleDateString('pt-BR') : 'Data Indisponível'}</div>
                    </div>
                  </div>
                  <div className={styles.saleValue}>R$ {(ev.totalInvestment + (ev.closedCase?.actualCosts || 0)).toLocaleString()}</div>
                  <div className={styles.saleValue}>R$ {ev.closedCase?.actualSalePrice?.toLocaleString()}</div>
                  <div>
                    <div className={styles.saleProfit}>+ R$ {ev.closedCase?.actualProfit?.toLocaleString()}</div>
                    <div className={styles.saleDate}>{ev.closedCase?.actualRoi?.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>Vendido</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
