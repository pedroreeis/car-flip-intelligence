'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Car, CheckCircle, BarChart3, TrendingDown, MapPin, ChevronRight, Activity, Search, Trophy } from 'lucide-react';
import styles from './page.module.css';

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

  // Calculando KPIs Financeiros
  const activeOps = evaluations.filter(e => e.status !== 'SOLD' && e.status !== 'REJECTED');
  const soldOps = evaluations.filter(e => e.status === 'SOLD');
  
  const totalApplied = activeOps.reduce((acc, curr) => acc + (curr.totalInvestment || 0), 0);
  const totalProfitRealized = soldOps.reduce((acc, curr) => acc + (curr.closedCase?.actualProfit || 0), 0);
  const avgRoi = soldOps.length > 0 
    ? soldOps.reduce((acc, curr) => acc + (curr.closedCase?.actualRoi || 0), 0) / soldOps.length
    : 0;

  return (
    <div className={styles.container}>
      
      <main className={styles.mainLayout}>
        <div className={styles.feedColumn}>
          
          {/* KPI Dashboard */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiTitle}>Lucro Realizado</span>
                <TrendingUp size={18} color="var(--success)" />
              </div>
              <div className={styles.kpiValue}>
                R$ {totalProfitRealized.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </div>
              <div className={styles.kpiFooter}>
                <span className={styles.trendUp}>+12.5%</span> vs mês passado
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiTitle}>Capital em Estoque</span>
                <Car size={18} color="var(--text-muted)" />
              </div>
              <div className={styles.kpiValue}>
                R$ {totalApplied.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </div>
              <div className={styles.kpiFooter}>
                Em {evaluations.filter(e => e.status === 'IN_STOCK').length} veículos
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiTitle}>ROI Médio</span>
                <BarChart3 size={18} color="var(--primary-color)" />
              </div>
              <div className={styles.kpiValue}>
                {avgRoi.toFixed(1)}%
              </div>
              <div className={styles.kpiFooter}>
                Baseado em {soldOps.length} vendas
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiTitle}>Negócios Fechados</span>
                <CheckCircle size={18} color="var(--success)" />
              </div>
              <div className={styles.kpiValue}>
                {soldOps.length}
              </div>
              <div className={styles.kpiFooter}>
                <span className={styles.trendUp}>Alto desempenho</span>
              </div>
            </div>
          </div>

          {/* Oportunidades Section */}
          <div className={styles.sectionHeader}>
            <h2>Oportunidades de Compra ({activeOps.length})</h2>
            <Link href="/evaluation/new" className={styles.viewAll}>+ Avaliar Veículo</Link>
          </div>
          
          <div className={styles.opportunitiesGrid}>
            {activeOps.length === 0 ? (
              <div style={{gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                Nenhuma oportunidade ativa. Comece a avaliar o mercado.
              </div>
            ) : (
              activeOps.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => router.push(ev.status === 'IN_STOCK' ? `/inventory/${ev.id}` : `/evaluation/${ev.id}`)}
                  className={styles.oppCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.oppImage}>
                    {/* Placeholder local universal */}
                    <img src="/placeholder.png" alt="Carro" />
                    <div className={styles.oppBadges}>
                      <span className={`${styles.badge} ${ev.status === 'IN_STOCK' ? styles.badgeInfo : styles.badgeNeutral}`}>
                        {ev.status === 'IN_STOCK' ? 'No Estoque' : 'Em Avaliação'}
                      </span>
                      {ev.recommendation?.includes('ALTO RISCO') && (
                        <span className={`${styles.badge} ${styles.badgeDanger}`}>Alto Risco</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.oppContent}>
                    <h3 className={styles.oppTitle}>{ev.vehicle?.brand} {ev.vehicle?.model}</h3>
                    <div className={styles.oppMeta}>
                      <div className={styles.oppMetaItem}>
                        <Car size={14} /> {ev.vehicle?.year}
                      </div>
                      {ev.adLink && (
                        <div className={styles.oppMetaItem}>
                          <a 
                            href={ev.adLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}
                          >
                            Ver Anúncio
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.oppFinancials}>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Preço Pedido</span>
                        <span className={styles.finValue}>R$ {ev.askingPrice?.toLocaleString()}</span>
                      </div>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Score CFI</span>
                        <span className={styles.finValue}>{ev.attractivenessScore?.toFixed(0)}</span>
                      </div>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Lucro Est.</span>
                        <span className={`${styles.finValue} ${styles.highlight}`}>R$ {ev.estimatedProfit?.toLocaleString()}</span>
                      </div>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>ROI Est.</span>
                        <span className={`${styles.finValue} ${styles.highlight}`}>{ev.estimatedRoi?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Histórico de Vendas */}
          <div className={styles.sectionHeader} style={{marginTop: '2rem'}}>
            <h2>Últimas Vendas Concluídas</h2>
            <Link href="/sales" className={styles.viewAll}>Ver Relatório Completo</Link>
          </div>

          <div className={styles.salesList}>
            <div className={`${styles.saleRow} ${styles.saleHeader}`}>
              <div>Veículo</div>
              <div>Investimento</div>
              <div>Venda</div>
              <div>Lucro / ROI</div>
              <div>Status</div>
            </div>
            
            {soldOps.length === 0 ? (
               <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>Nenhuma venda registrada ainda.</div>
            ) : (
              soldOps.map(ev => (
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

        {/* Sidebar Inteligente */}
        <aside className={styles.sidebarColumn}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}><Activity size={18}/> Nossa Plataforma</h3>
            <ul className={styles.widgetList}>
              <li className={styles.widgetListItem}>
                <span className={styles.widgetItemName}>Tópicos de Avaliação</span>
                <span className={styles.widgetItemValue}>{evaluations.length}</span>
              </li>
              <li className={styles.widgetListItem}>
                <span className={styles.widgetItemName}>Negócios Concluídos</span>
                <span className={styles.widgetItemValue}>{soldOps.length}</span>
              </li>
              <li className={styles.widgetListItem}>
                <span className={styles.widgetItemName}>Membro Mais Novo</span>
                <span className={styles.widgetItemValue}>@{user.name.split(' ')[0]}</span>
              </li>
            </ul>
          </div>
          
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}><Trophy size={18}/> Ranking de Investidores</h3>
            <ul className={styles.widgetList}>
              <li className={styles.widgetListItem}>
                <span className={styles.widgetItemName}>@{user.name}</span>
                <span className={styles.widgetItemValue}>{soldOps.length} vendas</span>
              </li>
            </ul>
          </div>
        </aside>

      </main>
    </div>
  );
}
