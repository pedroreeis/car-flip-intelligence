'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Activity } from 'lucide-react';
import styles from '../page.module.css'; // Reusing dashboard styles

export default function Inventory() {
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const [stock, setStock] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchWithAuth('/api/evaluations')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStock(data.filter(ev => ev.status === 'IN_STOCK'));
          }
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className={styles.loading}>Carregando Estoque...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Início</Link> &gt; <span>Meu Estoque</span>
      </div>

      <div className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <h1>Veículos em Estoque</h1>
          <p>Gerencie a preparação e finalize a venda dos seus veículos adquiridos.</p>
        </div>
      </div>

      <main className={styles.mainLayout}>
        <div className={styles.feedColumn} style={{ width: '100%' }}>
          <div className={styles.opportunitiesGrid}>
            {stock.length === 0 ? (
              <div style={{gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                Nenhum veículo no estoque no momento. Adquira novas oportunidades.
              </div>
            ) : (
              stock.map(ev => (
                <Link key={ev.id} href={`/inventory/${ev.id}`} className={styles.oppCard}>
                  <div className={styles.oppImage}>
                    <img src="/placeholder.png" alt="Carro" />
                    <div className={styles.oppBadges}>
                      <span className={`${styles.badge} ${styles.badgeInfo}`}>Em Preparação</span>
                    </div>
                  </div>
                  <div className={styles.oppContent}>
                    <h3 className={styles.oppTitle}>{ev.vehicle?.brand} {ev.vehicle?.model}</h3>
                    <div className={styles.oppMeta}>
                      <div className={styles.oppMetaItem}>
                        <Car size={14} /> {ev.vehicle?.year}
                      </div>
                    </div>
                    
                    <div className={styles.oppFinancials}>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Custo de Aquisição</span>
                        <span className={styles.finValue}>R$ {ev.askingPrice?.toLocaleString()}</span>
                      </div>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Orçamento Prev.</span>
                        <span className={styles.finValue}>R$ {(ev.totalInvestment - (ev.askingPrice || 0)).toLocaleString()}</span>
                      </div>
                      <div className={styles.finBlock}>
                        <span className={styles.finLabel}>Venda Projetada</span>
                        <span className={`${styles.finValue} ${styles.highlight}`}>R$ {ev.estimatedSalePrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
