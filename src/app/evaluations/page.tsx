'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, MapPin } from 'lucide-react';
import styles from '../page.module.css';

export default function EvaluationsList() {
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
          if (Array.isArray(data)) {
            // Include everything except SOLD and IN_STOCK
            setEvaluations(data.filter(ev => ev.status === 'DRAFT' || ev.status === 'APPROVED' || ev.status === 'REJECTED'));
          }
        });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className={styles.loading}>Carregando Avaliações...</div>;

  return (
    <div className={styles.container}>
      <main className={styles.mainLayout} style={{ gridTemplateColumns: '1fr', maxWidth: '1400px' }}>
        <div className={styles.feedColumn}>
          
          <div className={styles.sectionHeader}>
            <h2>Gerenciar Avaliações ({evaluations.length})</h2>
            <Link href="/evaluation/new" className={styles.heroButton}>+ Nova Avaliação</Link>
          </div>
          
          <div className={styles.opportunitiesGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {evaluations.length === 0 ? (
              <div style={{gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                Nenhuma avaliação em aberto. Inicie um novo processo de due-diligence.
              </div>
            ) : (
              evaluations.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => router.push(`/evaluation/${ev.id}`)}
                  className={styles.oppCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.oppImage}>
                    <img src="/placeholder.png" alt="Carro" />
                    <div className={styles.oppBadges}>
                      <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                        Em Avaliação
                      </span>
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
                        <span className={styles.finValue}>{ev.attractivenessScore?.toFixed(0) || '--'}</span>
                      </div>
                    </div>
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
