'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Clock, DollarSign } from 'lucide-react';
import styles from '../page.module.css';

const STAGES = [
  { id: 'PURCHASED', label: 'Comprado' },
  { id: 'IN_REPAIR', label: 'Oficina / Reparo' },
  { id: 'IN_DETAILING', label: 'Estética' },
  { id: 'READY_FOR_SALE', label: 'Pronto p/ Venda' },
  { id: 'ADVERTISED', label: 'Anunciado' }
];

export default function InventoryKanban() {
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

  if (loading || !user) return <div className={styles.loading}>Carregando Kanban...</div>;

  const getDaysInStock = (createdAt: string) => {
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Início</Link> &gt; <span>Gestão de Estoque (Kanban)</span>
      </div>

      <div className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <h1>Pipeline de Veículos</h1>
          <p>Acompanhe e mova seus veículos por cada fase de preparação e venda.</p>
        </div>
      </div>

      <main className={styles.mainLayout} style={{ gridTemplateColumns: '1fr', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '1rem', minWidth: '1000px', paddingBottom: '2rem' }}>
          {STAGES.map(stage => {
            const stageItems = stock.filter(ev => (ev.inventoryStage || 'PURCHASED') === stage.id);

            return (
              <div key={stage.id} style={{ flex: 1, backgroundColor: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{stage.label}</h3>
                  <span className={styles.badge} style={{ backgroundColor: 'var(--primary-color)', color: '#000' }}>{stageItems.length}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stageItems.map(ev => (
                    <div 
                      key={ev.id} 
                      className={styles.oppCard} 
                      style={{ cursor: 'pointer', padding: '1rem', margin: 0, border: '1px solid rgba(0,0,0,0.1)' }}
                      onClick={() => router.push(`/inventory/${ev.id}`)}
                    >
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car size={14} /> {ev.vehicle?.brand} {ev.vehicle?.model}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span><Clock size={12} /> {getDaysInStock(ev.createdAt)} dias</span>
                        <span>{ev.vehicle?.year}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <DollarSign size={12} /> {(ev.estimatedSalePrice || 0).toLocaleString()} proj.
                      </div>
                    </div>
                  ))}
                  {stageItems.length === 0 && (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
